import {
  clearSessionCookie,
  getSeason2UserBundle,
  getSessionUserId,
  parseBody,
  calculateSeason2PredictionPoints,
  requireSeason2Env,
  setSessionCookie,
  supabaseDelete,
  supabaseGet,
  supabasePatch,
  supabasePost,
  verifyPassword,
  type ApiRequest,
  type ApiResponse,
  type Season2DbMatchScheduling,
  type Season2DbPrediction,
  type Season2DbPushSubscription,
  type Season2DbUser,
  type Season2MatchDayStatus,
} from "./_utils/season2Api.js";
import { isSeason2Played, season2Rounds } from "../src/data/season2Data.js";
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
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
};

type PredictionLeaderboardRow = {
  playerId: string;
  displayName: string;
  username: string;
  points: number;
  predictions: number;
  exact: number;
  correctResult: number;
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

type MatchSchedulingPayload = {
  matchId?: string;
  round?: number;
  homePlayerId?: string;
  awayPlayerId?: string;
  action?: "day-status" | "propose-time" | "accept-time";
  dayStatus?: Season2MatchDayStatus;
  time?: string;
  matchLabel?: string;
  dayLabel?: string;
};

type TestPushPayload = {
  title?: string;
  body?: string;
  url?: string;
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

    if (resource === "prediction-leaderboard") {
      await handlePredictionLeaderboard(request, response);
      return;
    }

    if (resource === "recalculate-predictions") {
      await handleRecalculatePredictions(request, response);
      return;
    }

    if (resource === "match-scheduling") {
      await handleMatchScheduling(request, response);
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

    if (resource === "push-broadcast") {
      await handlePushBroadcast(request, response);
      return;
    }

    response.status(404).json({ error: "Season 2 endpoint not found." });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Season 2 API error." });
  }
}

async function handleMatchScheduling(request: ApiRequest, response: ApiResponse) {
  if (request.method === "GET") {
    try {
      const rows = await supabaseGet<Season2DbMatchScheduling[]>(
        "/season2_match_scheduling?select=*",
      );
      response.status(200).json({ schedules: rows });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("season2_match_scheduling")) {
        response.status(200).json({ schedules: [] });
        return;
      }
      throw error;
    }
    return;
  }

  const user = await requireUser(request, response);
  if (!user) return;

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody<MatchSchedulingPayload>(request.body);
  const matchId = payload?.matchId?.trim() ?? "";
  const homePlayerId = payload?.homePlayerId?.trim() ?? "";
  const awayPlayerId = payload?.awayPlayerId?.trim() ?? "";
  const round = Number(payload?.round);

  if (!matchId || !homePlayerId || !awayPlayerId || !Number.isInteger(round)) {
    response.status(400).json({ error: "Некоректний матч для домовленості." });
    return;
  }

  const side = user.player_id === homePlayerId ? "home" : user.player_id === awayPlayerId ? "away" : "";
  if (!side) {
    response.status(403).json({ error: "Домовлятись можуть тільки учасники цього матчу." });
    return;
  }

  const existingRows = await supabaseGet<Season2DbMatchScheduling[]>(
    `/season2_match_scheduling?select=*&match_id=eq.${encodeURIComponent(matchId)}&limit=1`,
  );
  const existing = existingRows[0] ?? makeInitialSchedule(matchId, round, homePlayerId, awayPlayerId);
  const previousAgreedTime = existing.agreed_time;
  const next = applySchedulingAction(existing, side, payload);
  const slotConflict = next.status === "scheduled" && next.agreed_time
    ? await getSchedulingTimeConflict(next)
    : null;

  if (slotConflict) {
    response.status(409).json({
      error: `${next.agreed_time} вже зайнято іншим матчем цього ігрового дня. Обери інший час.`,
    });
    return;
  }

  const savedRows = existingRows[0]
    ? await supabasePatch<Season2DbMatchScheduling[]>(
      `/season2_match_scheduling?match_id=eq.${encodeURIComponent(matchId)}`,
      { ...next, updated_by_player_id: user.player_id, updated_at: new Date().toISOString() },
    )
    : await supabasePost<Season2DbMatchScheduling[]>(
      "/season2_match_scheduling",
      { ...next, updated_by_player_id: user.player_id },
    );

  const saved = savedRows[0] ?? next;
  let push: Awaited<ReturnType<typeof sendPushNotifications>> | null = null;
  let opponentPush: Awaited<ReturnType<typeof sendPushNotifications>> | null = null;

  if (saved.status === "scheduled" && saved.agreed_time && saved.agreed_time !== previousAgreedTime) {
    push = await notifyScheduledMatch(saved, payload);
  } else {
    opponentPush = await notifyMatchOpponent(saved, user, payload);
  }

  response.status(200).json({ schedule: saved, push, opponentPush });
}

