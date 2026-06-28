import {
  getSessionUserId,
  getUserBundle,
  requirePredictEnv,
  supabaseGet,
  toClientUser,
  type ApiRequest,
  type ApiResponse,
  type DbPrediction,
  type DbTournamentPrediction,
  type DbUser,
} from "./_utils/predictApi.js";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  try {
    requirePredictEnv();
    if (request.method !== "GET") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const userId = await getSessionUserId(request);
    const [users, predictions, tournaments, currentUser] = await Promise.all([
      supabaseGet<DbUser[]>("/predict_users?select=*&order=total_points.desc"),
      supabaseGet<Array<DbPrediction & { user_id: string }>>("/predict_predictions?select=user_id,match_id,local_match_id,predicted_home_score,predicted_away_score,predicted_home_penalties,predicted_away_penalties,predicted_advancing,points_outcome,points_advancing,points_penalty,created_at"),
      supabaseGet<Array<DbTournamentPrediction & { user_id: string }>>("/predict_tournament_predictions?select=user_id,champion,finalist,top_scorer,dark_horse,points_champion,points_finalist,points_top_scorer,points_dark_horse"),
      userId ? getUserBundle(userId) : Promise.resolve(null),
    ]);

    response.status(200).json({
      currentUser,
      users: users.map(user => toClientUser(
        user,
        predictions.filter(prediction => prediction.user_id === user.id),
        tournaments.find(tournament => tournament.user_id === user.id),
      )),
    });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : "Не вдалося завантажити Predict users." });
  }
}
