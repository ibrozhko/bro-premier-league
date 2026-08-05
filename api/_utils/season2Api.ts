import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type HeaderValue = string | string[] | undefined;

export type ApiRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, HeaderValue>;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string | string[]) => void;
};

export type Season2DbUser = {
  id: string;
  player_id: string;
  username: string;
  display_name: string | null;
  password_hash?: string;
  is_admin: boolean;
  created_at: string;
};

export type Season2DbPrediction = {
  id: number;
  user_id: string;
  player_id: string;
  match_id: string;
  round: number;
  home_player_id: string;
  away_player_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  locked: boolean;
  created_at: string;
};

export type Season2DbPushSubscription = {
  id: string;
  user_id: string;
  player_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

const sessionCookieName = "bpl_season2_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 90;

export function requireSeason2Env() {
  const missing = ["PREDICT_SUPABASE_URL", "PREDICT_SUPABASE_SERVICE_ROLE_KEY"]
    .find(key => !process.env[key]);
  if (missing) throw new Error(`Missing environment variable: ${missing}`);
  if (!getSessionSecret()) throw new Error("Missing environment variable: SEASON2_SESSION_SECRET or PREDICT_SESSION_SECRET");
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

export async function supabaseDelete(path: string) {
  const response = await fetch(`${supabaseRestUrl()}${path}`, {
    method: "DELETE",
    headers: supabaseHeaders(),
  });
  if (!response.ok) throw new Error(`Supabase DELETE ${path} failed: ${response.status} ${await safeErrorText(response)}`);
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

export async function getSeason2UserBundle(userId: string) {
  const userRows = await supabaseGet<Season2DbUser[]>(
    `/season2_users?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const user = userRows[0];
  if (!user) return null;

  const predictionRows = await supabaseGet<Season2DbPrediction[]>(
    `/season2_predictions?select=*&user_id=eq.${encodeURIComponent(user.id)}`,
  );

  return toClientUser(user, predictionRows);
}

export function toClientUser(user: Season2DbUser, predictions: Season2DbPrediction[] = []) {
  return {
    id: user.id,
    playerId: user.player_id,
    username: user.username,
    displayName: user.display_name ?? undefined,
    isAdmin: user.is_admin,
    createdAt: user.created_at,
    predictions: Object.fromEntries(predictions.map(prediction => [
      prediction.match_id,
      {
        matchId: prediction.match_id,
        round: prediction.round,
        homeScore: String(prediction.predicted_home_score),
        awayScore: String(prediction.predicted_away_score),
        locked: prediction.locked,
        updatedAt: prediction.created_at,
      },
    ])),
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

function getSessionSecret() {
  return process.env.SEASON2_SESSION_SECRET ?? process.env.PREDICT_SESSION_SECRET ?? "";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
