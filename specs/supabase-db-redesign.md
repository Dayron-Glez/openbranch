# Spec: Supabase Database Redesign

**Status:** Draft
**Date:** 2026-07-16
**Owner:** @Dayron-Glez

## Context

The playground persists user progress in Supabase across three tables (`users`, `challenge_sessions`, `user_badges`) created in two raw SQL migrations (`supabase/migrations/`). The schema was written for the playground MVP and has drifted from the application code, lacks indexes and concurrency guards, and has no room for planned features (leaderboard, streaks, points, per-challenge stats).

Access is anon-key only (`lib/supabase/client.ts`, `lib/supabase/server.ts`) — every query goes through RLS. The server-side data layer lives in `features/playground/server/session-service.ts`; track/badge domain knowledge lives in `features/playground/domain/manifest.ts`.

### Known defects and gaps

| #   | Severity         | Problem                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Bug (active)** | `user_badges.badge` CHECK allows `code-reviewer`, `bug-hunter`, `test-writer`, but `manifest.ts` awards `review-corps`, `ship-it`, `coverage-hero`, `first-merge`, `doc-writer`. Every badge insert violates the constraint, so **no badge has ever been persisted** since the manifest was introduced. The failure is silent: `awardTrackBadge` does not check the insert error. |
| 2   | Bug              | `handle_new_user()` uses `on conflict (id) do nothing` — username/avatar are never refreshed on subsequent logins.                                                                                                                                                                                                                                                                |
| 3   | Perf             | No index on `challenge_sessions (user_id, challenge_slug, status)` — the dominant query pattern — and no index supporting the `like 'prefix%'` track scan. RLS filters by `user_id` on every row.                                                                                                                                                                                 |
| 4   | Race             | `ensureSession` is select-then-insert with no partial unique constraint on `(user_id, challenge_slug) where status = 'in_progress'` → duplicate in-progress sessions under concurrent requests.                                                                                                                                                                                   |
| 5   | Race             | `awardTrackBadge` is select-then-insert. The `unique (user_id, badge)` constraint catches duplicates, but the error is unhandled and the flow depends on app-side ordering.                                                                                                                                                                                                       |
| 6   | Gap              | No `updated_at` on `challenge_sessions`; snapshots are overwritten with no trace of last activity.                                                                                                                                                                                                                                                                                |
| 7   | Gap              | `challenge_slug` is free text with no referential integrity (challenges live in MDX, not in the DB).                                                                                                                                                                                                                                                                              |
| 8   | Gap              | No structures for future features: leaderboard, streaks, points, per-category stats, achievements beyond track badges.                                                                                                                                                                                                                                                            |
| 9   | Gap              | No documented migration convention or tooling (raw SQL files applied by hand).                                                                                                                                                                                                                                                                                                    |

## Goals

- Fix the badge constraint drift immediately (it blocks a live feature).
- Harden the current schema: indexes, uniqueness guards, timestamps, profile refresh.
- Lay foundations for leaderboard/streaks/points without over-building ahead of product decisions.
- Establish a migration convention so schema changes are reviewable and reproducible.

## Non-goals

- Introducing a service-role key or bypassing RLS.
- Moving challenge content (MDX) into the database.
- Building the leaderboard/streaks UI (only the data foundations).
- Switching ORMs or adding a query builder — the thin `session-service.ts` layer stays.

---

## Phase 1 — Hotfix: badge CHECK drift (ship first, standalone PR)

**Migration:** `supabase/migrations/20260716_fix_badge_check.sql`

1. Remap any legacy rows to their current equivalents (launch-era keys → manifest keys):
   `code-reviewer → review-corps`, `bug-hunter → ship-it`, `test-writer → coverage-hero`.
2. Replace the CHECK with the five keys defined in `manifest.ts`:
   `review-corps`, `ship-it`, `coverage-hero`, `first-merge`, `doc-writer`.

**Acceptance criteria**

- Completing one challenge per track persists the corresponding badge row.
- Existing rows (if any) survive the migration and satisfy the new CHECK.
- `manifest.ts` badge keys and the CHECK list are identical (documented as the source of truth; Phase 2 removes the duplication).

