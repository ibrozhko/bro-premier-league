import { isSeason2Played, season2Rounds, type Season2Match, type Season2Round } from "../src/data/season2Data.js";
import {
  supabaseDelete,
  supabaseGet,
  type ApiRequest,
  type ApiResponse,
  type Season2DbPrediction,
  type Season2DbPushSubscription,
  type Season2DbUser,
} from "./_utils/season2Api.js";
import webpush from "web-push";

type ScheduledPushType = "monday-broadcast" | "friday-reminders";

type PushResult = {
  sent: number;
  removed: number;
};

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

  const type = getRequestedPushType(request) ?? getCurrentScheduledPushType();
  if (!type) {
    response.status(200).json({
      skipped: "outside-scheduled-window",
      kyiv: getKyivParts(),
    });
    return;
  }

  if (type === "monday-broadcast") {
    const result = await sendMondayBroadcast();
    response.status(200).json({ type, ...result });
    return;
  }

  const result = await sendFridayPredictionReminders();
  response.status(200).json({ type, ...result });
}

async function sendMondayBroadcast() {
  const rows = await supabaseGet<Season2DbPushSubscription[]>(
    "/season2_push_subscriptions?select=*",
  );
  const weekend = getSeason2PredictionWeekend();

  if (!rows.length) return { sent: 0, removed: 0, rounds: getRoundNumbers(weekend) };

  return {
    ...await sendPushNotifications(rows, {
      title: "BPL Season 2",
      body: `${getPredictionWeekendTitle(weekend)} відкрито для прогнозів. Зайди в кабінет і постав свої варіанти.`,
      url: "/cabinet",
    }),
    rounds: getRoundNumbers(weekend),
  };
}

async function sendFridayPredictionReminders() {
  const weekend = getSeason2PredictionWeekend();
  const matches = getPredictableMatches(weekend);

  if (!matches.length) {
    return { sent: 0, removed: 0, users: 0, rounds: getRoundNumbers(weekend), skipped: "no-open-matches" };
  }

  const [users, predictions, subscriptions] = await Promise.all([
    supabaseGet<Array<Pick<Season2DbUser, "id" | "player_id" | "display_name" | "username">>>(
      "/season2_users?select=id,player_id,display_name,username",
    ),
    supabaseGet<Array<Pick<Season2DbPrediction, "user_id" | "match_id">>>(
      `/season2_predictions?select=user_id,match_id&match_id=in.(${matches.map(match => encodeURIComponent(match.id)).join(",")})`,
    ),
    supabaseGet<Season2DbPushSubscription[]>(
      "/season2_push_subscriptions?select=*",
    ),
  ]);

  const subscriptionsByUserId = new Map<string, Season2DbPushSubscription[]>();
  subscriptions.forEach(subscription => {
    subscriptionsByUserId.set(subscription.user_id, [
      ...(subscriptionsByUserId.get(subscription.user_id) ?? []),
      subscription,
    ]);
  });

  const predictedByUserId = new Map<string, Set<string>>();
  predictions.forEach(prediction => {
    predictedByUserId.set(prediction.user_id, new Set([
      ...(predictedByUserId.get(prediction.user_id) ?? []),
      prediction.match_id,
    ]));
  });

  const reminderTargets = users.flatMap(user => {
    const missingCount = getMissingPredictionCount(user.player_id, matches, predictedByUserId.get(user.id));
    const rows = subscriptionsByUserId.get(user.id) ?? [];

    return missingCount > 0 && rows.length ? [{ user, rows, missingCount }] : [];
  });

  const results = await Promise.all(reminderTargets.map(target =>
    sendPushNotifications(target.rows, {
      title: "BPL Season 2",
      body: `${target.user.display_name ?? target.user.username}, не забудь прогнози: ${target.missingCount} ${formatMatchesWord(target.missingCount)} ще без ставки.`,
      url: "/cabinet",
    }),
  ));

  return {
    ...sumPushResults(results),
    users: reminderTargets.length,
    rounds: getRoundNumbers(weekend),
  };
}

async function sendPushNotifications(
  rows: Season2DbPushSubscription[],
  notification: { title: string; body: string; url: string },
): Promise<PushResult> {
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

  return {
    sent: results.filter(result => result.status === "fulfilled").length,
    removed: staleRows.length,
  };
}

function getMissingPredictionCount(playerId: string, matches: Season2Match[], predictedMatchIds = new Set<string>()) {
  return matches.filter(match =>
    match.home.id !== playerId &&
    match.away.id !== playerId &&
    !predictedMatchIds.has(match.id),
  ).length;
}

function getPredictableMatches(rounds: Season2Round[]) {
  return rounds.flatMap(round => round.matches).filter(match => !isSeason2Played(match));
}

function getSeason2PredictionWeekend(now = new Date()) {
  const weekendIndex = getSeason2CabinetWeekendIndex(now);
  const calendarRounds = getSeason2WeekendRounds(weekendIndex).filter(round =>
    round.matches.some(match => !isSeason2Played(match)),
  );
  if (calendarRounds.length) return calendarRounds;

  const firstOpenRound = season2Rounds.find(round => round.matches.some(match => !isSeason2Played(match)));
  return firstOpenRound ? getSeason2WeekendRounds(Math.floor((firstOpenRound.round - 1) / 2)) : [];
}

function getSeason2WeekendRounds(weekendIndex: number) {
  return season2Rounds.filter(round => Math.floor((round.round - 1) / 2) === weekendIndex);
}

function getSeason2CabinetWeekendIndex(now = new Date()) {
  const currentDate = getKyivDateOnly(now);
  const weekendRoundIndex = season2Rounds.findIndex((round, index) =>
    index % 2 === 0 &&
    getKyivDateOnly(new Date(`${season2Rounds[index + 1]?.date ?? round.date}T23:59:59+03:00`)) >= currentDate,
  );

  if (weekendRoundIndex === -1) {
    return Math.max(0, Math.floor(((season2Rounds.at(-1)?.round ?? 1) - 1) / 2));
  }

  return Math.floor((season2Rounds[weekendRoundIndex].round - 1) / 2);
}

function getPredictionWeekendTitle(rounds: Season2Round[]) {
  if (!rounds.length) return "Новий вікенд";
  if (rounds.length === 1) return `Тур ${rounds[0].round}`;
  return `Тури ${rounds.map(round => round.round).join(" та ")}`;
}

function getRoundNumbers(rounds: Season2Round[]) {
  return rounds.map(round => round.round);
}

function getCurrentScheduledPushType(): ScheduledPushType | null {
  const { weekday, hour } = getKyivParts();

  if (weekday === "Mon" && hour === 12) return "monday-broadcast";
  if (weekday === "Fri" && hour === 18) return "friday-reminders";

  return null;
}

function getKyivParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Kyiv",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);

  return {
    weekday: parts.find(part => part.type === "weekday")?.value ?? "",
    hour: Number(parts.find(part => part.type === "hour")?.value ?? -1),
  };
}

function getKyivDateOnly(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getRequestedPushType(request: ApiRequest): ScheduledPushType | null {
  const rawType = getQueryValue(request, "type");
  return rawType === "monday-broadcast" || rawType === "friday-reminders" ? rawType : null;
}

function getQueryValue(request: ApiRequest, key: string) {
  const value = request.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function sumPushResults(results: PushResult[]) {
  return results.reduce((total, result) => ({
    sent: total.sent + result.sent,
    removed: total.removed + result.removed,
  }), { sent: 0, removed: 0 });
}

function formatMatchesWord(count: number) {
  if (count === 1) return "матч";
  if (count >= 2 && count <= 4) return "матчі";
  return "матчів";
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
