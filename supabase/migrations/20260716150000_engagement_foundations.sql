-- Phase 3 of specs/supabase-db-redesign.md: leaderboard, streaks and points.
-- challenges catalog, user_stats maintained by DB functions, completion
-- trigger, retroactive rebuild, and the public leaderboard view.

-- 1) challenges reference catalog ------------------------------------------

create table if not exists public.challenges (
  slug text primary key,
  category text not null,
  difficulty text not null check (difficulty in ('beginner', 'moderate', 'demanding')),
  points integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger challenges_set_updated_at
  before update on public.challenges
  for each row execute procedure public.set_updated_at();

alter table public.challenges enable row level security;

create policy "challenges_select_all"
  on public.challenges for select
  using (true);

-- Initial seed from content/playground frontmatter (beginner=10, moderate=20,
-- demanding=30). Future updates come from `bun run db:sync-challenges`.
insert into public.challenges (slug, category, difficulty, points) values
  ('bug-fix-event-emitter', 'bug-fix', 'moderate', 20),
  ('bug-fix-off-by-one', 'bug-fix', 'beginner', 10),
  ('code-review-noisy-pr', 'code-review', 'moderate', 20),
  ('docs-gateway-module', 'documentation', 'beginner', 10),
  ('git-merge-conflict', 'git', 'demanding', 30),
  ('testing-fetchupstream', 'testing', 'moderate', 20)
on conflict (slug) do update set
  category = excluded.category,
  difficulty = excluded.difficulty,
  points = excluded.points,
  active = true;

-- 2) user_stats --------------------------------------------------------------

create table if not exists public.user_stats (
  user_id uuid primary key references public.users (id) on delete cascade,
  total_points integer not null default 0,
  completed_count integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  last_completed_on date,
  updated_at timestamptz not null default now()
);

create or replace trigger user_stats_set_updated_at
  before update on public.user_stats
  for each row execute procedure public.set_updated_at();

alter table public.user_stats enable row level security;

-- Select own only. No insert/update policies: rows are maintained exclusively
-- by the security definer functions below.
create policy "stats_select_own"
  on public.user_stats for select
  using (auth.uid() = user_id);

-- 3) Completion trigger -------------------------------------------------------

-- Applies points/count/streak when a session transitions to completed.
-- Only the FIRST completion of a (user, challenge) pair counts — points,
-- count and streak alike — so replaying a challenge cannot farm points.
-- Streak days are UTC calendar days.
create or replace function public.apply_completion_to_stats()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  challenge_points integer;
  completion_day date;
begin
  if exists (
    select 1 from public.challenge_sessions
    where user_id = new.user_id
      and challenge_slug = new.challenge_slug
      and status = 'completed'
      and id <> new.id
  ) then
    return new;
  end if;

  select points into challenge_points
  from public.challenges
  where slug = new.challenge_slug;

  -- Unsynced challenges score the beginner default instead of failing.
  challenge_points := coalesce(challenge_points, 10);
  completion_day := (coalesce(new.completed_at, now()) at time zone 'utc')::date;

  insert into public.user_stats as stats
    (user_id, total_points, completed_count, current_streak, best_streak, last_completed_on)
  values
    (new.user_id, challenge_points, 1, 1, 1, completion_day)
  on conflict (user_id) do update set
    total_points = stats.total_points + excluded.total_points,
    completed_count = stats.completed_count + 1,
    current_streak = case
      when stats.last_completed_on = excluded.last_completed_on then stats.current_streak
      when stats.last_completed_on = excluded.last_completed_on - 1 then stats.current_streak + 1
      else 1
    end,
    best_streak = greatest(stats.best_streak, case
      when stats.last_completed_on = excluded.last_completed_on then stats.current_streak
      when stats.last_completed_on = excluded.last_completed_on - 1 then stats.current_streak + 1
      else 1
    end),
    last_completed_on = excluded.last_completed_on;

  return new;
end;
$$;

create or replace trigger challenge_sessions_apply_completion
  after update on public.challenge_sessions
  for each row
  when (new.status = 'completed' and old.status = 'in_progress')
  execute procedure public.apply_completion_to_stats();

-- 4) Retroactive rebuild ------------------------------------------------------

-- Recomputes user_stats from scratch out of challenge_sessions × challenges
-- (first completions only). Stale current_streaks normalize to 0.
create or replace function public.rebuild_user_stats()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from public.user_stats;

  with first_completions as (
    select user_id, challenge_slug, min(completed_at) as completed_at
    from public.challenge_sessions
    where status = 'completed' and completed_at is not null
    group by user_id, challenge_slug
  ),
  day_activity as (
    select distinct user_id, (completed_at at time zone 'utc')::date as day
    from first_completions
  ),
  streak_groups as (
    select user_id, day,
           day - (row_number() over (partition by user_id order by day))::integer as grp
    from day_activity
  ),
  streaks as (
    select user_id, count(*)::integer as streak_length, max(day) as last_day
    from streak_groups
    group by user_id, grp
  ),
  streak_summary as (
    select user_id,
           max(streak_length) as best_streak,
           (array_agg(streak_length order by last_day desc))[1] as latest_streak,
           max(last_day) as last_completed_on
    from streaks
    group by user_id
  ),
  point_summary as (
    select f.user_id,
           sum(coalesce(c.points, 10))::integer as total_points,
           count(*)::integer as completed_count
    from first_completions f
    left join public.challenges c on c.slug = f.challenge_slug
    group by f.user_id
  )
  insert into public.user_stats
    (user_id, total_points, completed_count, current_streak, best_streak, last_completed_on)
  select p.user_id,
         p.total_points,
         p.completed_count,
         case
           when s.last_completed_on >= (now() at time zone 'utc')::date - 1 then s.latest_streak
           else 0
         end,
         s.best_streak,
         s.last_completed_on
  from point_summary p
  join streak_summary s using (user_id);
end;
$$;

-- Retroactive credit for already-completed sessions.
select public.rebuild_user_stats();

-- 5) Public leaderboard -------------------------------------------------------

-- Deliberate RLS bypass (security_invoker = off): exposes only aggregated,
-- non-sensitive columns for users with at least one completion.
create or replace view public.leaderboard
with (security_invoker = off)
as
select u.username,
       u.avatar_url,
       s.total_points,
       s.completed_count,
       s.best_streak
from public.user_stats s
join public.users u on u.id = s.user_id
where s.completed_count > 0
order by s.total_points desc, s.completed_count desc;

grant select on public.leaderboard to anon, authenticated;
