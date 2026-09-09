import {
  requireSeason2Env,
  type ApiRequest,
  type ApiResponse,
} from "./_utils/season2Api.js";

type TwitchTokenResponse = {
  access_token: string;
};

type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
};

type TwitchSubscription = {
  id: string;
  type: string;
  status: string;
  condition?: {
    broadcaster_user_id?: string;
  };
};

const twitchChannels = ["bpl2026", "bpl2027"];

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    if (!isAuthorizedServiceRequest(request)) {
      response.status(401).json({ error: "Unauthorized Twitch EventSub registration." });
      return;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const eventSubSecret = process.env.TWITCH_EVENTSUB_SECRET;
    const callbackBaseUrl = process.env.TWITCH_EVENTSUB_CALLBACK_URL ?? "https://broleague.online/api/twitch-eventsub";

    if (!clientId || !clientSecret || !eventSubSecret) {
      response.status(500).json({ error: "Missing Twitch EventSub environment variables." });
      return;
    }

    const token = await getTwitchAccessToken(clientId, clientSecret);
    const headers = {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    };
    const users = await twitchGet<{ data: TwitchUser[] }>(
      `https://api.twitch.tv/helix/users?${twitchChannels.map(channel => `login=${encodeURIComponent(channel)}`).join("&")}`,
      headers,
    );
    const existing = await twitchGet<{ data: TwitchSubscription[] }>(
      "https://api.twitch.tv/helix/eventsub/subscriptions?type=stream.online",
      headers,
    );

    const created = [];
    const skipped = [];

    for (const user of users.data) {
      const alreadyExists = existing.data.some(subscription =>
        subscription.type === "stream.online" &&
        subscription.condition?.broadcaster_user_id === user.id &&
        ["enabled", "webhook_callback_verification_pending"].includes(subscription.status),
      );

      if (alreadyExists) {
        skipped.push(user.login);
        continue;
      }

      const subscription = await twitchPost<{ data: TwitchSubscription[] }>(
        "https://api.twitch.tv/helix/eventsub/subscriptions",
        headers,
        {
          type: "stream.online",
          version: "1",
          condition: {
            broadcaster_user_id: user.id,
          },
          transport: {
            method: "webhook",
            callback: callbackBaseUrl,
            secret: eventSubSecret,
          },
        },
      );

      created.push({
        channel: user.login,
        status: subscription.data[0]?.status ?? "unknown",
      });
    }

    response.status(200).json({ ok: true, created, skipped });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Twitch EventSub registration failed." });
  }
}

async function getTwitchAccessToken(clientId: string, clientSecret: string) {
  const result = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const payload = await result.json() as TwitchTokenResponse & { message?: string };

  if (!result.ok) {
    throw new Error(payload.message ?? "Twitch token request failed.");
  }

  return payload.access_token;
}

async function twitchGet<T>(url: string, headers: Record<string, string>): Promise<T> {
  const result = await fetch(url, { headers });
  const payload = await result.json() as T & { message?: string };
  if (!result.ok) throw new Error(payload.message ?? "Twitch request failed.");
  return payload;
}

async function twitchPost<T>(url: string, headers: Record<string, string>, body: unknown): Promise<T> {
  const result = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await result.json() as T & { message?: string };
  if (!result.ok) throw new Error(payload.message ?? "Twitch request failed.");
  return payload;
}

function isAuthorizedServiceRequest(request: ApiRequest) {
  const token = getBearerToken(request);
  if (!token) return false;

  return [
    process.env.SEASON2_PUSH_SECRET,
    process.env.CRON_SECRET,
    process.env.SEASON2_SESSION_SECRET,
    process.env.PREDICT_SESSION_SECRET,
    process.env.VAPID_PRIVATE_KEY,
  ].filter(Boolean).includes(token);
}

function getBearerToken(request: ApiRequest) {
  const header = request.headers?.authorization ?? request.headers?.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : "";
}
