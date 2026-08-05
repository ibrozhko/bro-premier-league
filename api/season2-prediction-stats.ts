import {
  requireSeason2Env,
  supabaseGet,
  type ApiRequest,
  type ApiResponse,
  type Season2DbPrediction,
} from "./_utils/season2Api.js";

type MatchAggregate = {
  total: number;
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

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
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося отримати статистику прогнозів." });
  }
}
