import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type HeaderValue = string | string[] | undefined;

export type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, HeaderValue>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string | string[]) => void;
};

export type DbUser = {
  id: string;
  username: string;
  display_name?: string | null;
  password_hash?: string;
  invite_code: string;
  invited_by: string | null;
  invites_remaining: number;
  is_admin: boolean;
  favorite_team: string | null;
  total_points: number;
  created_at: string;
};

export type DbPrediction = {
  match_id: number;
  local_match_id?: number | null;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_home_penalties?: number | null;
  predicted_away_penalties?: number | null;
  predicted_advancing: "home" | "away" | null;
  points_outcome: number;
  points_advancing: number;
  points_penalty: number;
  created_at: string;
};

export type DbTournamentPrediction = {
  champion: string;
  finalist: string;
  top_scorer: string;
  dark_horse: string;
  points_champion: number;
  points_finalist: number;
  points_top_scorer: number;
  points_dark_horse: number;
};

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

const sessionCookieName = "bpl_predict_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export function requirePredictEnv() {
  const missing = ["PREDICT_SUPABASE_URL", "PREDICT_SUPABASE_SERVICE_ROLE_KEY", "PREDICT_SESSION_SECRET"]
    .find(key => !process.env[key]);
  if (missing) throw new Error(`Missing environment variable: ${missing}`);
}

export function parseBody<T>(body: unknown): T | null {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as T;
    } catch {
      return null;
    }
  }
  return body && typeof body === "object" ? body as T : null;
}

export async function supabaseGet<T>(path: string): Promise<T> {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error(`Supabase GET ${path} failed: ${response.status} ${await safeErrorText(response)}`);
  return response.json() as Promise<T>;
}

export async function supabasePost<T>(path: string, body: unknown, prefer = "return=representation"): Promise<T> {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: prefer },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase POST ${path} failed: ${response.status} ${await safeErrorText(response)}`);
  if (prefer.includes("return=minimal")) return undefined as T;
  return response.json() as Promise<T>;
}

export async function supabasePatch<T>(path: string, body: unknown, prefer = "return=representation"): Promise<T> {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    method: "PATCH",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json", Prefer: prefer },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Supabase PATCH ${path} failed: ${response.status} ${await safeErrorText(response)}`);
  if (prefer.includes("return=minimal")) return undefined as T;
  return response.json() as Promise<T>;
}

export async function supabaseRpc(functionName: string) {
  const response = await fetch(`${supabaseRestUrl()}/rpc/${functionName}`, {
    method: "POST",
    headers: { ...supabaseHeaders(), "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`Supabase RPC ${functionName} failed: ${response.status} ${await safeErrorText(response)}`);
}

export async function getSessionUserId(request: ApiRequest) {
  const cookie = getCookie(request, sessionCookieName);
  if (!cookie) return "";
  const [payloadValue, signature] = cookie.split(".");
  if (!payloadValue || !signature || !safeEqual(signature, sign(payloadValue))) return "";

  try {
    const payload = JSON.parse(Buffer.from(payloadValue, "base64url").toString("utf8")) as SessionPayload;
    return payload.expiresAt >= Date.now() ? payload.userId : "";
  } catch {
    return "";
  }
}

export function setSessionCookie(response: ApiResponse, userId: string) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
  } satisfies SessionPayload)).toString("base64url");

  response.setHeader?.("Set-Cookie", [
    `${sessionCookieName}=${payload}.${sign(payload)}; Path=/; Max-Age=${sessionMaxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`,
  ]);
}

export function clearSessionCookie(response: ApiResponse) {
  response.setHeader?.("Set-Cookie", [
    `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  ]);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const key = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${key}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [scheme, salt, key] = storedHash.split("$");
  if (scheme !== "scrypt" || !salt || !key) return false;
  const actual = Buffer.from(scryptSync(password, salt, 64).toString("base64url"));
  const expected = Buffer.from(key);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function inviteCodeFor(username?: string) {
  void username;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const code = Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
  return `BPL-${code}`;
}

export async function getUserBundle(userId: string) {
  const userRows = await supabaseGet<DbUser[]>(
    `/predict_users?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const user = userRows[0];
  if (!user) return null;

  const [predictionRows, tournamentRows] = await Promise.all([
    supabaseGet<DbPrediction[]>(`/predict_predictions?select=match_id,local_match_id,predicted_home_score,predicted_away_score,predicted_home_penalties,predicted_away_penalties,predicted_advancing,points_outcome,points_advancing,points_penalty,created_at&user_id=eq.${encodeURIComponent(user.id)}`),
    supabaseGet<DbTournamentPrediction[]>(`/predict_tournament_predictions?select=champion,finalist,top_scorer,dark_horse,points_champion,points_finalist,points_top_scorer,points_dark_horse&user_id=eq.${encodeURIComponent(user.id)}&limit=1`),
  ]);

  return toClientUser(user, predictionRows, tournamentRows[0]);
}

export function toClientUser(user: DbUser, predictions: DbPrediction[] = [], tournament?: DbTournamentPrediction | null) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name ?? undefined,
    inviteCode: user.invite_code,
    invitedBy: user.invited_by ?? undefined,
    invitesRemaining: user.invites_remaining,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
    totalPoints: user.total_points,
    predictions: Object.fromEntries(predictions.map(prediction => [
      prediction.local_match_id ?? prediction.match_id,
      {
        matchId: prediction.local_match_id ?? prediction.match_id,
        predictedHomeScore: prediction.predicted_home_score,
        predictedAwayScore: prediction.predicted_away_score,
        predictedHomePenalties: prediction.predicted_home_penalties ?? undefined,
        predictedAwayPenalties: prediction.predicted_away_penalties ?? undefined,
        predictedAdvancing: prediction.predicted_advancing ?? undefined,
        pointsOutcome: prediction.points_outcome,
        pointsAdvancing: prediction.points_advancing,
        pointsPenalty: prediction.points_penalty ?? 0,
        updatedAt: prediction.created_at,
      },
    ])),
    tournamentPrediction: {
      champion: tournament?.champion ?? "",
      finalist: tournament?.finalist ?? "",
      topScorer: tournament?.top_scorer ?? "",
      darkHorse: tournament?.dark_horse ?? "",
      favoriteTeam: user.favorite_team ?? "",
      pointsChampion: tournament?.points_champion ?? 0,
      pointsFinalist: tournament?.points_finalist ?? 0,
      pointsTopScorer: tournament?.points_top_scorer ?? 0,
      pointsDarkHorse: tournament?.points_dark_horse ?? 0,
    },
  };
}

function supabaseRestUrl() {
  const rawUrl = process.env.PREDICT_SUPABASE_URL!.replace(/\/+$/, "");
  return rawUrl.endsWith("/rest/v1") ? rawUrl : `${rawUrl}/rest/v1`;
}

function supabaseHeaders() {
  return {
    apikey: process.env.PREDICT_SUPABASE_SERVICE_ROLE_KEY!,
    Authorization: `Bearer ${process.env.PREDICT_SUPABASE_SERVICE_ROLE_KEY}`,
  };
}

async function safeErrorText(response: Response) {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return "";
  }
}

function getCookie(request: ApiRequest, name: string) {
  const cookieHeader = getHeader(request, "cookie");
  if (!cookieHeader) return "";
  return cookieHeader
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? "";
}

function getHeader(request: ApiRequest, name: string) {
  const headers = request.headers ?? {};
  const value = headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sign(value: string) {
  return createHmac("sha256", process.env.PREDICT_SESSION_SECRET!).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
