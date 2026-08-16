# Mini-spec: public profiles — the data surface

**Status:** Implementing — PR 1 of 4
**Date:** 2026-08-16
**Owner:** @Dayron-Glez
**Parent:** `specs/public-profiles.md` (module 3 brief, PR #182) + the Claude Design handoff

## Why this is its own PR

The brief and the design session both describe the profile as mostly assembled from parts that already ship — `StatsStrip`, `BadgesSection`, the completed-state `PathCard`. That is true of the **components**. It is not true of the **data**, and checking turned up the thing neither document names:

**There is no public path from a username to anything.** `public.leaderboard` deliberately exposes no `user_id`, and `public.users` is `users_select_own`. Today, signed in or not, a `username` cannot be resolved to a user, let alone to their stats, badges, completions or reads. Every section of the profile page depends on fixing that first, so it gets built and verified on its own before any UI exists to hide behind.

## The rule this PR follows

Copy the `leaderboard` pattern exactly: a dedicated view or function marked to bypass RLS, exposing only the columns a profile needs, with an explicit `grant ... to anon, authenticated`. **No policy on a base table is widened.** After this PR, `user_stats`, `user_badges`, `challenge_sessions`, `doc_reads` and `users` are still `select own` for every client.

The GRANT is mandatory rather than tidy: `supabase/config.toml` leaves `auto_expose_new_tables` commented out ("When unset, new entities are NOT auto-exposed"), so PostgREST answers 401 on a correctly-policied object without one. `doc_reads` documents the same trap.

## What gets created

### `users.username` gains a unique constraint

Only `github_id` is unique today. `leaderboard-service.ts` already _assumes_ username uniqueness — its comments say so — to match the signed-in user's own row, because the view exposes no id. A route keyed on `username` turns that assumption into a correctness requirement, so it becomes a real constraint.

Guarded with an `if not exists` check on `pg_constraint` so re-running is safe. If duplicate usernames exist the migration fails loudly, which is the correct outcome: a silent pick between two rows is worse than a failed deploy.

### Three views

| View               | Shape                                                                                                             | Note                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profile_overview` | `username, avatar_url, created_at, total_points, completed_count, current_streak, best_streak, last_completed_on` | **`left join` from `users`**, unlike `leaderboard`'s inner join + `where completed_count > 0`. A leaderboard is a ranking and an entry with nothing earned is noise; a profile is a page and it must exist the day someone signs up. Stats coalesce to `0`.                                                           |
| `profile_badges`   | `username, badge, earned_at`                                                                                      |                                                                                                                                                                                                                                                                                                                       |
| `profile_activity` | `username, challenge_slug, category, lang, completed_at, points`                                                  | Filtered to `status = 'completed'`. **`snapshot` is excluded deliberately** — it can hold the user's submitted code. `category` rides along because the feed's row dot is track-coloured; `points` joins `challenges` (already `challenges_select_all`). Challenge _titles_ stay in MDX and are resolved server-side. |

**One row per challenge, earliest completion.** Found while writing the view, not assumed: the only unique index on `challenge_sessions` covers `status = 'in_progress'`, so replaying a challenge leaves several `completed` rows for the same slug. Without a `distinct on`, a single much-replayed challenge could fill the whole five-row feed — and the owner's account, which has replayed challenges, is the one real populated profile today. It keeps the _earliest_ completion because `apply_completion_to_stats` awards points only for "the FIRST completion of a (user, challenge) pair"; showing the latest date next to points earned months earlier would put two different events on one row.

None expose `user_id`, matching `leaderboard`.

### Two functions

Functions rather than views because both take arguments. Both are `security definer` + `stable` + `set search_path = public`.

**`profile_rank(p_username) → (rank, total_ranked)`**

The leaderboard's rank is an array index over a top-100 fetch — outside that window it means nothing, which is exactly the case a profile has to handle. This is a real `count(*) + 1` of everyone ranked above, using Postgres row comparison `(total_points, completed_count) > (mine)` so the tie-break matches `order by total_points desc, completed_count desc` — the leaderboard's own ordering — rather than inventing a second one.

Returns **no rows** for a user with zero completions. That is the signal the rank chip's third tier ("Empezando") reads, so "unranked" never has to be faked with a sentinel number.

`total_ranked` is what turns a raw rank into the design's percentile band.

**`profile_path_progress(p_username, p_doc_slugs[], p_challenge_slugs[]) → (kind, slug)`**

Returns which of the _named_ slugs the user has completed or read. It is a function taking arrays rather than a `profile_doc_reads` view on purpose:

- It returns **only the intersection with what the caller already named**, and the server only ever names slugs that belong to a learning path. There is no shape of this call that answers "what has this person read?" in general.
- It exposes **no `read_at` and no `lang`** — just the slug. The per-path boolean the brief asked for, and nothing that could become a reading-history feed by accident.

Honest scope of that protection: docs slugs are public and few, so this is not a cryptographic guarantee against a determined prober. What it does guarantee is that no endpoint in this codebase _serves_ someone's reading history or its timestamps, which is the brief's actual non-goal.

## Services

`features/profiles/server/profile-service.ts`, following the existing convention (`supabase` as first argument, log-and-degrade, never throw — same as `path-progress.ts` and `doc-reads.ts`).

`getProfilePathProgress` returns a `PathProgress` from `features/paths/domain/path-status.ts` directly, so it drops into `buildPathCardItems` unchanged — that function already takes injected progress and never touches `auth`.

## Verification

- `bunx supabase db push --dry-run`, then `db push`.
- **Signed out**, confirm each view and function returns data for a real username.
- Confirm the base tables still refuse anonymous reads afterwards — the point of the whole design is that they do.
- A `401` means a missing GRANT, not a broken policy.

## Not in this PR

No UI, no route, no dictionary. The page, the leaderboard links and the OG card are PRs 2–4.
