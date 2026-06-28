import {
  getSessionUserId,
  getUserBundle,
  parseBody,
  requirePredictEnv,
  supabaseGet,
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
  predictedHomePenalties?: number;
  predictedAwayPenalties?: number;
  predictedAdvancing?: "home" | "away";
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

    const isKnockoutDraw = payload.match.stage !== "group" && payload.predictedHomeScore === payload.predictedAwayScore;
    if (isKnockoutDraw) {
      if (
        !Number.isInteger(payload.predictedHomePenalties) ||
        !Number.isInteger(payload.predictedAwayPenalties) ||
        payload.predictedHomePenalties < 0 ||
        payload.predictedAwayPenalties < 0 ||
        payload.predictedHomePenalties === payload.predictedAwayPenalties
      ) {
        response.status(400).json({ error: "Для нічиєї в плей-офф введи рахунок серії пенальті без нічиєї." });
        return;
      }
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
    if (existing.length > 0) {
      response.status(409).json({ error: "Прогноз уже збережено і не редагується." });
      return;
    }

    await supabasePost("/predict_predictions", {
      user_id: userId,
      match_id: matchId,
      local_match_id: payload.match.id,
      predicted_home_score: payload.predictedHomeScore,
      predicted_away_score: payload.predictedAwayScore,
      predicted_home_penalties: isKnockoutDraw ? payload.predictedHomePenalties : null,
      predicted_away_penalties: isKnockoutDraw ? payload.predictedAwayPenalties : null,
      predicted_advancing: payload.predictedAdvancing ?? null,
      points_outcome: 0,
      points_advancing: 0,
      points_penalty: 0,
    }, "return=minimal");

    response.status(200).json({ user: await getUserBundle(userId) });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося зберегти прогноз." });
  }
}