function makeInitialSchedule(
  matchId: string,
  round: number,
  homePlayerId: string,
  awayPlayerId: string,
): Season2DbMatchScheduling {
  const now = new Date().toISOString();

  return {
    match_id: matchId,
    round,
    home_player_id: homePlayerId,
    away_player_id: awayPlayerId,
    home_day_status: "pending",
    away_day_status: "pending",
    home_proposed_time: null,
    away_proposed_time: null,
    agreed_time: null,
    status: "pending",
    updated_by_player_id: null,
    created_at: now,
    updated_at: now,
  };
}

function applySchedulingAction(
  schedule: Season2DbMatchScheduling,
  side: "home" | "away",
  payload: MatchSchedulingPayload | null,
): Season2DbMatchScheduling {
  const next = { ...schedule };
  const ownDayKey = `${side}_day_status` as const;
  const ownTimeKey = `${side}_proposed_time` as const;
  const opponentTimeKey = `${side === "home" ? "away" : "home"}_proposed_time` as const;

  if (payload?.action === "day-status") {
    if (payload.dayStatus !== "available" && payload.dayStatus !== "reschedule") {
      throw new Error("Обери: можу грати або треба перенос.");
    }
    next[ownDayKey] = payload.dayStatus;
    if (payload.dayStatus === "reschedule") {
      next.agreed_time = null;
    }
  } else if (payload?.action === "propose-time") {
    const time = normalizeSchedulingTime(payload.time);
    next[ownDayKey] = "available";
    next[ownTimeKey] = time;
    if (next[opponentTimeKey] === time) {
      next.agreed_time = time;
    }
  } else if (payload?.action === "accept-time") {
    const time = normalizeSchedulingTime(payload.time);
    if (next[opponentTimeKey] !== time) {
      throw new Error("Цей час ще не запропонований суперником.");
    }
    next[ownDayKey] = "available";
    next[ownTimeKey] = time;
    next.agreed_time = time;
  } else {
    throw new Error("Некоректна дія для домовленості.");
  }

  next.status = deriveScheduleStatus(next);
  return next;
}

async function getSchedulingTimeConflict(schedule: Season2DbMatchScheduling) {
  if (!schedule.agreed_time) return null;

  const rows = await supabaseGet<Array<Pick<Season2DbMatchScheduling, "match_id" | "agreed_time" | "status">>>(
    `/season2_match_scheduling?select=match_id,agreed_time,status&round=eq.${encodeURIComponent(String(schedule.round))}&status=eq.scheduled`,
  );

  return rows.find(row =>
    row.match_id !== schedule.match_id &&
    row.agreed_time === schedule.agreed_time,
  ) ?? null;
}

function normalizeSchedulingTime(value: string | undefined) {
  const time = value?.trim() ?? "";
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Вкажи час у форматі 21:30.");
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (hours > 23 || minutes > 59) {
    throw new Error("Некоректний час матчу.");
  }

  return time;
}

function deriveScheduleStatus(schedule: Season2DbMatchScheduling) {
  if (schedule.home_day_status === "reschedule" || schedule.away_day_status === "reschedule") return "postponed";
  if (schedule.agreed_time) return "scheduled";
  if (schedule.home_proposed_time || schedule.away_proposed_time) return "negotiating";
  if (schedule.home_day_status === "available" && schedule.away_day_status === "available") return "day_confirmed";
  return "pending";
}

async function notifyScheduledMatch(schedule: Season2DbMatchScheduling, payload: MatchSchedulingPayload | null) {
  configureWebPush();

  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    "/season2_push_subscriptions?select=*",
  );

  if (!rows.length) return { sent: 0, removed: 0 };

  const matchLabel = payload?.matchLabel?.trim() || "Матч Season 2";
  const dayLabel = payload?.dayLabel?.trim() || "у турі";

  return sendPushNotifications(rows, {
    title: "BPL Season 2",
    body: `${matchLabel}: погоджено ${dayLabel} о ${schedule.agreed_time}.`,
    url: "/",
  });
}

async function notifyMatchOpponent(
  schedule: Season2DbMatchScheduling,
  user: Season2DbUser,
  payload: MatchSchedulingPayload | null,
) {
  const opponentPlayerId = user.player_id === schedule.home_player_id
    ? schedule.away_player_id
    : schedule.home_player_id;
  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    `/season2_push_subscriptions?select=*&player_id=eq.${encodeURIComponent(opponentPlayerId)}`,
  );

  if (!rows.length) return { sent: 0, removed: 0 };

  const body = getOpponentNotificationBody(user, payload);
  if (!body) return { sent: 0, removed: 0 };

  configureWebPush();

  return sendPushNotifications(rows, {
    title: "BPL Season 2",
    body,
    url: "/cabinet",
  });
}

