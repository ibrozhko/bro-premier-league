create table if not exists public.season2_match_scheduling (
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
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.season2_match_scheduling
  add column if not exists round integer not null default 1,
  add column if not exists home_player_id text not null default '',
  add column if not exists away_player_id text not null default '',
  add column if not exists home_day_status text not null default 'pending',
  add column if not exists away_day_status text not null default 'pending',
  add column if not exists home_proposed_time text,
  add column if not exists away_proposed_time text,
  add column if not exists agreed_time text,
  add column if not exists status text not null default 'pending',
  add column if not exists updated_by_player_id text,
  add column if not exists created_at timestamp with time zone default now() not null,
  add column if not exists updated_at timestamp with time zone default now() not null;

alter table public.season2_match_scheduling
  drop constraint if exists season2_match_scheduling_home_day_status_check,
  add constraint season2_match_scheduling_home_day_status_check
  check (home_day_status in ('pending', 'available', 'reschedule'));

alter table public.season2_match_scheduling
  drop constraint if exists season2_match_scheduling_away_day_status_check,
  add constraint season2_match_scheduling_away_day_status_check
  check (away_day_status in ('pending', 'available', 'reschedule'));

alter table public.season2_match_scheduling
  drop constraint if exists season2_match_scheduling_status_check,
  add constraint season2_match_scheduling_status_check
  check (status in ('pending', 'day_confirmed', 'negotiating', 'scheduled', 'postponed'));

alter table public.season2_match_scheduling enable row level security;

drop policy if exists "season2 match scheduling is service-role managed" on public.season2_match_scheduling;
create policy "season2 match scheduling is service-role managed"
  on public.season2_match_scheduling
  for all
  using (false)
  with check (false);
