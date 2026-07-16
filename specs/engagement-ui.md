# Spec: Engagement UI — Leaderboard, Points and Streaks

**Status:** Draft — ready for a design session
**Date:** 2026-07-16
**Owner:** @Dayron-Glez
**Depends on:** DB foundations shipped in `specs/supabase-db-redesign.md` Phase 3 (#117)

## Context

The database now tracks engagement automatically: every challenge completion feeds points (per difficulty), a completed counter, and calendar-day streaks into `user_stats`, and a public `leaderboard` view exposes the all-time ranking. **None of it has UI yet.** This spec briefs the design of those surfaces inside the existing playground.

This document is written to be handed to a design session (Claude Design / Figma) — it describes the product intent, the data available, the existing design language, and the constraints. Visual exploration is the design session's job; layout suggestions here are starting points, not decisions.

## Goal

Make progress feel rewarding and visible: a signed-in user should see their points, streak and rank without leaving the playground, and completing a challenge should immediately show what it earned them.

## Non-goals

- Time-windowed (weekly/monthly) or per-track leaderboards — the data model supports them later.
- Profile pages, followers, or any social features beyond the ranking.
- Changing how points/streaks are computed (DB owns the rules).
- Notifications or streak reminders.

## Data available (already live in production)

### `leaderboard` view — public, no auth required

| Column            | Type | Notes                                                         |
| ----------------- | ---- | ------------------------------------------------------------- |
| `username`        | text | GitHub username, refreshed on every login                     |
| `avatar_url`      | text | GitHub avatar                                                 |
| `total_points`    | int  | beginner=10 · moderate=20 · demanding=30 per first completion |
| `completed_count` | int  | distinct challenges completed                                 |
| `best_streak`     | int  | best run of consecutive UTC days                              |

Ordered by points desc, then completed count desc. Only users with ≥1 completion appear. There is no `rank` column — compute position client/server-side from row order.

### `user_stats` — own row only (RLS), signed-in

Same counters plus `current_streak` and `last_completed_on` (date, UTC). **Rule:** `current_streak` is only alive if `last_completed_on` is today or yesterday (UTC); otherwise render it as broken/0. Total catalog size for "X of Y completed" comes from the MDX source (`playgroundSource`), not the DB.

## Surfaces to design

### 1. Personal stats strip (playground hub, signed-in only)

A compact row near the top of `/[lang]/playground` (the hub already renders `StartingLine`, `FilterBar`, challenge grid, `BadgesSection`): total points, current streak (with a broken-streak state), challenges completed as "X of Y", and best streak. Signed-out users see nothing (or a subtle sign-in nudge — designer's call).

### 2. Leaderboard

The all-time ranking. Open design decision: own page (`/[lang]/playground/leaderboard`) vs. a section/tab in the hub. Rows: rank, avatar, username, points; secondary: completed count and best streak. The signed-in user's own row must be highlighted, and if they are outside the visible top-N, show their position anyway ("you are #12"). Expect single-digit user counts initially — the empty/sparse state IS the common state at launch and deserves real design attention, not an afterthought.

### 3. Completion reward moment (result page)

The result page (`/[lang]/playground/[slug]/active/result`) already celebrates with `ConfettiEffect` and badge display. Add what the completion earned: points gained, and the streak state (extended / started / unchanged when it's a repeat completion — repeats earn nothing, which the UI should communicate gracefully rather than feel like a bug).

## Existing design language (reuse, don't reinvent)

- **Tone:** editorial-minimal, generous whitespace, no gamification kitsch. Dark-first with light support.
- **Typography patterns:** mono uppercase eyebrows (`font-mono text-[11px] tracking-[0.08em] uppercase text-fg-muted`); large light headings with a `text-fg-2 font-light` accent span; body `text-fg-2 text-base leading-[1.55]`.
- **Tokens:** `fg`, `fg-2`, `fg-muted`, `line` (borders), existing accent colors — no new palette.
- **Layout:** hub container is `max-w-275 px-8`; grids collapse 3 → 2 → 1 at 980px / 640px.
- **Reference components:** `ChallengeCard` (card anatomy, hover), `BadgesSection` (earned/locked duality — the streak/stats strip should feel like its sibling), `FilterBar` (pill controls), `StartingLine` (feature callout).
- **Motion:** GSAP page transitions; any new `<main>` in the playground MUST carry `data-pg-main`. Respect `prefers-reduced-motion`.

## Implementation constraints (for the build that follows the design)

- Server components fetch via `lib/supabase/server`; leaderboard is public (anon), stats need the session user.
- i18n: every string goes through the playground dictionary (`lib/playground-dictionary.ts`), es + en.
- TypeScript strict, arrow functions with explicit return types; `useEffect` only for external-system sync.
- New feature code lives under `features/playground/` (feature-first architecture, ESLint-guarded).

## Acceptance criteria

- Hub shows the four personal stats for a signed-in user; broken streaks render as broken, not as a stale number.
- Leaderboard renders the view's data with the current user highlighted, works signed-out, and its empty/sparse state is designed.
- Result page communicates points earned and streak effect, including the repeat-completion case.
- Both locales, both themes, all breakpoints; no new SonarCloud issues.

## Open design questions

1. Leaderboard placement: dedicated page or hub section/tab?
2. Streak visual metaphor (flame? counter? calendar dots?) given the no-kitsch tone.
3. How much celebration on the result page for points vs. the existing confetti — layered or unified?
4. Does the stats strip belong above the challenge grid or beside `BadgesSection`?
