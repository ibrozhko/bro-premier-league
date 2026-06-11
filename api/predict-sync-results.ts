type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type FootballDataMatch = {
  id: number;
  status: string;
  utcDate: string;
  homeTeam: { name?: string; shortName?: string };
  awayTeam: { name?: string; shortName?: string };
  score: {
    fullTime?: { home: number | null; away: number | null };
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW";
  };
};

const requiredEnvVars = [
  "PREDICT_SUPABASE_URL",
  "PREDICT_SUPABASE_SERVICE_ROLE_KEY",
  "FOOTBALL_DATA_API_KEY",
] as const;

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (process.env.CRON_SECRET && getBearerToken(request) !== process.env.CRON_SECRET) {
    response.status(401).json({ error: "Unauthorized" });
    return;
  }

  const missing = requiredEnvVars.find(key => !process.env[key]);
  if (missing) {
    response.status(500).json({ error: `Missing environment variable: ${missing}` });
    return;
  }

  try {
    const footballResponse = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
    });

    if (!footballResponse.ok) {
      throw new Error(`football-data.org returned ${footballResponse.status}`);
    }

    const payload = await footballResponse.json() as { matches?: FootballDataMatch[] };
    const matches = payload.matches ?? [];
    let updated = 0;

    for (const match of matches) {
      const status = mapStatus(match.status);
      const fullTime = match.score.fullTime;
      const homeScore = status === "finished" ? fullTime?.home ?? null : null;
      const awayScore = status === "finished" ? fullTime?.away ?? null : null;
      const winner = mapWinner(match.score.winner);

      await supabasePatch(
        `/rest/v1/predict_matches?external_id=eq.${encodeURIComponent(String(match.id))}`,
        {
          status,
          match_date: match.utcDate,
          home_team: match.homeTeam.shortName ?? match.homeTeam.name,
          away_team: match.awayTeam.shortName ?? match.awayTeam.name,
          home_score: homeScore,
          away_score: awayScore,
          winner,
        },
      );

      if (status === "finished") {
        await recalculatePredictions(String(match.id), homeScore, awayScore, winner);
        updated += 1;
      }
    }

    await supabaseRpc("predict_recalculate_user_totals");
    response.status(200).json({ updatedFinishedMatches: updated, seenMatches: matches.length });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
  }
}

async function recalculatePredictions(externalId: string, homeScore: number | null, awayScore: number | null, winner: string | null) {
  if (homeScore === null || awayScore === null || !winner) return;

  const rows = await supabaseGet<Array<{
    id: number;
    predicted_home_score: number | null;
    predicted_away_score: number | null;
    predicted_advancing: string | null;
    predict_matches: { stage: string; team_advancing: string | null };
  }>>(
    `/rest/v1/predict_predictions?select=id,predicted_home_score,predicted_away_score,predicted_advancing,predict_matches!inner(stage,team_advancing)&predict_matches.external_id=eq.${encodeURIComponent(externalId)}`,
  );

  for (const row of rows) {
    const predictedWinner =
      row.predicted_home_score === null || row.predicted_away_score === null
        ? null
        : row.predicted_home_score > row.predicted_away_score
          ? "home"
          : row.predicted_home_score < row.predicted_away_score
            ? "away"
            : "draw";
    const exact = row.predicted_home_score === homeScore && row.predicted_away_score === awayScore;
    const pointsOutcome = exact ? 10 : predictedWinner === winner ? 5 : 0;
    const pointsAdvancing =
      row.predict_matches.stage !== "group" && row.predicted_advancing === row.predict_matches.team_advancing ? 5 : 0;

    await supabasePatch(`/rest/v1/predict_predictions?id=eq.${row.id}`, {
      points_outcome: pointsOutcome,
      points_advancing: pointsAdvancing,
    });
  }
}

async function supabaseGet<T>(path: string): Promise<T> {
  const response = await fetch(`${process.env.PREDICT_SUPABASE_URL}${path}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error(`Supabase GET failed: ${response.status}`);
  return response.json() as Promise<T>;
}

async function supabasePatch(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${process.env.PREDICT_SUPABASE_URL}${path}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase PATCH failed: ${response.status}`);
}

async function supabaseRpc(functionName: string) {
  const response = await fetch(`${process.env.PREDICT_SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`Supabase RPC failed: ${response.status}`);
}

function supabaseHeaders() {
  return {
    apikey: process.env.PREDICT_SUPABASE_SERVICE_ROLE_KEY!,
    Authorization: `Bearer ${process.env.PREDICT_SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

function mapStatus(status: string) {
  if (status === "FINISHED") return "finished";
  if (status === "IN_PLAY" || status === "PAUSED") return "live";
  return "scheduled";
}

function mapWinner(winner?: string) {
  if (winner === "HOME_TEAM") return "home";
  if (winner === "AWAY_TEAM") return "away";
  if (winner === "DRAW") return "draw";
  return null;
}

function getBearerToken(request: ApiRequest) {
  const header = request.headers?.authorization ?? request.headers?.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length) : "";
}
