-- Public profile surface for /u/[username], per
-- specs/public-profiles-data-surface.md (module 3, PR 1 of 4).
--
-- The problem this solves: there is no public path from a username to anything.
-- public.leaderboard deliberately exposes no user_id, and public.users is
-- select-own, so today a username cannot be resolved to a user — let alone to
-- their stats, badges, completions or reads.
--
-- Every object below follows the public.leaderboard pattern: bypass RLS on a
-- narrow, purpose-built surface and grant it explicitly. No policy on any base
-- table is widened — user_stats, user_badges, challenge_sessions, doc_reads and
-- users all stay select-own for every client after this migration.
--
-- The grants are required, not tidy: supabase/config.toml leaves
-- auto_expose_new_tables commented out ("When unset, new entities are NOT
-- auto-exposed"), so PostgREST answers 401 on a correct object without one.

-- 1) username becomes genuinely unique ---------------------------------------

-- leaderboard-service.ts already assumes this ("unique upstream on GitHub and
-- refreshed on login") to match the signed-in user's own row, because the view
-- exposes no id. A route keyed on username turns that assumption into a
-- correctness requirement.
--
-- If duplicates exist this fails loudly, which is the right outcome: silently
-- picking one of two rows to serve as /u/<name> is worse than a failed deploy.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_username_key'
  ) then
    alter table public.users add constraint users_username_key unique (username);
  end if;
end $$;

-- 2) profile_overview ---------------------------------------------------------

-- Identity plus the headline numbers. Unlike leaderboard, this LEFT JOINs from
-- users and does not filter on completed_count: a leaderboard is a ranking, so
-- an entry that has earned nothing is noise, but a profile is a page and it has
-- to exist from the day someone signs up. Stats coalesce to zero.
create or replace view public.profile_overview
with (security_invoker = off)
as
select u.username,
       u.avatar_url,
       u.created_at,
       coalesce(s.total_points, 0) as total_points,
       coalesce(s.completed_count, 0) as completed_count,
       coalesce(s.current_streak, 0) as current_streak,
       coalesce(s.best_streak, 0) as best_streak,
       s.last_completed_on
from public.users u
left join public.user_stats s on s.user_id = u.id;

grant select on public.profile_overview to anon, authenticated;

-- 3) profile_badges -----------------------------------------------------------

-- Which badges a user has earned. Names, descriptions and icons are NOT here:
-- they live in lib/playground-dictionary.ts and BadgesSection's icon map, and
-- duplicating them into the database is how the two drift apart.
create or replace view public.profile_badges
with (security_invoker = off)
as
select u.username,
       b.badge,
       b.earned_at
from public.user_badges b
join public.users u on u.id = b.user_id;

grant select on public.profile_badges to anon, authenticated;

-- 4) profile_activity ---------------------------------------------------------

-- The recent-completions feed.
--
-- snapshot is excluded deliberately and must stay excluded: it holds whatever
-- the user submitted for the challenge, which can be their own code. Selecting
-- columns explicitly rather than `cs.*` is what keeps a future column from
-- leaking into a public view by default.
--
-- category rides along because the feed's row dot is track-coloured, and points
-- joins challenges (already readable by anyone via challenges_select_all).
-- Challenge titles stay in MDX and are resolved server-side.
--
-- DISTINCT ON collapses replays to one row per challenge. The only unique index
-- on challenge_sessions covers status = 'in_progress'
-- (challenge_sessions_one_in_progress_idx), so replaying a challenge leaves
-- several completed rows for the same slug — without this, one much-replayed
-- challenge could fill the entire five-row feed.
--
-- It keeps the EARLIEST completion, matching apply_completion_to_stats, which
-- awards points only for "the FIRST completion of a (user, challenge) pair".
-- Showing the latest date beside points that were earned months earlier would
-- put two different events on the same row.
create or replace view public.profile_activity
with (security_invoker = off)
as
select distinct on (u.username, cs.challenge_slug)
       u.username,
       cs.challenge_slug,
       c.category,
       cs.lang,
       cs.completed_at,
       coalesce(c.points, 10) as points
from public.challenge_sessions cs
join public.users u on u.id = cs.user_id
left join public.challenges c on c.slug = cs.challenge_slug
where cs.status = 'completed'
  and cs.completed_at is not null
order by u.username, cs.challenge_slug, cs.completed_at asc;

grant select on public.profile_activity to anon, authenticated;

-- 5) profile_rank -------------------------------------------------------------

-- The leaderboard's rank is an array index over a top-100 fetch, so it means
-- nothing outside that window — which is exactly the case a profile has to
-- handle. This counts everyone genuinely ahead instead.
--
-- The row comparison (total_points, completed_count) > (…) is lexicographic in
-- Postgres, so it reproduces the leaderboard's own
-- `order by total_points desc, completed_count desc` rather than inventing a
-- second tie-break that could disagree with it.
--
-- Returns NO ROWS for a user with no completions. That absence is the signal
-- the rank chip's third tier reads, so "unranked" never has to be faked with a
-- sentinel number. total_ranked is what turns a raw rank into a percentile.
create or replace function public.profile_rank(p_username text)
returns table (rank integer, total_ranked integer)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select s.total_points, s.completed_count
    from public.user_stats s
    join public.users u on u.id = s.user_id
    where u.username = p_username
      and s.completed_count > 0
  )
  select (
           select count(*)::integer + 1
           from public.user_stats ahead
           where ahead.completed_count > 0
             and (ahead.total_points, ahead.completed_count)
                 > (me.total_points, me.completed_count)
         ),
         (
           select count(*)::integer
           from public.user_stats ranked
           where ranked.completed_count > 0
         )
  from me;
$$;

grant execute on function public.profile_rank(text) to anon, authenticated;

-- 6) profile_path_progress ----------------------------------------------------

-- Which of the NAMED slugs this user has completed or read — the derived
-- per-path signal specs/public-profiles.md asks for, and nothing else.
--
-- A function taking arrays rather than a profile_doc_reads view, on purpose:
-- it answers only "of these slugs I already know about, which are done", and
-- the server only ever names slugs belonging to a learning path. It also
-- returns no read_at and no lang — just the slug — so no endpoint here can
-- become a reading-history feed by accident, which is the brief's explicit
-- non-goal. Docs slugs are public and few, so this is not a barrier against a
-- determined prober; what it guarantees is that nothing in this codebase
-- *serves* someone's reading history or its timestamps.
--
-- UNION, not UNION ALL: a challenge replayed across several sessions is still
-- one completed slug.
create or replace function public.profile_path_progress(
  p_username text,
  p_doc_slugs text[],
  p_challenge_slugs text[]
)
returns table (kind text, slug text)
language sql
stable
security definer
set search_path = public
as $$
  select 'challenge'::text, cs.challenge_slug
  from public.challenge_sessions cs
  join public.users u on u.id = cs.user_id
  where u.username = p_username
    and cs.status = 'completed'
    and cs.challenge_slug = any(p_challenge_slugs)
  union
  select 'doc'::text, dr.doc_slug
  from public.doc_reads dr
  join public.users u on u.id = dr.user_id
  where u.username = p_username
    and dr.doc_slug = any(p_doc_slugs);
$$;

grant execute on function public.profile_path_progress(text, text[], text[])
  to anon, authenticated;
