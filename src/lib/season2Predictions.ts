import { season2Players, type Season2Match } from "@/data/season2Data";

export type Season2SavedPrediction = {
  homeScore: string;
  awayScore: string;
  locked?: boolean;
  updatedAt?: string;
};

export type Season2StoredPredictions = Record<string, Record<string, Season2SavedPrediction>>;
export type Season2LockedPredictionRounds = Record<string, Record<string, boolean>>;

export type Season2PredictionAggregate = {
  total: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
};

export type Season2PredictionAggregateMap = Record<string, Season2PredictionAggregate>;

export type Season2User = {
  id: string;
  playerId: string;
  username: string;
  displayName?: string;
  isAdmin: boolean;
  createdAt: string;
  predictions: Record<string, Season2SavedPrediction & { matchId: string; round: number }>;
};

export const season2PredictionStorageKey = "bpl-season2-predictions";
const season2PredictionLocksStorageKey = "bpl-season2-prediction-locks";

export function loadSeason2Predictions(playerId: string): Record<string, Season2SavedPrediction> {
  return readSeason2PredictionStore()[playerId] ?? {};
}

export function persistSeason2Predictions(playerId: string, predictions: Record<string, Season2SavedPrediction>) {
  const store = readSeason2PredictionStore();

  window.localStorage.setItem(season2PredictionStorageKey, JSON.stringify({
    ...store,
    [playerId]: predictions,
  }));
}

export function isSeason2PredictionRoundLocked(playerId: string, roundId: string) {
  return Boolean(readSeason2PredictionLocks()[playerId]?.[roundId]);
}

export function lockSeason2PredictionRound(playerId: string, roundId: string) {
  if (typeof window === "undefined") return;

  const locks = readSeason2PredictionLocks();

  window.localStorage.setItem(season2PredictionLocksStorageKey, JSON.stringify({
    ...locks,
    [playerId]: {
      ...(locks[playerId] ?? {}),
      [roundId]: true,
    },
  }));
}

export async function getCurrentSeason2User() {
  const payload = await apiFetch<{ user: Season2User | null }>("/api/season2-auth");
  return payload.user;
}

export async function loginSeason2User(username: string, password: string) {
  const payload = await apiFetch<{ user: Season2User | null }>("/api/season2-auth", {
    method: "POST",
    body: JSON.stringify({ action: "login", username, password }),
  });
  return payload.user;
}

export async function logoutSeason2User() {
  await apiFetch("/api/season2-auth", {
    method: "POST",
    body: JSON.stringify({ action: "logout" }),
  });
}

export async function saveSeason2RoundPredictions(input: {
  round: number;
  predictions: Array<{
    matchId: string;
    round: number;
    homePlayerId: string;
    awayPlayerId: string;
    predictedHomeScore: number;
    predictedAwayScore: number;
  }>;
}) {
  const payload = await apiFetch<{ user: Season2User | null }>("/api/season2-predictions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.user;
}

export async function loadSeason2PredictionAggregates() {
  const payload = await apiFetch<{ aggregates: Season2PredictionAggregateMap }>("/api/season2-prediction-stats");
  return payload.aggregates;
}

export function getSeason2PredictionAggregate(match: Season2Match, aggregates?: Season2PredictionAggregateMap): Season2PredictionAggregate | null {
  if (aggregates) return aggregates[match.id] ?? null;

  const store = readSeason2PredictionStore();
  const neutralPlayerIds = season2Players
    .filter(player => player.id !== match.home.id && player.id !== match.away.id)
    .map(player => player.id);

  const votes = neutralPlayerIds
    .map(playerId => store[playerId]?.[match.id])
    .filter((prediction): prediction is Season2SavedPrediction =>
      Boolean(prediction && prediction.homeScore !== "" && prediction.awayScore !== ""),
    )
    .map(prediction => ({
      homeScore: Number(prediction.homeScore),
      awayScore: Number(prediction.awayScore),
    }))
    .filter(prediction => Number.isFinite(prediction.homeScore) && Number.isFinite(prediction.awayScore));

  if (!votes.length) return null;

  const homeVotes = votes.filter(prediction => prediction.homeScore > prediction.awayScore).length;
  const drawVotes = votes.filter(prediction => prediction.homeScore === prediction.awayScore).length;
  const awayVotes = votes.filter(prediction => prediction.homeScore < prediction.awayScore).length;

  return {
    total: votes.length,
    homePercent: Math.round((homeVotes / votes.length) * 100),
    drawPercent: Math.round((drawVotes / votes.length) * 100),
    awayPercent: Math.round((awayVotes / votes.length) * 100),
  };
}

function readSeason2PredictionStore(): Season2StoredPredictions {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = window.localStorage.getItem(season2PredictionStorageKey);
    return rawValue ? JSON.parse(rawValue) as Season2StoredPredictions : {};
  } catch {
    return {};
  }
}

function readSeason2PredictionLocks(): Season2LockedPredictionRounds {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = window.localStorage.getItem(season2PredictionLocksStorageKey);
    return rawValue ? JSON.parse(rawValue) as Season2LockedPredictionRounds : {};
  } catch {
    return {};
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Season 2 API error.");
  }
  return payload as T;
}
