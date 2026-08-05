import {
  clearSessionCookie,
  getSeason2UserBundle,
  getSessionUserId,
  parseBody,
  requireSeason2Env,
  setSessionCookie,
  supabaseGet,
  verifyPassword,
  type ApiRequest,
  type ApiResponse,
  type Season2DbUser,
} from "./_utils/season2Api.js";

type AuthPayload = {
  action?: "login" | "logout";
  username?: string;
  password?: string;
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requireSeason2Env();

    if (request.method === "GET") {
      const userId = await getSessionUserId(request);
      response.status(200).json({ user: userId ? await getSeason2UserBundle(userId) : null });
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const payload = parseBody<AuthPayload>(request.body);
    if (!payload?.action) {
      response.status(400).json({ error: "Некоректний запит." });
      return;
    }

    if (payload.action === "logout") {
      clearSessionCookie(response);
      response.status(200).json({ ok: true });
      return;
    }

    const username = payload.username?.trim() ?? "";
    const password = payload.password ?? "";
    const rows = await supabaseGet<Season2DbUser[]>(
      `/season2_users?select=*&username=eq.${encodeURIComponent(username)}&limit=1`,
    );
    const user = rows[0];

    if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
      response.status(401).json({ error: "Невірний нік у FC 26 або пароль." });
      return;
    }

    setSessionCookie(response, user.id);
    response.status(200).json({ user: await getSeason2UserBundle(user.id) });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Помилка входу Season 2." });
  }
}
