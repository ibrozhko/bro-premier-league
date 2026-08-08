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
  points int not null default 0,
  locked boolean default true,
  created_at timestamptz default now(),
  unique(user_id, match_id)
);

create table if not exists season2_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references season2_users(id) on delete cascade not null,
  player_id text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

create table if not exists season2_match_scheduling (
  match_id text primary key,
  round integer not null,
  home_player_id text not null,
  away_player_id text not null,
  home_day_status text not null default 'pending',
  away_day_status text not null default 'pending',
  home_proposed_time text,
  away_proposed_time text,
  agreed_time text,
  status text not null default 'pending',
  updated_by_player_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table season2_users add column if not exists player_id text;
alter table season2_users add column if not exists display_name text;
alter table season2_users add column if not exists is_admin boolean default false;

alter table season2_predictions add column if not exists player_id text;
alter table season2_predictions add column if not exists round int;
alter table season2_predictions add column if not exists home_player_id text;
alter table season2_predictions add column if not exists away_player_id text;
alter table season2_predictions add column if not exists points int not null default 0;
alter table season2_predictions add column if not exists locked boolean default true;

alter table season2_push_subscriptions add column if not exists player_id text;
alter table season2_push_subscriptions add column if not exists user_agent text;
alter table season2_push_subscriptions add column if not exists updated_at timestamptz default now();

alter table season2_match_scheduling add column if not exists round integer not null default 1;
alter table season2_match_scheduling add column if not exists home_player_id text not null default '';
alter table season2_match_scheduling add column if not exists away_player_id text not null default '';
alter table season2_match_scheduling add column if not exists home_day_status text not null default 'pending';
alter table season2_match_scheduling add column if not exists away_day_status text not null default 'pending';
alter table season2_match_scheduling add column if not exists home_proposed_time text;
alter table season2_match_scheduling add column if not exists away_proposed_time text;
alter table season2_match_scheduling add column if not exists agreed_time text;
alter table season2_match_scheduling add column if not exists status text not null default 'pending';
alter table season2_match_scheduling add column if not exists updated_by_player_id text;
alter table season2_match_scheduling add column if not exists created_at timestamptz default now() not null;
alter table season2_match_scheduling add column if not exists updated_at timestamptz default now() not null;

alter table season2_match_scheduling
  drop constraint if exists season2_match_scheduling_home_day_status_check,
  add constraint season2_match_scheduling_home_day_status_check
  check (home_day_status in ('pending', 'available', 'reschedule'));

alter table season2_match_scheduling
  drop constraint if exists season2_match_scheduling_away_day_status_check,
  add constraint season2_match_scheduling_away_day_status_check
  check (away_day_status in ('pending', 'available', 'reschedule'));

alter table season2_match_scheduling
  drop constraint if exists season2_match_scheduling_status_check,
  add constraint season2_match_scheduling_status_check
  check (status in ('pending', 'day_confirmed', 'negotiating', 'scheduled', 'postponed'));

alter table season2_users enable row level security;
alter table season2_predictions enable row level security;
alter table season2_push_subscriptions enable row level security;
alter table season2_match_scheduling enable row level security;

drop policy if exists "season2 users are service-role managed" on season2_users;
drop policy if exists "season2 predictions are service-role managed" on season2_predictions;
drop policy if exists "season2 push subscriptions are service-role managed" on season2_push_subscriptions;
drop policy if exists "season2 match scheduling is service-role managed" on season2_match_scheduling;

create policy "season2 users are service-role managed" on season2_users
for all using (false);

create policy "season2 predictions are service-role managed" on season2_predictions
for all using (false);

create policy "season2 push subscriptions are service-role managed" on season2_push_subscriptions
for all using (false);

create policy "season2 match scheduling is service-role managed" on season2_match_scheduling
for all using (false);
