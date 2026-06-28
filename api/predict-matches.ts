import {
  requirePredictEnv,
  supabaseGet,
  type ApiRequest,
  type ApiResponse,
} from "./_utils/predictApi.js";

type DbMatch = {
  external_id: string;
  status: "scheduled" | "live" | "finished";
  home_score: number | null;
  away_score: number | null;
  home_penalties: number | null;
  away_penalties: number | null;
  winner: "home" | "away" | "draw" | null;
  team_advancing: "home" | "away" | null;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();

    if (request.method !== "GET") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const rows = await supabaseGet<DbMatch[]>(
      "/predict_matches?select=external_id,status,home_score,away_score,home_penalties,away_penalties,winner,team_advancing",
    );

    response.status(200).json({
      matches: rows.map(row => ({
        externalId: row.external_id,
        status: row.status,
        homeScore: row.home_score,
        awayScore: row.away_score,
        homePenalties: row.home_penalties,
        awayPenalties: row.away_penalties,
        winner: row.winner,
        teamAdvancing: row.team_advancing,
      })),
    });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося завантажити матчі." });
  }
}
