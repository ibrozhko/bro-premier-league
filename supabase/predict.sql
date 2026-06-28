create extension if not exists pgcrypto;

create table if not exists predict_users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text,
  password_hash text not null,
  invite_code text unique not null,
  invited_by uuid references predict_users(id),
  invites_remaining int default 3,
  is_admin boolean default false,
  favorite_team text,
  total_points int default 0,
  created_at timestamptz default now()
);

alter table predict_users add column if not exists display_name text;

create table if not exists predict_matches (
  id serial primary key,
  external_id text unique,
  stage text not null check (stage in ('group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'bronze', 'final')),
  group_name text,
  match_date timestamptz not null,
  home_team text not null,
  away_team text not null,
  home_score int,
  away_score int,
  winner text check (winner in ('home', 'away', 'draw')),
  team_advancing text check (team_advancing in ('home', 'away')),
  status text default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamptz default now()
);

create table if not exists predict_predictions (
  id serial primary key,
  user_id uuid references predict_users(id) not null,
  match_id int references predict_matches(id) not null,
  local_match_id int,
  predicted_home_score int,
  predicted_away_score int,
  predicted_advancing text check (predicted_advancing in ('home', 'away')),
  points_outcome int default 0,
  points_advancing int default 0,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

alter table predict_predictions add column if not exists local_match_id int;

create table if not exists predict_tournament_predictions (
  id serial primary key,
  user_id uuid references predict_users(id) unique not null,
  champion text not null,
  finalist text not null,
  top_scorer text not null,
  dark_horse text not null,
  points_champion int default 0,
  points_finalist int default 0,
  points_top_scorer int default 0,
  points_dark_horse int default 0,
  created_at timestamptz default now()
);

create or replace function predict_recalculate_user_totals()
returns void
language sql
as $$
  update predict_users user_row
  set total_points =
    coalesce(match_points.points, 0) +
    coalesce(tournament_points.points, 0)
  from (
    select user_id, sum(points_outcome + points_advancing) as points
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

alter table predict_users enable row level security;
alter table predict_matches enable row level security;
alter table predict_predictions enable row level security;
alter table predict_tournament_predictions enable row level security;

create policy "predict matches are public" on predict_matches for select using (true);
create policy "predict leaderboard is public" on predict_users for select using (true);
create policy "predict tournament rows are public for leaderboard" on predict_tournament_predictions for select using (true);
