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

alter table season2_push_subscriptions
  add column if not exists player_id text,
  add column if not exists user_agent text,
  add column if not exists updated_at timestamptz default now();

alter table season2_push_subscriptions enable row level security;

drop policy if exists "season2 push subscriptions are service-role managed"
  on season2_push_subscriptions;

create policy "season2 push subscriptions are service-role managed"
  on season2_push_subscriptions
  for all
  using (false)
  with check (false);
