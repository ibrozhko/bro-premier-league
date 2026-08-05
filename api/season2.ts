import {
  clearSessionCookie,
  getSeason2UserBundle,
  getSessionUserId,
  parseBody,
  requireSeason2Env,
  setSessionCookie,
  supabaseDelete,
  supabaseGet,
  supabasePost,
  verifyPassword,
  type ApiRequest,
  type ApiResponse,
  type Season2DbPrediction,
  type Season2DbPushSubscription,
  type Season2DbUser,
} from "./_utils/season2Api.js";
import webpush from "web-push";

type AuthPayload = {
  action?: "login" | "logout";
  username?: string;
  password?: string;
};

type SavePrediction = {
  matchId: string;
  round: number;
  homePlayerId: string;
  awayPlayerId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
};

type SavePayload = {
  round: number;
  predictions: SavePrediction[];
};

type MatchAggregate = {
  total: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
};

type PushSubscriptionPayload = {
  subscription?: {
    endpoint?: string;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };
  userAgent?: string;
};

type TestPushPayload = {
  title?: string;
  body?: string;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

    const resource = getQueryValue(request, "resource") ?? "auth";

    if (resource === "auth") {
      await handleAuth(request, response);
      return;
    }

    if (resource === "predictions") {
      await handlePredictions(request, response);
      return;
    }

    if (resource === "prediction-stats") {
      await handlePredictionStats(request, response);
      return;
    }

    if (resource === "push-subscription") {
      await handlePushSubscription(request, response);
      return;
    }

    if (resource === "test-push") {
      await handleTestPush(request, response);
      return;
    }

    response.status(404).json({ error: "Season 2 endpoint not found." });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Season 2 API error." });
  }
}

async function handleAuth(request: ApiRequest, response: ApiResponse) {
  if (request.method === "GET") {
    const userId = await getSessionUserId(request);
    response.status(200).json({ user: userId ? await getSeason2UserBundle(userId) : null });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody<AuthPayload>(request.body);
  if (!payload?.action) {
    response.status(400).json({ error: "Некоректний запит." });
    return;
  }

  if (payload.action === "logout") {
    clearSessionCookie(response);
    response.status(200).json({ ok: true });
    return;
  }

  const username = payload.username?.trim() ?? "";
  const password = payload.password ?? "";
  const rows = await supabaseGet<Season2DbUser[]>(
    `/season2_users?select=*&username=eq.${encodeURIComponent(username)}&limit=1`,
  );
  const user = rows[0];

  if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
    response.status(401).json({ error: "Невірний нік у FC 26 або пароль." });
    return;
  }

  setSessionCookie(response, user.id);
  response.status(200).json({ user: await getSeason2UserBundle(user.id) });
}

