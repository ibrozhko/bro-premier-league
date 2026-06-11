import {
  clearSessionCookie,
  getSessionUserId,
  getUserBundle,
  hashPassword,
  inviteCodeFor,
  parseBody,
  requirePredictEnv,
  setSessionCookie,
  supabaseGet,
  supabasePatch,
  supabasePost,
  verifyPassword,
  type ApiRequest,
  type ApiResponse,
  type DbUser,
} from "./_utils/predictApi.js";

type AuthPayload = {
  action?: "login" | "logout" | "register";
  username?: string;
  password?: string;
  inviteCode?: string;
  tournamentPrediction?: {
    champion: string;
    finalist: string;
    topScorer: string;
    darkHorse: string;
    favoriteTeam: string;
  };
};

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();

    if (request.method === "GET") {
      const userId = await getSessionUserId(request);
      response.status(200).json({ user: userId ? await getUserBundle(userId) : null });
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

    if (payload.action === "login") {
      const username = payload.username?.trim() ?? "";
      const password = payload.password ?? "";
      const rows = await supabaseGet<DbUser[]>(
        `/predict_users?select=id,username,password_hash,invite_code,invited_by,invites_remaining,is_admin,favorite_team,total_points,created_at&username=eq.${encodeURIComponent(username)}&limit=1`,
      );
      const user = rows[0];
      if (!user?.password_hash || !verifyPassword(password, user.password_hash)) {
        response.status(401).json({ error: "Невірний нікнейм або пароль." });
        return;
      }

      setSessionCookie(response, user.id);
      response.status(200).json({ user: await getUserBundle(user.id) });
      return;
    }

    if (payload.action === "register") {
      const username = payload.username?.trim() ?? "";
      const password = payload.password ?? "";
      const inviteCode = payload.inviteCode?.trim().toUpperCase() ?? "";
      const tournament = payload.tournamentPrediction;

      if (username.length < 3) throw new Error("Нікнейм має містити щонайменше 3 символи.");
      if (password.length < 6) throw new Error("Пароль має містити щонайменше 6 символів.");
      if (!tournament) throw new Error("Заповни турнірні прогнози.");

      const existing = await supabaseGet<DbUser[]>(
        `/predict_users?select=id&username=eq.${encodeURIComponent(username)}&limit=1`,
      );
      if (existing.length > 0) throw new Error("Такий нікнейм вже зайнятий.");

      const inviterRows = await supabaseGet<DbUser[]>(
        `/predict_users?select=id,is_admin,invites_remaining&invite_code=eq.${encodeURIComponent(inviteCode)}&limit=1`,
      );
      const inviter = inviterRows[0];
      if (!inviter) throw new Error("Інвайт-код не знайдено.");
      if (!inviter.is_admin && inviter.invites_remaining <= 0) throw new Error("У цього інвайт-коду більше немає доступних запрошень.");

      const userRows = await supabasePost<DbUser[]>("/predict_users", {
        username,
        password_hash: hashPassword(password),
        invite_code: inviteCodeFor(username),
        invited_by: inviter.id,
        invites_remaining: 3,
        is_admin: false,
        favorite_team: tournament.favoriteTeam,
      });
      const user = userRows[0];

      await supabasePost("/predict_tournament_predictions", {
        user_id: user.id,
        champion: tournament.champion,
        finalist: tournament.finalist,
        top_scorer: tournament.topScorer,
        dark_horse: tournament.darkHorse,
      }, "return=minimal");

      if (!inviter.is_admin) {
        await supabasePatch(`/predict_users?id=eq.${encodeURIComponent(inviter.id)}`, {
          invites_remaining: Math.max(0, inviter.invites_remaining - 1),
        }, "return=minimal");
      }

      setSessionCookie(response, user.id);
      response.status(200).json({ user: await getUserBundle(user.id) });
      return;
    }

    response.status(400).json({ error: "Невідома дія." });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Помилка Predict auth." });
  }
}
