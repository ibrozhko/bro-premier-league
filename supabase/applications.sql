create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  platform text not null check (platform in ('PS5', 'Xbox', 'PC')),
  ea_id text not null,
  preferred_club text,
  availability text not null,
  experience text not null,
  comment text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'rejected'))
);

alter table public.applications enable row level security;
