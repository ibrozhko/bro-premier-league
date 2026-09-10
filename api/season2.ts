import {
  clearSessionCookie,
  getSeason2UserBundle,
  getSessionUserId,
  hashPassword,
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
import { createHmac, timingSafeEqual } from "node:crypto";
import webpush from "web-push";

type AuthPayload = {
  action?: "login" | "logout";
  username?: string;
  password?: string;
};

type FanUserPayload = {
  username?: string;
  password?: string;
  displayName?: string;
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
  role: "player" | "fan" | "admin";
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
  action?: "day-status" | "propose-time" | "accept-time" | "propose-date" | "accept-date";
  dayStatus?: Season2MatchDayStatus;
  time?: string;
  date?: string;
  matchLabel?: string;
  dayLabel?: string;
};

type TestPushPayload = {
  title?: string;
  body?: string;
  url?: string;
};

type TwitchTokenResponse = {
  access_token: string;
};

type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  profile_image_url?: string;
};

type TwitchStream = {
  user_login: string;
  title: string;
  viewer_count: number;
  started_at: string;
  thumbnail_url: string;
};

type TwitchVideo = {
  id: string;
  title: string;
  created_at: string;
  duration: string;
  thumbnail_url: string;
};

type TwitchSubscription = {
  id: string;
  type: string;
  status: string;
  condition?: {
    broadcaster_user_id?: string;
  };
};

