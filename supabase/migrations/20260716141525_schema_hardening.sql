-- Phase 2 of specs/supabase-db-redesign.md: schema hardening.
-- Concurrency guards, indexes for the dominant query paths, updated_at,
-- profile refresh on login, and badge_catalog replacing the badge CHECK.

-- 1) One in-progress session per (user, challenge) ------------------------

-- Dedupe before adding the guard. saveSnapshot updates every in-progress row
-- for (user, slug), so duplicates are interchangeable; keep the oldest.
delete from public.challenge_sessions
where id in (
  select id from (
    select id,
           row_number() over (
             partition by user_id, challenge_slug
             order by started_at asc, id asc
           ) as row_num
    from public.challenge_sessions
    where status = 'in_progress'
  ) ranked
  where ranked.row_num > 1
);

create unique index if not exists challenge_sessions_one_in_progress_idx
  on public.challenge_sessions (user_id, challenge_slug)
  where status = 'in_progress';

-- 2) Indexes for the dominant query paths ---------------------------------

-- Covers ensureSession / saveSnapshot / getInProgressSnapshot /
-- markSessionCompleted and RLS filtering by user_id.
create index if not exists challenge_sessions_user_slug_status_idx
  on public.challenge_sessions (user_id, challenge_slug, status);

-- Covers the track-completion scan in awardTrackBadge (like 'prefix%').
create index if not exists challenge_sessions_track_scan_idx
  on public.challenge_sessions (user_id, status, challenge_slug text_pattern_ops);

create index if not exists user_badges_user_id_idx
  on public.user_badges (user_id);

-- 3) updated_at on challenge_sessions -------------------------------------

alter table public.challenge_sessions
  add column if not exists updated_at timestamptz not null default now();

-- Shared helper, reusable by future tables.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger challenge_sessions_set_updated_at
  before update on public.challenge_sessions
  for each row execute procedure public.set_updated_at();

-- 4) Refresh profile on every login ----------------------------------------

-- Previously `on conflict do nothing`: username/avatar were frozen at first
-- login. Now the trigger also fires on update (Supabase Auth updates
-- auth.users on each sign-in) and upserts the latest metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, github_id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'provider_id',
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      new.email
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    username = excluded.username,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_upserted
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- 5) badge_catalog replaces the badge CHECK --------------------------------

-- Adding a badge becomes an insert instead of an `alter table`. Keys must
-- stay in sync with CHALLENGE_TRACKS in features/playground/domain/manifest.ts.
create table if not exists public.badge_catalog (
  key text primary key,
  track text not null,
  created_at timestamptz not null default now()
);

insert into public.badge_catalog (key, track) values
  ('review-corps', 'code-review'),
  ('ship-it', 'bug-fix'),
  ('coverage-hero', 'testing'),
  ('first-merge', 'git'),
  ('doc-writer', 'documentation')
on conflict (key) do nothing;

alter table public.badge_catalog enable row level security;

-- Read-only catalog, safe to expose to any client.
create policy "badge_catalog_select_all"
  on public.badge_catalog for select
  using (true);

alter table public.user_badges drop constraint user_badges_badge_check;

alter table public.user_badges
  add constraint user_badges_badge_fkey
  foreign key (badge) references public.badge_catalog (key);
