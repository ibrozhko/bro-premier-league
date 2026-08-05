create extension if not exists pgcrypto;

create table if not exists season2_users (
  id uuid primary key default gen_random_uuid(),
  player_id text unique not null,
  username text unique not null,
  display_name text,
  password_hash text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists season2_predictions (
  id serial primary key,
  user_id uuid references season2_users(id) not null,
  player_id text not null,
  match_id text not null,
  round int not null,
  home_player_id text not null,
  away_player_id text not null,
  predicted_home_score int not null,
  predicted_away_score int not null,
  locked boolean default true,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

alter table season2_users add column if not exists player_id text;
alter table season2_users add column if not exists display_name text;
alter table season2_users add column if not exists is_admin boolean default false;

alter table season2_predictions add column if not exists player_id text;
alter table season2_predictions add column if not exists round int;
alter table season2_predictions add column if not exists home_player_id text;
alter table season2_predictions add column if not exists away_player_id text;
alter table season2_predictions add column if not exists locked boolean default true;

alter table season2_users enable row level security;
alter table season2_predictions enable row level security;

drop policy if exists "season2 users are service-role managed" on season2_users;
drop policy if exists "season2 predictions are service-role managed" on season2_predictions;

create policy "season2 users are service-role managed" on season2_users
for all using (false);

create policy "season2 predictions are service-role managed" on season2_predictions
for all using (false);
