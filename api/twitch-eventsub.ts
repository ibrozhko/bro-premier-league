import { createHmac, timingSafeEqual } from "node:crypto";
import webpush from "web-push";
import {
  requireSeason2Env,
  supabaseDelete,
  supabaseGet,
  supabasePost,
  type ApiRequest,
  type Season2DbPushSubscription,
} from "./_utils/season2Api.js";

type EventSubRequest = ApiRequest & {
  on?: (event: "data" | "end" | "error", callback: (chunk?: Buffer) => void) => void;
};

type EventSubResponse = {
  status: (code: number) => EventSubResponse;
  json: (body: unknown) => void;
  send?: (body: string) => void;
  end?: (body?: string) => void;
  setHeader?: (name: string, value: string) => void;
};

type EventSubPayload = {
  challenge?: string;
  subscription?: {
    type?: string;
    status?: string;
  };
  event?: {
    id?: string;
    broadcaster_user_login?: string;
    broadcaster_user_name?: string;
  };
};

type EventSubMessageRow = {
  message_id: string;
};

const notificationType = "notification";
const verificationType = "webhook_callback_verification";
const revocationType = "revocation";
const twitchMessageIdHeader = "twitch-eventsub-message-id";
const twitchMessageTimestampHeader = "twitch-eventsub-message-timestamp";
const twitchMessageTypeHeader = "twitch-eventsub-message-type";
const twitchMessageSignatureHeader = "twitch-eventsub-message-signature";
const twitchSubscriptionTypeHeader = "twitch-eventsub-subscription-type";
const allowedChannels = ["bpl2026", "bpl2027"];

export default async function handler(request: EventSubRequest, response: EventSubResponse) {
  try {
    requireSeason2Env();

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const secret = process.env.TWITCH_EVENTSUB_SECRET;
    if (!secret) {
      response.status(500).json({ error: "Missing Twitch EventSub secret." });
      return;
    }

    const rawBody = await readRawBody(request);
    if (!verifyTwitchSignature(request, rawBody, secret)) {
      response.status(403).json({ error: "Invalid Twitch EventSub signature." });
      return;
    }

    const messageType = getHeader(request, twitchMessageTypeHeader);
    const payload = JSON.parse(rawBody) as EventSubPayload;

    if (messageType === verificationType) {
      sendText(response, payload.challenge ?? "");
      return;
    }

    if (messageType === revocationType) {
      response.status(200).json({ ok: true, revoked: payload.subscription?.status ?? "unknown" });
      return;
    }

    if (messageType !== notificationType || getHeader(request, twitchSubscriptionTypeHeader) !== "stream.online") {
      response.status(200).json({ ok: true, ignored: true });
      return;
    }

    const streamId = payload.event?.id?.trim() ?? "";
    const channelLogin = payload.event?.broadcaster_user_login?.trim().toLowerCase() ?? "";
    if (!streamId || !allowedChannels.includes(channelLogin)) {
      response.status(200).json({ ok: true, ignored: true });
      return;
    }

    const messageId = getHeader(request, twitchMessageIdHeader);
    const duplicate = await rememberEventSubMessage(messageId, streamId, channelLogin);
    if (duplicate) {
      response.status(200).json({ ok: true, duplicate: true });
      return;
    }

    configureWebPush();
    const rows = await supabaseGet<Season2DbPushSubscription[]>("/season2_push_subscriptions?select=*");
    const result = rows.length
      ? await sendPushNotifications(rows, {
        title: "BPL Season 2 LIVE",
        body: `${payload.event?.broadcaster_user_name ?? channelLogin} вже в ефірі. Заходь дивитись трансляцію.`,
        url: "/",
      })
      : { sent: 0, removed: 0 };

    response.status(200).json({ ok: true, push: result });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Twitch EventSub error." });
  }
}

async function readRawBody(request: EventSubRequest) {
  if (typeof request.body === "string") return request.body;
  if (request.body && typeof request.body === "object") return JSON.stringify(request.body);
  if (!request.on) return "";

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    request.on?.("data", chunk => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    request.on?.("end", () => resolve());
    request.on?.("error", () => reject(new Error("Failed to read Twitch EventSub body.")));
  });

  return Buffer.concat(chunks).toString("utf8");
}

function verifyTwitchSignature(request: EventSubRequest, rawBody: string, secret: string) {
  const messageId = getHeader(request, twitchMessageIdHeader);
  const timestamp = getHeader(request, twitchMessageTimestampHeader);
  const signature = getHeader(request, twitchMessageSignatureHeader);
  if (!messageId || !timestamp || !signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(`${messageId}${timestamp}${rawBody}`).digest("hex")}`;
  return safeEqual(signature, expected);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function rememberEventSubMessage(messageId: string, streamId: string, channelLogin: string) {
  const existing = await supabaseGet<EventSubMessageRow[]>(
    `/season2_twitch_eventsub_events?select=message_id&or=(message_id.eq.${encodeURIComponent(messageId)},stream_id.eq.${encodeURIComponent(streamId)})&limit=1`,
  );

  if (existing.length) return true;

  await supabasePost(
    "/season2_twitch_eventsub_events",
    {
      message_id: messageId,
      stream_id: streamId,
      channel_login: channelLogin,
    },
    "return=minimal",
  );

  return false;
}

async function sendPushNotifications(
  rows: Season2DbPushSubscription[],
  notification: { title: string; body: string; url: string },
) {
  const notificationPayload = JSON.stringify(notification);
  const results = await Promise.allSettled(rows.map(row => webpush.sendNotification({
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }, notificationPayload)));

  const staleRows = results
    .map((result, index) => ({ result, row: rows[index] }))
    .filter(({ result }) => result.status === "rejected" && isStalePushError(result.reason));

  await Promise.all(staleRows.map(({ row }) =>
    supabaseDelete(`/season2_push_subscriptions?user_id=eq.${encodeURIComponent(row.user_id)}&endpoint=eq.${encodeURIComponent(row.endpoint)}`),
  ));

  return {
    sent: results.filter(result => result.status === "fulfilled").length,
    removed: staleRows.length,
  };
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:bpl@broleague.online";
  if (!publicKey || !privateKey) throw new Error("Missing VAPID environment variables.");
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function isStalePushError(error: unknown) {
  const statusCode = typeof error === "object" && error && "statusCode" in error
    ? Number((error as { statusCode?: number }).statusCode)
    : 0;

  return statusCode === 404 || statusCode === 410;
}

function getHeader(request: EventSubRequest, key: string) {
  const direct = request.headers?.[key] ?? request.headers?.[key.toLowerCase()];
  const value = Array.isArray(direct) ? direct[0] : direct;
  return value?.trim() ?? "";
}

function sendText(response: EventSubResponse, body: string) {
  response.setHeader?.("Content-Type", "text/plain");
  if (response.send) {
    response.status(200).send(body);
    return;
  }
  response.status(200).end?.(body);
}
