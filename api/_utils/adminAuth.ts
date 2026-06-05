import { createHmac, timingSafeEqual } from "node:crypto";

type HeaderValue = string | string[] | undefined;

export type AdminRequest = {
  headers?: Record<string, HeaderValue>;
};

export type AdminResponse = {
  setHeader?: (name: string, value: string | string[]) => void;
};

export type AdminUser = {
  username: string;
  name?: string;
};

type AdminAccount = AdminUser & {
  password: string;
};

type SessionPayload = {
  username: string;
  expiresAt: number;
};

const sessionCookieName = "bpl_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export function validateAdminPassword(password?: string) {
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}

export function validateAdminCredentials(username?: string, password?: string): AdminUser | null {
  const account = getAdminAccounts().find(user => user.username === username && user.password === password);
  if (!account) return null;

  return {
    username: account.username,
    name: account.name,
  };
}

export function getSessionUser(request: AdminRequest): AdminUser | null {
  const cookie = getCookie(request, sessionCookieName);
  if (!cookie) return null;

  const [payloadValue, signature] = cookie.split(".");
  if (!payloadValue || !signature) return null;

  const expectedSignature = sign(payloadValue);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadValue, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.username || payload.expiresAt < Date.now()) return null;

    const account = getAdminAccounts().find(user => user.username === payload.username);
    if (!account) return null;

    return {
      username: account.username,
      name: account.name,
    };
  } catch {
    return null;
  }
}

export function isAdminRequest(request: AdminRequest, password?: string) {
  return Boolean(getSessionUser(request) || validateAdminPassword(password));
}

export function setSessionCookie(response: AdminResponse, user: AdminUser) {
  const payload = Buffer.from(JSON.stringify({
    username: user.username,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000,
  } satisfies SessionPayload)).toString("base64url");

  response.setHeader?.("Set-Cookie", [
    `${sessionCookieName}=${payload}.${sign(payload)}; Path=/; Max-Age=${sessionMaxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`,
  ]);
}

export function clearSessionCookie(response: AdminResponse) {
  response.setHeader?.("Set-Cookie", [
    `${sessionCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  ]);
}

function getAdminAccounts(): AdminAccount[] {
  if (!process.env.ADMIN_USERS) return [];

  try {
    const parsed = JSON.parse(process.env.ADMIN_USERS) as AdminAccount[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(user => Boolean(user.username && user.password));
  } catch {
    return [];
  }
}

function getCookie(request: AdminRequest, name: string) {
  const cookieHeader = getHeader(request, "cookie");
  if (!cookieHeader) return "";

  return cookieHeader
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1) ?? "";
}

function getHeader(request: AdminRequest, name: string) {
  const headers = request.headers ?? {};
  const value = headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] : value;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "development-admin-session-secret";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
