import {
  clearSessionCookie,
  getSessionUser,
  setSessionCookie,
  validateAdminCredentials,
  type AdminRequest,
  type AdminResponse,
} from "./_utils/adminAuth.js";

type ApiRequest = AdminRequest & {
  method?: string;
  body?: unknown;
};

type ApiResponse = AdminResponse & {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

type AuthPayload = {
  action?: "login" | "logout" | "session";
  username?: string;
  password?: string;
};

export default function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = parseBody(request.body);
  if (!payload) {
    response.status(400).json({ error: "Некоректний JSON запит." });
    return;
  }

  const action = payload.action ?? "session";

  if (action === "session") {
    const user = getSessionUser(request);
    response.status(200).json({ authenticated: Boolean(user), user });
    return;
  }

  if (action === "logout") {
    clearSessionCookie(response);
    response.status(200).json({ authenticated: false });
    return;
  }

  if (action === "login") {
    const user = validateAdminCredentials(payload.username?.trim(), payload.password);
    if (!user) {
      response.status(401).json({ error: "Неправильний логін або пароль." });
      return;
    }

    setSessionCookie(response, user);
    response.status(200).json({ authenticated: true, user });
    return;
  }

  response.status(400).json({ error: "Невідома дія." });
}

function parseBody(body: unknown): AuthPayload | null {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as AuthPayload;
    } catch {
      return null;
    }
  }

  if (body && typeof body === "object") {
    return body as AuthPayload;
  }

  return null;
}
