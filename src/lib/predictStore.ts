import { predictMatches } from "@/data/predictData";
import type { MatchPrediction, PredictMatch, PredictUser, TournamentPrediction } from "@/data/predictData";

type UsersResponse = {
  currentUser: PredictUser | null;
  users: Array<PredictUser & { totalPoints: number }>;
};

type UserResponse = {
  user: PredictUser | null;
};

type MatchesResponse = {
  matches: Array<{
    externalId: string;
    status: PredictMatch["status"];
    homeScore: number | null;
    awayScore: number | null;
    homePenalties?: number | null;
    awayPenalties?: number | null;
    winner: PredictMatch["winner"];
    teamAdvancing: PredictMatch["teamAdvancing"];
  }>;
};

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
    throw new Error(payload.error ?? "Predict API error.");
  }
  return payload as T;
}

export async function getPredictUsers() {
  const payload = await apiFetch<UsersResponse>("/api/predict-users");
  return payload.users;
}

export async function getCurrentPredictUser() {
  const payload = await apiFetch<UserResponse>("/api/predict-auth");
  return payload.user;
}

export async function getPredictMatches() {
  const payload = await apiFetch<MatchesResponse>("/api/predict-matches");
  const rowsByExternalId = new Map(payload.matches.map(match => [match.externalId, match]));

  return predictMatches.map(match => {
    const row = rowsByExternalId.get(match.externalId);
    if (!row) return match;

    return {
      ...match,
      status: row.status ?? match.status,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      homePenalties: row.homePenalties ?? match.homePenalties,
      awayPenalties: row.awayPenalties ?? match.awayPenalties,
      winner: row.winner,
      teamAdvancing: row.teamAdvancing,
    };
  });
}

export async function loginPredictUser(username: string, password: string) {
  const payload = await apiFetch<UserResponse>("/api/predict-auth", {
    method: "POST",
    body: JSON.stringify({ action: "login", username, password }),
  });
  return payload.user;
}

export async function logoutPredictUser() {
  await apiFetch("/api/predict-auth", {
    method: "POST",
    body: JSON.stringify({ action: "logout" }),
  });
}

export async function registerPredictUser(input: {
  username: string;
  displayName: string;
  password: string;
  inviteCode: string;
  tournamentPrediction: TournamentPrediction;
}) {
  const payload = await apiFetch<UserResponse>("/api/predict-auth", {
    method: "POST",
    body: JSON.stringify({ action: "register", ...input }),
  });
  return payload.user;
}

export async function saveMatchPrediction(
  match: PredictMatch,
  prediction: Omit<MatchPrediction, "matchId" | "pointsOutcome" | "pointsAdvancing" | "pointsPenalty" | "updatedAt">,
) {
  const payload = await apiFetch<UserResponse>("/api/predict-predictions", {
    method: "POST",
    body: JSON.stringify({
      match: {
        id: match.id,
        externalId: match.externalId,
        stage: match.stage,
        groupName: match.groupName,
        matchDate: match.matchDate,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      },
      predictedHomeScore: prediction.predictedHomeScore,
      predictedAwayScore: prediction.predictedAwayScore,
      predictedHomePenalties: prediction.predictedHomePenalties,
      predictedAwayPenalties: prediction.predictedAwayPenalties,
      predictedAdvancing: prediction.predictedAdvancing,
    }),
  });
  return payload.user;
}

export async function seedPredictUser(username: string): Promise<PredictUser & { password: string }> {
  throw new Error(`Seed через UI тимчасово вимкнений. Створи ${username} через Supabase або окремий seed SQL.`);
}

export async function updateManualResult(matchId: number, homeScore: number, awayScore: number): Promise<PredictMatch> {
  void matchId;
  void homeScore;
  void awayScore;
  throw new Error("Ручне оновлення результатів Predict тимчасово вимкнене під час переходу на Supabase.");
}
