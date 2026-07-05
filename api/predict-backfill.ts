import { isAdminRequest, type AdminRequest } from "./_utils/adminAuth.js";
import {
  parseBody,
  requirePredictEnv,
  supabaseGet,
  supabasePatch,
  supabasePost,
  supabaseRpc,
  type ApiResponse,
} from "./_utils/predictApi.js";

type ApiRequest = AdminRequest & {
  method?: string;
  body?: unknown;
};

type BackfillPrediction = {
  userId?: string;
  username?: string;
  displayName?: string;
  externalId: string;
  localMatchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedAdvancing?: "home" | "away";
  predictedHomePenalties?: number | null;
  predictedAwayPenalties?: number | null;
};

type BackfillPayload = {
  password?: string;
  predictions?: BackfillPrediction[];
};

type MatchRow = {
  id: number;
  external_id: string;
  stage: string;
  home_score: number | null;
  away_score: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  winner: "home" | "away" | "draw" | null;
  team_advancing: "home" | "away" | null;
};

type UserRow = {
  id: string;
  username: string;
  display_name: string | null;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const payload = parseBody<BackfillPayload>(request.body);
    if (!payload || !Array.isArray(payload.predictions)) {
      response.status(400).json({ error: "Некоректний список прогнозів." });
      return;
    }

    if (!isAdminRequest(request, payload.password)) {
      response.status(401).json({ error: "Потрібен доступ адміна." });
      return;
    }

    const users = await supabaseGet<UserRow[]>("/predict_users?select=id,username,display_name");
    const updated: Array<{ user: string; externalId: string; points: number }> = [];

    for (const prediction of payload.predictions) {
      validatePrediction(prediction);

      const user = findUser(users, prediction);
      if (!user) {
        throw new Error(`Користувача не знайдено: ${prediction.username ?? prediction.displayName ?? prediction.userId}`);
      }

      const matches = await supabaseGet<MatchRow[]>(
        `/predict_matches?select=id,external_id,stage,home_score,away_score,home_penalties,away_penalties,winner,team_advancing&external_id=eq.${encodeURIComponent(prediction.externalId)}&limit=1`,
      );
      const match = matches[0];
      if (!match) throw new Error(`Матч не знайдено: ${prediction.externalId}`);

      const existing = await supabaseGet<Array<{ id: number }>>(
        `/predict_predictions?select=id&user_id=eq.${encodeURIComponent(user.id)}&match_id=eq.${match.id}&limit=1`,
      );
      const points = scoreBackfillPrediction(match, prediction);
      const row = {
        user_id: user.id,
        match_id: match.id,
        local_match_id: prediction.localMatchId,
        predicted_home_score: prediction.predictedHomeScore,
        predicted_away_score: prediction.predictedAwayScore,
        predicted_advancing: prediction.predictedAdvancing ?? null,
        predicted_home_penalties: prediction.predictedHomeScore === prediction.predictedAwayScore ? prediction.predictedHomePenalties ?? null : null,
        predicted_away_penalties: prediction.predictedHomeScore === prediction.predictedAwayScore ? prediction.predictedAwayPenalties ?? null : null,
        points_outcome: points.outcome,
        points_advancing: points.advancing,
        points_penalty: points.penalty,
      };

      if (existing[0]) {
        await supabasePatch(`/predict_predictions?id=eq.${existing[0].id}`, row, "return=minimal");
      } else {
        await supabasePost("/predict_predictions", row, "return=minimal");
      }

      updated.push({
        user: user.display_name ?? user.username,
        externalId: prediction.externalId,
        points: points.outcome + points.advancing + points.penalty,
      });
    }

    await supabaseRpc("predict_recalculate_user_totals");
    response.status(200).json({ updated });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося додати прогнози." });
  }
}

function validatePrediction(prediction: BackfillPrediction) {
  if (!prediction.externalId || !Number.isInteger(prediction.localMatchId)) {
    throw new Error("У прогнозі не вистачає матчу.");
  }
  if (!Number.isInteger(prediction.predictedHomeScore) || !Number.isInteger(prediction.predictedAwayScore)) {
    throw new Error(`Некоректний рахунок для ${prediction.externalId}.`);
  }
  if (prediction.predictedHomeScore < 0 || prediction.predictedAwayScore < 0) {
    throw new Error(`Рахунок не може бути відʼємним для ${prediction.externalId}.`);
  }
}

function findUser(users: UserRow[], prediction: BackfillPrediction) {
  if (prediction.userId) return users.find(user => user.id === prediction.userId);
  if (prediction.username) return users.find(user => user.username === prediction.username);
  if (prediction.displayName) return users.find(user => user.display_name === prediction.displayName);
  return null;
}

function scoreBackfillPrediction(match: MatchRow, prediction: BackfillPrediction) {
  if (match.home_score === null || match.away_score === null || !match.winner) {
    return { outcome: 0, advancing: 0, penalty: 0 };
  }

  const predictedWinner =
    prediction.predictedHomeScore > prediction.predictedAwayScore
      ? "home"
      : prediction.predictedHomeScore < prediction.predictedAwayScore
        ? "away"
        : "draw";
  const exact = prediction.predictedHomeScore === match.home_score && prediction.predictedAwayScore === match.away_score;
  const outcome = match.stage === "group"
    ? exact ? 10 : predictedWinner === match.winner ? 5 : 0
    : (predictedWinner === match.winner ? 10 : 0) + (exact ? 10 : 0);
  const advancing = match.stage !== "group" && prediction.predictedAdvancing === match.team_advancing ? 5 : 0;
  const penalty =
    match.stage !== "group" &&
    prediction.predictedHomeScore === prediction.predictedAwayScore &&
    match.home_penalties !== null &&
    match.away_penalties !== null &&
    prediction.predictedHomePenalties === match.home_penalties &&
    prediction.predictedAwayPenalties === match.away_penalties
      ? 10
      : 0;

  return { outcome, advancing, penalty };
}
