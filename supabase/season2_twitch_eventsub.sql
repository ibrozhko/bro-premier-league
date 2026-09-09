create table if not exists public.season2_twitch_eventsub_events (
  message_id text primary key,
  stream_id text unique not null,
  channel_login text not null,
  created_at timestamptz default now() not null
);

alter table public.season2_twitch_eventsub_events enable row level security;

drop policy if exists "season2 twitch eventsub events are service-role managed"
  on public.season2_twitch_eventsub_events;

create policy "season2 twitch eventsub events are service-role managed"
  on public.season2_twitch_eventsub_events
  for all
  using (false)
  with check (false);
