import {
  requirePredictEnv,
  supabaseGet,
  type ApiRequest,
  type ApiResponse,
} from "./_utils/predictApi.js";

type DbMatch = {
  id: number;
  external_id: string;
  stage: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "bronze" | "final";
  group_name?: string | null;
  match_date: string;
  home_team: string;
  away_team: string;
  status: "scheduled" | "live" | "finished";
  home_score: number | null;
  away_score: number | null;
  home_penalties?: number | null;
  away_penalties?: number | null;
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
      "/predict_matches?select=id,external_id,stage,group_name,match_date,home_team,away_team,status,home_score,away_score,home_penalties,away_penalties,winner,team_advancing&order=match_date.asc",
    );

    response.status(200).json({
      matches: rows.map(row => ({
        externalId: row.external_id,
        id: row.id,
        stage: row.stage,
        groupName: row.group_name ?? undefined,
        matchDate: row.match_date,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        status: row.status,
        homeScore: row.home_score,
        awayScore: row.away_score,
        homePenalties: row.home_penalties ?? null,
        awayPenalties: row.away_penalties ?? null,
        winner: row.winner,
        teamAdvancing: row.team_advancing,
      })),
    });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося завантажити матчі." });
  }
}
