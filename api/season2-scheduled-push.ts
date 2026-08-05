import {
  supabaseDelete,
  supabaseGet,
  type ApiRequest,
  type ApiResponse,
  type Season2DbPushSubscription,
} from "./_utils/season2Api.js";
import webpush from "web-push";

const scheduledPushes = {
  preseason2300Test: {
    title: "BPL Season 2",
    body: "Тест 23:00. Якщо це бачиш — push живий.",
    url: "/cabinet",
  },
} as const;

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedCronRequest(request)) {
    response.status(401).json({ error: "Unauthorized scheduled push." });
    return;
  }

  configureWebPush();

  const notification = scheduledPushes.preseason2300Test;
  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    "/season2_push_subscriptions?select=*",
  );

  if (!rows.length) {
    response.status(200).json({ sent: 0, removed: 0 });
    return;
  }

  const payload = JSON.stringify(notification);
  const results = await Promise.allSettled(rows.map(row => webpush.sendNotification({
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }, payload)));

  const staleRows = results
    .map((result, index) => ({ result, row: rows[index] }))
    .filter(({ result }) => result.status === "rejected" && isStalePushError(result.reason));

  await Promise.all(staleRows.map(({ row }) =>
    supabaseDelete(`/season2_push_subscriptions?user_id=eq.${encodeURIComponent(row.user_id)}&endpoint=eq.${encodeURIComponent(row.endpoint)}`),
  ));

  response.status(200).json({
    sent: results.filter(result => result.status === "fulfilled").length,
    removed: staleRows.length,
  });
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:bpl@broleague.online";

  if (!publicKey || !privateKey) {
    throw new Error("Missing environment variables: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function isAuthorizedCronRequest(request: ApiRequest) {
  const token = getBearerToken(request);
  if (!token) return !process.env.CRON_SECRET;

  return [
    process.env.CRON_SECRET,
    process.env.SEASON2_PUSH_SECRET,
    process.env.VAPID_PRIVATE_KEY,
  ].filter(Boolean).includes(token);
}

function getBearerToken(request: ApiRequest) {
  const header = request.headers?.authorization ?? request.headers?.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length).trim() : "";
}

function isStalePushError(error: unknown) {
  const statusCode = typeof error === "object" && error && "statusCode" in error
    ? Number((error as { statusCode?: number }).statusCode)
    : 0;

  return statusCode === 404 || statusCode === 410;
}