function getOpponentNotificationBody(user: Season2DbUser, payload: MatchSchedulingPayload | null) {
  const actor = user.display_name?.trim() || user.username;
  const dayLabel = payload?.dayLabel?.trim() || "у турі";

  if (payload?.action === "day-status" && payload.dayStatus === "available") {
    return `${actor} підтвердив день матчу. Можна домовлятись про час.`;
  }

  if (payload?.action === "day-status" && payload.dayStatus === "reschedule") {
    return `${actor} просить перенести матч ${dayLabel}.`;
  }

  if (payload?.action === "propose-time" && payload.time) {
    return `${actor} пропонує зіграти ${dayLabel} о ${payload.time}.`;
  }

  return "";
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
  const existingMatchIds = new Set(existing.map(prediction => prediction.match_id));
  const newPredictions = payload.predictions.filter(prediction => !existingMatchIds.has(prediction.matchId));

  if (!newPredictions.length) {
    response.status(409).json({ error: "Усі прогнози цього туру вже зафіксовано. Змінити їх не можна." });
    return;
  }

  const rows = newPredictions.map(prediction => {
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
      homeVotes,
      drawVotes,
      awayVotes,
      homePercent: Math.round((homeVotes / total) * 100),
      drawPercent: Math.round((drawVotes / total) * 100),
      awayPercent: Math.round((awayVotes / total) * 100),
    } satisfies MatchAggregate];
  }));

  response.status(200).json({ aggregates });
}

async function handlePredictionLeaderboard(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const [users, predictions] = await Promise.all([
    supabaseGet<Array<Pick<Season2DbUser, "id" | "player_id" | "display_name" | "username">>>(
      "/season2_users?select=id,player_id,display_name,username",
    ),
    supabaseGet<Array<Pick<
      Season2DbPrediction,
      "user_id" | "match_id" | "predicted_home_score" | "predicted_away_score" | "points"
    >>>(
      "/season2_predictions?select=user_id,match_id,predicted_home_score,predicted_away_score,points",
    ),
  ]);

  const rows = users.map(user => {
    const userPredictions = predictions.filter(prediction => prediction.user_id === user.id);
    const scoredPredictions = userPredictions.map(calculateSeason2PredictionPoints);

    return {
      playerId: user.player_id,
      displayName: user.display_name ?? user.username,
      username: user.username,
      points: scoredPredictions.reduce((sum, points) => sum + points, 0),
      predictions: userPredictions.length,
      exact: scoredPredictions.filter(points => points === 10).length,
      correctResult: scoredPredictions.filter(points => points === 5).length,
    } satisfies PredictionLeaderboardRow;
  }).sort((first, second) =>
    second.points - first.points ||
    second.exact - first.exact ||
    second.correctResult - first.correctResult ||
    first.displayName.localeCompare(second.displayName, "uk"),
  );

  response.status(200).json({ rows });
}

async function handleRecalculatePredictions(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedServiceRequest(request)) {
    response.status(401).json({ error: "Unauthorized prediction recalculation." });
    return;
  }

  const playedScores = new Map(
    season2Rounds
      .flatMap(round => round.matches)
      .filter(isSeason2Played)
      .map(match => [match.id, { homeScore: match.homeScore!, awayScore: match.awayScore! }]),
  );

  const rows = await supabaseGet<Array<Pick<
    Season2DbPrediction,
    "id" | "match_id" | "predicted_home_score" | "predicted_away_score"
  >>>(
    "/season2_predictions?select=id,match_id,predicted_home_score,predicted_away_score",
  );

  let updated = 0;
  await Promise.all(rows.map(row => {
    const score = playedScores.get(row.match_id);
    if (!score) return Promise.resolve();

    updated += 1;
    return supabasePatch(
      `/season2_predictions?id=eq.${row.id}`,
      {
        points: calculatePredictionPoints(
          row.predicted_home_score,
          row.predicted_away_score,
          score.homeScore,
          score.awayScore,
        ),
      },
      "return=minimal",
    );
  }));

  response.status(200).json({ matches: playedScores.size, predictions: rows.length, updated });
}

function calculatePredictionPoints(
  predictedHomeScore: number,
  predictedAwayScore: number,
  homeScore: number,
  awayScore: number,
) {
  if (predictedHomeScore === homeScore && predictedAwayScore === awayScore) return 10;

  const predictedResult = getResultSide(predictedHomeScore, predictedAwayScore);
  const actualResult = getResultSide(homeScore, awayScore);

  return predictedResult === actualResult ? 5 : 0;
}

function getResultSide(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "home";
  if (homeScore < awayScore) return "away";
  return "draw";
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

  const notification = {
    title: payload?.title ?? "BPL Season 2",
    body: payload?.body ?? "Push працює. Кабінет готовий до бойового сезону.",
    url: payload?.url ?? "/cabinet",
  };

  const result = await sendPushNotifications(rows, notification);

  response.status(200).json(result);
}

async function handlePushBroadcast(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedServiceRequest(request)) {
    response.status(401).json({ error: "Unauthorized push broadcast." });
    return;
  }

  configureWebPush();

  const payload = parseBody<TestPushPayload>(request.body);
  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    "/season2_push_subscriptions?select=*",
  );

  if (!rows.length) {
    response.status(200).json({ sent: 0, removed: 0 });
    return;
  }

  const result = await sendPushNotifications(rows, {
    title: payload?.title ?? "BPL Season 2",
    body: payload?.body ?? "Є свіже повідомлення від ліги.",
    url: payload?.url ?? "/cabinet",
  });

  response.status(200).json(result);
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

function getQueryValue(request: ApiRequest, key: string) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}
