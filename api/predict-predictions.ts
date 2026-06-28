import {
  getSessionUserId,
  getUserBundle,
  parseBody,
  requirePredictEnv,
  supabaseGet,
  supabasePatch,
  supabasePost,
  type ApiRequest,
  type ApiResponse,
} from "./_utils/predictApi.js";

type SavePayload = {
  match: {
    id: number;
    externalId: string;
    stage: string;
    groupName?: string;
    matchDate: string;
    homeTeam: string;
    awayTeam: string;
  };
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedAdvancing?: "home" | "away";
  predictedHomePenalties?: number;
  predictedAwayPenalties?: number;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();
    const userId = await getSessionUserId(request);
    if (!userId) {
      response.status(401).json({ error: "Потрібен вхід." });
      return;
    }

    if (request.method === "GET") {
      response.status(200).json({ user: await getUserBundle(userId) });
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const payload = parseBody<SavePayload>(request.body);
    if (!payload?.match) {
      response.status(400).json({ error: "Некоректний прогноз." });
      return;
    }

    if (new Date(payload.match.matchDate).getTime() <= Date.now()) {
      response.status(400).json({ error: "Дедлайн для цього матчу вже настав." });
      return;
    }

    if (!Number.isInteger(payload.predictedHomeScore) || !Number.isInteger(payload.predictedAwayScore) || payload.predictedHomeScore < 0 || payload.predictedAwayScore < 0) {
      response.status(400).json({ error: "Введи два невід'ємні цілі числа." });
      return;
    }

    const predictedDraw = payload.predictedHomeScore === payload.predictedAwayScore;
    const hasPenaltyPrediction =
      Number.isInteger(payload.predictedHomePenalties) &&
      Number.isInteger(payload.predictedAwayPenalties) &&
      payload.predictedHomePenalties >= 0 &&
      payload.predictedAwayPenalties >= 0 &&
      payload.predictedHomePenalties !== payload.predictedAwayPenalties;
    if (payload.match.stage !== "group" && predictedDraw && !hasPenaltyPrediction) {
      response.status(400).json({ error: "Для нічиєї у плей-офф вкажи рахунок серії пенальті." });
      return;
    }
    if (payload.match.stage !== "group" && !predictedDraw && (payload.predictedHomePenalties !== undefined || payload.predictedAwayPenalties !== undefined)) {
      response.status(400).json({ error: "Пенальті прогнозуємо тільки якщо основний прогноз — нічия." });
      return;
    }

    const matchRows = await supabasePost<Array<{ id: number }>>(
      "/predict_matches?on_conflict=external_id",
      {
        external_id: payload.match.externalId,
        stage: payload.match.stage,
        group_name: payload.match.groupName ?? null,
        match_date: payload.match.matchDate,
        home_team: payload.match.homeTeam,
        away_team: payload.match.awayTeam,
        status: "scheduled",
      },
      "resolution=merge-duplicates,return=representation",
    );
    const matchId = matchRows[0]?.id;
    if (!matchId) throw new Error("Не вдалося створити матч для прогнозу.");

    const existing = await supabaseGet<Array<{ id: number }>>(
      `/predict_predictions?select=id&user_id=eq.${encodeURIComponent(userId)}&match_id=eq.${matchId}&limit=1`,
    );
    const predictionRow = {
      user_id: userId,
      match_id: matchId,
      local_match_id: payload.match.id,
      predicted_home_score: payload.predictedHomeScore,
      predicted_away_score: payload.predictedAwayScore,
      predicted_advancing: payload.predictedAdvancing ?? null,
      predicted_home_penalties: predictedDraw ? payload.predictedHomePenalties : null,
      predicted_away_penalties: predictedDraw ? payload.predictedAwayPenalties : null,
      points_outcome: 0,
      points_advancing: 0,
      points_penalty: 0,
    };

    if (existing.length > 0) {
      await supabasePatch(`/predict_predictions?id=eq.${existing[0].id}`, predictionRow, "return=minimal");
    } else {
      await supabasePost("/predict_predictions", predictionRow, "return=minimal");
    }

    response.status(200).json({ user: await getUserBundle(userId) });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося зберегти прогноз." });
  }
}