type TwitchEventSubPayload = {
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

type TwitchEventSubMessageRow = {
  message_id: string;
};

const twitchChannels = ["bpl2026", "bpl2027"];
const twitchEventSubNotificationType = "notification";
const twitchEventSubVerificationType = "webhook_callback_verification";
const twitchEventSubRevocationType = "revocation";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

    const resource = getQueryValue(request, "resource") ?? "auth";

    if (resource === "twitch-eventsub") {
      await handleTwitchEventSub(request, response);
      return;
    }

    if (resource === "twitch-eventsub-register") {
      await handleTwitchEventSubRegister(request, response);
      return;
    }

    if (resource === "twitch") {
      await handleTwitch(request, response);
      return;
    }

    if (resource === "auth") {
      await handleAuth(request, response);
      return;
    }

    if (resource === "fan-user") {
      await handleFanUser(request, response);
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

async function handleTwitchEventSub(request: ApiRequest, response: ApiResponse) {
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
  if (!verifyTwitchEventSubSignature(request, rawBody, secret)) {
    response.status(403).json({ error: "Invalid Twitch EventSub signature." });
    return;
  }

  const messageType = getRequestHeader(request, "twitch-eventsub-message-type");
  const subscriptionType = getRequestHeader(request, "twitch-eventsub-subscription-type");
  const payload = JSON.parse(rawBody) as TwitchEventSubPayload;

  if (messageType === twitchEventSubVerificationType) {
    sendText(response, payload.challenge ?? "");
    return;
  }

  if (messageType === twitchEventSubRevocationType) {
    response.status(200).json({ ok: true, revoked: payload.subscription?.status ?? "unknown" });
    return;
  }

  if (messageType !== twitchEventSubNotificationType || subscriptionType !== "stream.online") {
    response.status(200).json({ ok: true, ignored: true });
    return;
  }

  const streamId = payload.event?.id?.trim() ?? "";
  const channelLogin = payload.event?.broadcaster_user_login?.trim().toLowerCase() ?? "";
  if (!streamId || !twitchChannels.includes(channelLogin)) {
    response.status(200).json({ ok: true, ignored: true });
    return;
  }

  const messageId = getRequestHeader(request, "twitch-eventsub-message-id");
  const duplicate = await rememberTwitchEventSubMessage(messageId, streamId, channelLogin);
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
}

async function handleTwitchEventSubRegister(request: ApiRequest, response: ApiResponse) {
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
  const callbackUrl = process.env.TWITCH_EVENTSUB_CALLBACK_URL ?? "https://broleague.online/api/season2?resource=twitch-eventsub";

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
    const currentSubscription = existing.data.find(subscription =>
      subscription.type === "stream.online" &&
      subscription.condition?.broadcaster_user_id === user.id &&
      ["enabled", "webhook_callback_verification_pending"].includes(subscription.status),
    );

    if (currentSubscription) {
      skipped.push({
        channel: user.login,
        status: currentSubscription.status,
      });
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
          callback: callbackUrl,
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
}

async function handleTwitch(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    response.status(500).json({ error: "Missing Twitch environment variables." });
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
  const userIds = users.data.map(user => user.id);

  if (!userIds.length) {
    response.status(200).json({ channels: [] });
    return;
  }

  const [streams, videosByUserId] = await Promise.all([
    twitchGet<{ data: TwitchStream[] }>(
      `https://api.twitch.tv/helix/streams?${userIds.map(id => `user_id=${encodeURIComponent(id)}`).join("&")}`,
      headers,
    ),
    Promise.all(userIds.map(async userId => {
      const videos = await twitchGet<{ data: TwitchVideo[] }>(
        `https://api.twitch.tv/helix/videos?user_id=${encodeURIComponent(userId)}&type=archive&first=1&sort=time`,
        headers,
      );
      return [userId, videos.data[0] ?? null] as const;
    })),
  ]);

  response.status(200).json({
    channels: users.data.map(user => {
      const stream = streams.data.find(item => item.user_login.toLowerCase() === user.login.toLowerCase()) ?? null;
      const video = new Map(videosByUserId).get(user.id) ?? null;

      return {
        login: user.login,
        displayName: user.display_name,
        profileImageUrl: user.profile_image_url ?? "",
        isLive: Boolean(stream),
        stream: stream ? {
          title: stream.title,
          viewerCount: stream.viewer_count,
          startedAt: stream.started_at,
          thumbnailUrl: normalizeTwitchThumbnail(stream.thumbnail_url),
        } : null,
        latestVideo: video ? {
          id: video.id,
          title: video.title,
          createdAt: video.created_at,
          duration: video.duration,
          thumbnailUrl: normalizeTwitchThumbnail(video.thumbnail_url),
        } : null,
      };
    }),
  });
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
    home_proposed_date: null,
    away_proposed_date: null,
    agreed_date: null,
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
  const ownDateKey = `${side}_proposed_date` as const;
  const opponentDateKey = `${side === "home" ? "away" : "home"}_proposed_date` as const;

  if (payload?.action === "day-status") {
    if (payload.dayStatus !== "available" && payload.dayStatus !== "reschedule") {
      throw new Error("Обери: можу грати або треба перенос.");
    }
    next[ownDayKey] = payload.dayStatus;
    if (payload.dayStatus === "available") {
      next[ownDateKey] = null;
      next.agreed_date = null;
      next.agreed_time = null;
    }
    if (payload.dayStatus === "reschedule") {
      next.agreed_time = null;
    }
  } else if (payload?.action === "propose-date") {
    const date = normalizeSchedulingDate(payload.date);
    next[ownDayKey] = "reschedule";
    next[ownDateKey] = date;
    next.agreed_time = null;
    next.agreed_date = next[opponentDateKey] === date ? date : null;
  } else if (payload?.action === "accept-date") {
    const date = normalizeSchedulingDate(payload.date);
    if (next[opponentDateKey] !== date) {
      throw new Error("Цей день ще не запропонований суперником.");
    }
    next[ownDayKey] = "reschedule";
    next[ownDateKey] = date;
    next.agreed_date = date;
    next.agreed_time = null;
  } else if (payload?.action === "propose-time") {
    const time = normalizeSchedulingTime(payload.time);
    if ((next.home_day_status === "reschedule" || next.away_day_status === "reschedule") && !next.agreed_date) {
      throw new Error("Спочатку погодьте новий день матчу.");
    }
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

  const scheduledDate = getScheduleEffectiveDate(schedule);
  const rows = await supabaseGet<Array<Pick<Season2DbMatchScheduling, "match_id" | "round" | "agreed_time" | "agreed_date" | "status">>>(
    `/season2_match_scheduling?select=match_id,round,agreed_time,agreed_date,status&status=eq.scheduled`,
  );

  return rows.find(row =>
    row.match_id !== schedule.match_id &&
    row.agreed_time === schedule.agreed_time &&
    getScheduleEffectiveDate(row) === scheduledDate,
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
  if (minutes !== 0 && minutes !== 30) {
    throw new Error("Обирай слот з кроком 30 хвилин.");
  }

  return time;
}

function normalizeSchedulingDate(value: string | undefined) {
  const date = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Обери новий день матчу.");
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error("Некоректний день матчу.");
  }

  return date;
}

function deriveScheduleStatus(schedule: Season2DbMatchScheduling) {
  if (schedule.agreed_time) return "scheduled";
  if ((schedule.home_day_status === "reschedule" || schedule.away_day_status === "reschedule") && !schedule.agreed_date) return "postponed";
  if (schedule.home_proposed_time || schedule.away_proposed_time) return "negotiating";
  if (schedule.agreed_date) return "day_confirmed";
  if (schedule.home_day_status === "available" && schedule.away_day_status === "available") return "day_confirmed";
  return "pending";
}

function getScheduleEffectiveDate(schedule: Pick<Season2DbMatchScheduling, "match_id" | "round" | "agreed_date">) {
  if (schedule.agreed_date) return schedule.agreed_date;
  const match = season2Rounds
    .flatMap(round => round.matches)
    .find(item => item.id === schedule.match_id);

  return match?.date ?? "";
}

async function notifyScheduledMatch(schedule: Season2DbMatchScheduling, payload: MatchSchedulingPayload | null) {
  configureWebPush();

  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    "/season2_push_subscriptions?select=*",
  );

  if (!rows.length) return { sent: 0, removed: 0 };

  const matchLabel = payload?.matchLabel?.trim() || "Матч Season 2";
  const dayLabel = schedule.agreed_date ? formatSchedulingDate(schedule.agreed_date) : payload?.dayLabel?.trim() || "у турі";

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

  if (payload?.action === "propose-date" && payload.date) {
    return `${actor} пропонує перенести матч на ${formatSchedulingDate(payload.date)}.`;
  }

  if (payload?.action === "accept-date" && payload.date) {
    return `${actor} погодив новий день матчу: ${formatSchedulingDate(payload.date)}. Домовтесь про час.`;
  }

  if (payload?.action === "propose-time" && payload.time) {
    return `${actor} пропонує зіграти ${dayLabel} о ${payload.time}.`;
  }

  return "";
}

function formatSchedulingDate(date: string) {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return `${day}.${month}.${year}`;
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

async function handleFanUser(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedServiceRequest(request)) {
    response.status(401).json({ error: "Unauthorized fan user request." });
    return;
  }

  const payload = parseBody<FanUserPayload>(request.body);
  const username = payload?.username?.trim();
  const password = payload?.password ?? "";
  const displayName = payload?.displayName?.trim() || username;

  if (!username || username.length < 2 || password.length < 6) {
    response.status(400).json({ error: "Вкажи логін і пароль мінімум 6 символів." });
    return;
  }

  const playerId = `fan:${username.toLowerCase()}`;
  const rows = await supabasePost<Array<Pick<Season2DbUser, "id" | "username" | "display_name" | "player_id" | "role">>>(
    "/season2_users?on_conflict=username",
    {
      username,
      display_name: displayName,
      player_id: playerId,
      password_hash: hashPassword(password),
      is_admin: false,
      role: "fan",
    },
    "resolution=merge-duplicates,return=representation",
  );

  response.status(200).json({
    user: {
      id: rows[0]?.id,
      username: rows[0]?.username ?? username,
      displayName: rows[0]?.display_name ?? displayName,
      playerId: rows[0]?.player_id ?? playerId,
      role: rows[0]?.role ?? "fan",
    },
  });
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
    if ((user.role ?? "player") !== "fan" && (prediction.homePlayerId === user.player_id || prediction.awayPlayerId === user.player_id)) {
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
    supabaseGet<Array<Pick<Season2DbUser, "id" | "player_id" | "display_name" | "username" | "role" | "is_admin">>>(
      "/season2_users?select=id,player_id,display_name,username,role,is_admin",
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
      role: user.role ?? (user.is_admin ? "admin" : "player"),
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

  if (!result.ok) {
    throw new Error(payload.message ?? "Twitch request failed.");
  }

  return payload;
}

async function twitchPost<T>(url: string, headers: Record<string, string>, body: unknown): Promise<T> {
  const result = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await result.json() as T & { message?: string };

  if (!result.ok) {
    throw new Error(payload.message ?? "Twitch request failed.");
  }

  return payload;
}

function normalizeTwitchThumbnail(url: string) {
  return url
    .replace("%{width}", "640")
    .replace("%{height}", "360");
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

async function readRawBody(request: ApiRequest) {
  if (typeof request.body === "string") return request.body;
  if (request.body && typeof request.body === "object") return JSON.stringify(request.body);

  const streamRequest = request as ApiRequest & {
    on?: (event: "data" | "end" | "error", callback: (chunk?: Buffer) => void) => void;
  };
  if (!streamRequest.on) return "";

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    streamRequest.on?.("data", chunk => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    streamRequest.on?.("end", () => resolve());
    streamRequest.on?.("error", () => reject(new Error("Failed to read Twitch EventSub body.")));
  });

  return Buffer.concat(chunks).toString("utf8");
}

function verifyTwitchEventSubSignature(request: ApiRequest, rawBody: string, secret: string) {
  const messageId = getRequestHeader(request, "twitch-eventsub-message-id");
  const timestamp = getRequestHeader(request, "twitch-eventsub-message-timestamp");
  const signature = getRequestHeader(request, "twitch-eventsub-message-signature");
  if (!messageId || !timestamp || !signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(`${messageId}${timestamp}${rawBody}`).digest("hex")}`;
  return safeEqual(signature, expected);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function rememberTwitchEventSubMessage(messageId: string, streamId: string, channelLogin: string) {
  const existing = await supabaseGet<TwitchEventSubMessageRow[]>(
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

function getRequestHeader(request: ApiRequest, key: string) {
  const direct = request.headers?.[key] ?? request.headers?.[key.toLowerCase()];
  const value = Array.isArray(direct) ? direct[0] : direct;
  return value?.trim() ?? "";
}

function sendText(response: ApiResponse, body: string) {
  response.setHeader?.("Content-Type", "text/plain");
  const textResponse = response as ApiResponse & {
    send?: (value: string) => void;
    end?: (value?: string) => void;
  };

  if (textResponse.send) {
    textResponse.status(200).send(body);
    return;
  }
  textResponse.status(200).end?.(body);
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