**Explicitly out of scope for Phase 1:** error handling in `awardTrackBadge`, the upsert refactor, indexes. Keep the diff minimal so the fix ships fast.

## Phase 2 — Schema hardening

One migration + a small `session-service.ts` refactor. No behavior changes visible to users.

### 2.1 Concurrency guards

- Partial unique index: `create unique index ... on challenge_sessions (user_id, challenge_slug) where status = 'in_progress'`.
- Rewrite `ensureSession` as a single `upsert` (`on_conflict` on the partial index) — removes the select round-trip and the race.
- Rewrite `awardTrackBadge` insert as `upsert` with `ignoreDuplicates` on `(user_id, badge)`, and surface insert errors (log at minimum).

### 2.2 Indexes

- `challenge_sessions (user_id, challenge_slug, status)` — covers `ensureSession`, `saveSnapshot`, `getInProgressSnapshot`, `markSessionCompleted`, and RLS filtering.
- `challenge_sessions (user_id, status, challenge_slug text_pattern_ops)` — covers the track-completion scan in `awardTrackBadge` (`like 'prefix%'`).
- `user_badges (user_id)` — RLS + badge lookups (the unique constraint already provides `(user_id, badge)`).

### 2.3 Timestamps

- Add `updated_at timestamptz not null default now()` to `challenge_sessions`.
- `before update` trigger to bump it (shared `set_updated_at()` function, reusable by future tables).

### 2.4 Profile refresh

- Extend the auth trigger to fire on update as well (`after insert or update on auth.users`) and change the function to `on conflict (id) do update set username = excluded.username, avatar_url = excluded.avatar_url`. GitHub renames and avatar changes then propagate on next login.

### 2.5 Badge key integrity (removes the Phase 1 duplication)

- Replace the CHECK with a `badge_catalog` lookup table (`key text primary key`, `track text`, `created_at`) and an FK from `user_badges.badge`. Adding a badge becomes an insert, not an `alter table`. Seed it from `manifest.ts` values; a CI check (script or test) asserts manifest ⊆ catalog.

**Acceptance criteria**

- Concurrent double-submit of the same challenge produces exactly one in-progress session and at most one badge row, with no 500s.
- `explain` on the dominant queries shows index scans, not seq scans.
- Logging in after a GitHub username change updates `public.users.username`.

## Phase 3 — Foundations for future features

Design-gated: build only when the corresponding product feature is prioritized. Sketch:

- **Per-user stats** (`user_stats`: completed count, per-category counts, current/best streak, points, `last_completed_at`) maintained by a DB function called on completion — not by app-side read-modify-write. Streak/points rules live in one place (the function).
- **Leaderboard** as a view (or materialized view if volume demands) over `user_stats`; needs a deliberate RLS exception (public read of username/avatar/points only) — decide policy before building.
- **Points model**: constant per challenge vs. per-difficulty from MDX frontmatter. If per-difficulty, sync challenge metadata (slug, category, points) into a `challenges` reference table at build/deploy time — this also fixes gap #7 (free-text slugs) via FK.
- Keep `challenge_sessions` as the raw event source; stats are derivable/rebuildable from it.

**Open questions (answer before implementing Phase 3)**

1. Is the leaderboard global, per-track, or both? Time-windowed (weekly/all-time)?
2. Streak definition: calendar days with ≥1 completion, or consecutive challenges?
3. Are points retroactive for already-completed sessions?
4. Does `challenges` reference-table sync run in CI, at deploy, or via a script?

## Phase 4 — Migration tooling and conventions

- Adopt the Supabase CLI flow (`supabase migration new`, `supabase db push`) or document the current manual flow explicitly — decide and write it down in `supabase/README.md`.
- Convention: `YYYYMMDD_short_description.sql`, one logical change per file, never edit an applied migration.
- Document how to reset/seed a local dev database.

## Rollout

| Phase | Vehicle                                        | Risk                                                               |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------ |
| 1     | Single small PR (migration only)               | Low — additive CHECK swap                                          |
| 2     | One PR: migration + session-service refactor   | Medium — touches live query paths; verify with playground E2E flow |
| 3     | One PR per feature, gated on product decisions | —                                                                  |
| 4     | Docs-only PR, can ship anytime                 | Low                                                                |
