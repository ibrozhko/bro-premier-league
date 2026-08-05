import {
  getSeason2UserBundle,
  getSessionUserId,
  parseBody,
  requireSeason2Env,
  supabaseGet,
  supabasePost,
  type ApiRequest,
  type ApiResponse,
  type Season2DbPrediction,
  type Season2DbUser,
} from "./_utils/season2Api.js";

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

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

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
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося зберегти прогнози." });
  }
}
