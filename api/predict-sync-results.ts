import { predictMatches } from "../src/data/predictData.js";

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
  stage?: string;
  group?: string;
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

const footballDataMatchIds: Record<number, string> = {
  537369: "WC2026-G-14",
};

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
      const stage = mapStage(match.stage);
      const localMatchResult = findLocalMatch(match, stage);
      const localMatch = localMatchResult?.match;
      const externalId = localMatch?.externalId ?? String(match.id);
      const rawHomeScore = status === "finished" ? fullTime?.home ?? null : null;
      const rawAwayScore = status === "finished" ? fullTime?.away ?? null : null;
      const rawWinner = mapWinner(match.score.winner);
      const homeScore = localMatchResult?.isReversed ? rawAwayScore : rawHomeScore;
      const awayScore = localMatchResult?.isReversed ? rawHomeScore : rawAwayScore;
      const winner = localMatchResult?.isReversed ? reverseWinner(rawWinner) : rawWinner;

      await supabaseUpsertMatch({
        external_id: externalId,
        stage,
        group_name: localMatch?.groupName ?? match.group ?? null,
        status,
        match_date: localMatch?.matchDate ?? match.utcDate,
        home_team: localMatch?.homeTeam ?? normalizeTeamName(match.homeTeam.name ?? match.homeTeam.shortName ?? "TBD"),
        away_team: localMatch?.awayTeam ?? normalizeTeamName(match.awayTeam.name ?? match.awayTeam.shortName ?? "TBD"),
        home_score: homeScore,
        away_score: awayScore,
        winner,
      });

      if (status === "finished") {
        await recalculatePredictions(externalId, homeScore, awayScore, winner);
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
    `/predict_predictions?select=id,predicted_home_score,predicted_away_score,predicted_advancing,predict_matches!inner(stage,team_advancing)&predict_matches.external_id=eq.${encodeURIComponent(externalId)}`,
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
    const pointsOutcome = row.predict_matches.stage === "group"
      ? exact ? 10 : predictedWinner === winner ? 5 : 0
      : (predictedWinner === winner ? 10 : 0) + (exact ? 10 : 0);
    const pointsAdvancing =
      row.predict_matches.stage !== "group" && row.predicted_advancing === row.predict_matches.team_advancing ? 5 : 0;

    await supabasePatch(`/predict_predictions?id=eq.${row.id}`, {
      points_outcome: pointsOutcome,
      points_advancing: pointsAdvancing,
    });
  }
}

async function supabaseGet<T>(path: string): Promise<T> {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error(`Supabase GET ${path} failed: ${response.status} ${await safeErrorText(response)}`);
  return response.json() as Promise<T>;
}

async function supabasePatch(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase PATCH ${path} failed: ${response.status} ${await safeErrorText(response)}`);
}

async function supabaseUpsertMatch(body: Record<string, unknown>) {
  const response = await fetch(`${supabaseRestUrl()}/predict_matches?on_conflict=external_id`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase UPSERT predict_matches failed: ${response.status} ${await safeErrorText(response)}`);
}

async function supabaseRpc(functionName: string) {
  const response = await fetch(`${supabaseRestUrl()}/rpc/${functionName}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`Supabase RPC ${functionName} failed: ${response.status} ${await safeErrorText(response)}`);
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

function mapStage(stage?: string) {
  const normalized = stage?.toLowerCase() ?? "";
  if (normalized.includes("last_32") || normalized.includes("round_of_32")) return "round_of_32";
  if (normalized.includes("last_16") || normalized.includes("round_of_16")) return "round_of_16";
  if (normalized.includes("quarter")) return "quarterfinal";
  if (normalized.includes("semi")) return "semifinal";
  if (normalized.includes("third") || normalized.includes("bronze")) return "bronze";
  if (normalized.includes("final")) return "final";
  return "group";
}

function findLocalMatch(match: FootballDataMatch, stage: string) {
  const mappedExternalId = footballDataMatchIds[match.id];
  if (mappedExternalId) {
    const match = predictMatches.find(localMatch => localMatch.externalId === mappedExternalId);
    return match ? { match, isReversed: false } : null;
  }

  const homeTeam = normalizeTeamName(match.homeTeam.name ?? match.homeTeam.shortName ?? "");
  const awayTeam = normalizeTeamName(match.awayTeam.name ?? match.awayTeam.shortName ?? "");

  const exactMatch = predictMatches.find(localMatch =>
    localMatch.stage === stage &&
    normalizeTeamName(localMatch.homeTeam) === homeTeam &&
    normalizeTeamName(localMatch.awayTeam) === awayTeam
  );
  if (exactMatch) return { match: exactMatch, isReversed: false };

  const reversedMatch = predictMatches.find(localMatch =>
    localMatch.stage === stage &&
    normalizeTeamName(localMatch.homeTeam) === awayTeam &&
    normalizeTeamName(localMatch.awayTeam) === homeTeam
  );
  return reversedMatch ? { match: reversedMatch, isReversed: true } : null;
}

function reverseWinner(winner: string | null) {
  if (winner === "home") return "away";
  if (winner === "away") return "home";
  return winner;
}

function normalizeTeamName(name: string) {
  const normalized = name.trim();
  const aliases: Record<string, string> = {
    "Bosnia-Herzegovina": "Bosnia and Herzegovina",
    "Bosnia & Herzegovina": "Bosnia and Herzegovina",
    "Cabo Verde": "Cape Verde",
    "Cape Verde Islands": "Cape Verde",
    "Congo DR": "DR Congo",
    "Congo, The Democratic Republic of the": "DR Congo",
    "Côte d'Ivoire": "Ivory Coast",
    "Cote d'Ivoire": "Ivory Coast",
    "Curaçao": "Curacao",
    "Czech Republic": "Czechia",
    "Korea Republic": "South Korea",
    "South Korea Republic": "South Korea",
    "Türkiye": "Turkey",
    "USA": "United States",
    "United States of America": "United States",
  };

  return aliases[normalized] ?? normalized;
}

function supabaseRestUrl() {
  const rawUrl = process.env.PREDICT_SUPABASE_URL!.replace(/\/+$/, "");
  return rawUrl.endsWith("/rest/v1") ? rawUrl : `${rawUrl}/rest/v1`;
}

async function safeErrorText(response: Response) {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return "";
  }
}

function getBearerToken(request: ApiRequest) {
  const header = request.headers?.authorization ?? request.headers?.Authorization;
  const value = Array.isArray(header) ? header[0] : header;
  return value?.startsWith("Bearer ") ? value.slice("Bearer ".length) : "";
}
