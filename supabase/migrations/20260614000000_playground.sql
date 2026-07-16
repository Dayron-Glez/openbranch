-- Users table
-- Populated on first GitHub OAuth login via Supabase Auth trigger
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  github_id text unique not null,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Challenge sessions
create table if not exists public.challenge_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_slug text not null,
  lang text not null check (lang in ('es', 'en')),
  status text not null check (status in ('in_progress', 'completed')) default 'in_progress',
  snapshot jsonb,
  attempts integer not null default 0,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- User badges
-- One row per (user, badge) — unique constraint prevents duplicates
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge text not null check (badge in ('code-reviewer', 'bug-hunter', 'test-writer')),
  earned_at timestamptz default now(),
  unique (user_id, badge)
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.challenge_sessions enable row level security;
alter table public.user_badges enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

create policy "sessions_select_own"
  on public.challenge_sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.challenge_sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.challenge_sessions for update
  using (auth.uid() = user_id);

create policy "badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "badges_insert_own"
  on public.user_badges for insert
  with check (auth.uid() = user_id);
