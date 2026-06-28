alter table predict_matches add column if not exists home_penalties int;
alter table predict_matches add column if not exists away_penalties int;

alter table predict_predictions add column if not exists predicted_home_penalties int;
alter table predict_predictions add column if not exists predicted_away_penalties int;
alter table predict_predictions add column if not exists points_penalty int default 0;

create or replace function predict_recalculate_user_totals()
returns void
language sql
as $$
  update predict_users user_row
  set total_points =
    coalesce(match_points.points, 0) +
    coalesce(tournament_points.points, 0)
  from (
    select user_id, sum(points_outcome + points_advancing + points_penalty) as points
    from predict_predictions
    group by user_id
  ) match_points
  full join (
    select
      user_id,
      sum(points_champion + points_finalist + points_top_scorer + points_dark_horse) as points
    from predict_tournament_predictions
    group by user_id
  ) tournament_points using (user_id)
  where user_row.id = coalesce(match_points.user_id, tournament_points.user_id);
$$;