async function handlePredictions(request: ApiRequest, response: ApiResponse) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    response.status(401).json({ error: "Потрібен вхід." });
    return;
  }

  if (request.method === "GET") {
    response.status(200).json({ user: await getSeason2UserBundle(userId) });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody<SavePayload>(request.body);
  if (!payload || !Number.isInteger(payload.round) || !Array.isArray(payload.predictions)) {
    response.status(400).json({ error: "Некоректний прогноз." });
    return;
  }

  const userRows = await supabaseGet<Season2DbUser[]>(
    `/season2_users?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const user = userRows[0];
  if (!user) {
    response.status(401).json({ error: "Користувача не знайдено." });
    return;
  }

  if (!payload.predictions.length) {
    response.status(400).json({ error: "Немає матчів для збереження." });
    return;
  }

  const matchIds = payload.predictions.map(prediction => prediction.matchId);
  const existing = await supabaseGet<Array<Pick<Season2DbPrediction, "match_id">>>(
    `/season2_predictions?select=match_id&user_id=eq.${encodeURIComponent(user.id)}&match_id=in.(${matchIds.map(encodeURIComponent).join(",")})`,
  );

  if (existing.length > 0) {
    response.status(409).json({ error: "Прогнози цього туру вже зафіксовано. Змінити їх не можна." });
    return;
  }

  const rows = payload.predictions.map(prediction => {
    if (prediction.round !== payload.round) throw new Error("У прогнозах змішані різні тури.");
    if (prediction.homePlayerId === user.player_id || prediction.awayPlayerId === user.player_id) {
      throw new Error("На свій матч прогноз ставити не можна.");
    }
    if (!Number.isInteger(prediction.predictedHomeScore) || !Number.isInteger(prediction.predictedAwayScore)) {
      throw new Error("Введи два цілі числа для кожного матчу.");
    }
    if (prediction.predictedHomeScore < 0 || prediction.predictedAwayScore < 0) {
      throw new Error("Рахунок не може бути від'ємним.");
    }

    return {
      user_id: user.id,
      player_id: user.player_id,
      match_id: prediction.matchId,
      round: prediction.round,
      home_player_id: prediction.homePlayerId,
      away_player_id: prediction.awayPlayerId,
      predicted_home_score: prediction.predictedHomeScore,
      predicted_away_score: prediction.predictedAwayScore,
      locked: true,
    };
  });

  await supabasePost("/season2_predictions", rows, "return=minimal");
  response.status(200).json({ user: await getSeason2UserBundle(user.id) });
}

async function handlePredictionStats(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rows = await supabaseGet<Season2DbPrediction[]>(
    "/season2_predictions?select=match_id,predicted_home_score,predicted_away_score",
  );
  const grouped = new Map<string, Season2DbPrediction[]>();

  rows.forEach(row => {
    grouped.set(row.match_id, [...(grouped.get(row.match_id) ?? []), row]);
  });

  const aggregates = Object.fromEntries([...grouped.entries()].map(([matchId, predictions]) => {
    const total = predictions.length;
    const homeVotes = predictions.filter(prediction => prediction.predicted_home_score > prediction.predicted_away_score).length;
    const drawVotes = predictions.filter(prediction => prediction.predicted_home_score === prediction.predicted_away_score).length;
    const awayVotes = predictions.filter(prediction => prediction.predicted_home_score < prediction.predicted_away_score).length;

    return [matchId, {
      total,
      homePercent: Math.round((homeVotes / total) * 100),
      drawPercent: Math.round((drawVotes / total) * 100),
      awayPercent: Math.round((awayVotes / total) * 100),
    } satisfies MatchAggregate];
  }));

  response.status(200).json({ aggregates });
}

async function handlePushSubscription(request: ApiRequest, response: ApiResponse) {
  const user = await requireUser(request, response);
  if (!user) return;

  if (request.method === "GET") {
    const rows = await supabaseGet<Array<Pick<Season2DbPushSubscription, "endpoint" | "updated_at">>>(
      `/season2_push_subscriptions?select=endpoint,updated_at&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
    );
    response.status(200).json({ enabled: rows.length > 0, updatedAt: rows[0]?.updated_at ?? null });
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody<PushSubscriptionPayload>(request.body);
  const subscription = payload?.subscription;
  const endpoint = subscription?.endpoint ?? "";
  const p256dh = subscription?.keys?.p256dh ?? "";
  const auth = subscription?.keys?.auth ?? "";

  if (!endpoint || !p256dh || !auth) {
    response.status(400).json({ error: "Некоректна push-підписка." });
    return;
  }

  await supabasePost(
    "/season2_push_subscriptions?on_conflict=user_id,endpoint",
    {
      user_id: user.id,
      player_id: user.player_id,
      endpoint,
      p256dh,
      auth,
      user_agent: payload?.userAgent?.slice(0, 300) ?? null,
      updated_at: new Date().toISOString(),
    },
    "resolution=merge-duplicates,return=minimal",
  );

  response.status(200).json({ enabled: true });
}

async function handleTestPush(request: ApiRequest, response: ApiResponse) {
  const user = await requireUser(request, response);
  if (!user) return;

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  configureWebPush();

  const payload = parseBody<TestPushPayload>(request.body);
  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    `/season2_push_subscriptions?select=*&user_id=eq.${encodeURIComponent(user.id)}`,
  );

  if (!rows.length) {
    response.status(400).json({ error: "Спочатку увімкни push у кабінеті." });
    return;
  }

  const notification = JSON.stringify({
    title: payload?.title ?? "BPL Season 2",
    body: payload?.body ?? "Push працює. Кабінет готовий до бойового сезону.",
    url: "/cabinet",
  });

  const results = await Promise.allSettled(rows.map(row => webpush.sendNotification({
    endpoint: row.endpoint,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
  }, notification)));

  const staleRows = results
    .map((result, index) => ({ result, row: rows[index] }))
    .filter(({ result }) => result.status === "rejected" && isStalePushError(result.reason));

  await Promise.all(staleRows.map(({ row }) =>
    supabaseDelete(`/season2_push_subscriptions?user_id=eq.${encodeURIComponent(user.id)}&endpoint=eq.${encodeURIComponent(row.endpoint)}`),
  ));

  response.status(200).json({
    sent: results.filter(result => result.status === "fulfilled").length,
    removed: staleRows.length,
  });
}

async function requireUser(request: ApiRequest, response: ApiResponse) {
  const userId = await getSessionUserId(request);
  if (!userId) {
    response.status(401).json({ error: "Потрібен вхід." });
    return null;
  }

  const userRows = await supabaseGet<Season2DbUser[]>(
    `/season2_users?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const user = userRows[0];
  if (!user) {
    response.status(401).json({ error: "Користувача не знайдено." });
    return null;
  }

  return user;
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

function isStalePushError(error: unknown) {
  const statusCode = typeof error === "object" && error && "statusCode" in error
    ? Number((error as { statusCode?: number }).statusCode)
    : 0;

  return statusCode === 404 || statusCode === 410;
}

function getQueryValue(request: ApiRequest, key: string) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}
