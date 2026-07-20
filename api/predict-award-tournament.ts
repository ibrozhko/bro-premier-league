import { isAdminRequest, type AdminRequest } from "./_utils/adminAuth.js";
import {
  parseBody,
  requirePredictEnv,
  supabaseGet,
  supabasePatch,
  supabaseRpc,
  type ApiResponse,
} from "./_utils/predictApi.js";

type ApiRequest = AdminRequest & {
  method?: string;
  body?: unknown;
};

type AwardPayload = {
  password?: string;
};

type TournamentRow = {
  user_id: string;
  champion: string;
  finalist: string;
  top_scorer: string;
  dark_horse: string;
};

type UserRow = {
  id: string;
  username: string;
  display_name: string | null;
};

const champion = "Spain";
const topScorer = "Kylian Mbappe";
const darkHorseTopFour = new Set(["England", "France", "Spain", "Argentina"]);

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();

    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const payload = parseBody<AwardPayload>(request.body) ?? {};
    if (!isAdminRequest(request, payload.password)) {
      response.status(401).json({ error: "Потрібен доступ адміна." });
      return;
    }

    const [users, tournaments] = await Promise.all([
      supabaseGet<UserRow[]>("/predict_users?select=id,username,display_name"),
      supabaseGet<TournamentRow[]>("/predict_tournament_predictions?select=user_id,champion,finalist,top_scorer,dark_horse"),
    ]);
    const userById = new Map(users.map(user => [user.id, user]));
    const awarded = [];

    for (const tournament of tournaments) {
      const pointsChampion = tournament.champion === champion ? 50 : 0;
      const pointsTopScorer = tournament.top_scorer.trim().toLowerCase() === topScorer.toLowerCase() ? 50 : 0;
      const pointsDarkHorse = darkHorseTopFour.has(tournament.dark_horse) ? 50 : 0;

      await supabasePatch(
        `/predict_tournament_predictions?user_id=eq.${encodeURIComponent(tournament.user_id)}`,
        {
          points_champion: pointsChampion,
          points_top_scorer: pointsTopScorer,
          points_dark_horse: pointsDarkHorse,
        },
        "return=minimal",
      );

      const user = userById.get(tournament.user_id);
      awarded.push({
        user: user?.display_name ?? user?.username ?? tournament.user_id,
        username: user?.username ?? "",
        pointsChampion,
        pointsTopScorer,
        pointsDarkHorse,
        total: pointsChampion + pointsTopScorer + pointsDarkHorse,
      });
    }

    await supabaseRpc("predict_recalculate_user_totals");
    response.status(200).json({ awarded });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося нарахувати турнірні бонуси." });
  }
}
