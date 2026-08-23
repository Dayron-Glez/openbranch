# Spec: Public profiles — `/u/[username]`

**Status:** Draft — scope decided, ready for a design session
**Date:** 2026-08-12
**Owner:** @Dayron-Glez
**Roadmap:** module 3 of 4 (post learning-paths). See `specs/color-system.md`, `specs/engagement-ui.md` and `specs/learning-paths.md` for the design-system precedent this brief builds on.

## Context

The engine that would power this module already exists and is fully disconnected from any page a stranger can visit: `user_stats` (points, streak, completed count), `user_badges`, and per-challenge history in `challenge_sessions` all live behind row-level security that only lets a user read their own rows. The one place any of this is already public is the leaderboard (`public.leaderboard` view) — a flat top-100 table with no per-user page behind each row.

There is no `/u/[username]`. This module builds it: a page that turns "I finished something" into something worth pointing someone at, plus a shareable achievement image for the moment engagement UI already earns but never lets you take anywhere.

## Scope for v1 — decided, not a menu

The owner picked all four pieces for v1, not a staged rollout:

1. **Core** — total points, rank, streak, earned badges.
2. **Recent activity feed** — challenges completed, with dates.
3. **Completed learning paths** — which paths (from module 2) this user has finished.
4. **Shareable OG card** — an achievement image for the profile, in the vein of the docs OG images already generated for every guide.

**Visibility: public by default, no opt-in.** Same posture the leaderboard already takes — no new preferences table, no privacy toggle, no "unpublished profile" state to design.

## Design system inventory — reuse, don't invent

Same dark-by-construction surface as the rest of the app (`app/global.css`, openbranch tokens live in a plain `@theme` block, not under `.dark`) — no light-mode variant needed. The completion vocabulary is already established and should carry over rather than inventing a fifth way to say "done":

- **Accent triad** — `bg-ob-accent` / `border-ob-accent` / `text-accent-ink`, used by `PathStepper`'s completed nodes and `RewardMoment`'s recap rows.
- **`IconCheck`** in an accent circle.
- **`RewardMoment`** (`features/playground/components/RewardMoment.tsx`) is the app's one existing celebration surface — post-challenge, full-width, on the result page. A profile page is a _durable_ version of that same feeling, seen by someone other than the person who earned it. The relationship between the two is worth designing on purpose, the same way `specs/path-card-completed-state.md` asked the same question about `PathCard`.
- **Track identity** — `data-track` resolving `--track`/`--track-soft`/`--track-ring`/`--track-ink`, used everywhere a badge or challenge needs a hue.

## Data available vs. new work

**Already public, reusable as-is:**

- `public.leaderboard` view — `username, avatar_url, total_points, completed_count, best_streak`. No `user_id` exposed. This is the pattern to copy for any new public surface: a dedicated view with `security_invoker = off` plus an explicit `grant select to anon, authenticated` — never widen RLS on the base tables themselves.
- `badge_catalog` (`badge_catalog_select_all`, `(true)`) — already public, but carries no name/description/icon. Those stay where they already live: `lib/playground-dictionary.ts` (`badges.<key>.name/.description`, es/en) and `BadgesSection.tsx`'s icon map. Reuse directly, don't duplicate into the database.

**Requires new work — the honest list, not assumed:**

- `users.username` has **no unique constraint today** (only `github_id` does). Uniqueness is an assumption about GitHub logins, documented as such in `leaderboard-service.ts`'s comments, not an enforced guarantee. **Decided: add the constraint** as part of this module — small, low-risk migration, and the thing a route keyed on `username` actually needs.
- `user_stats` and `user_badges` are `select own` only, no public grant — reading "profile data for username X" needs a new public-readable surface, not a widened policy on the base tables (same reasoning as the leaderboard's own design).
- **Rank off the leaderboard's top 100 is a different query, not the same one.** The leaderboard's rank is just an array index after sorting the top 100 — it has no meaning for a user outside that set. A profile page needs an actual count query (`count(*) where total_points > mine`, tie-broken the same way the leaderboard already orders). Left as an open question for the implementation spec, not resolved here.
- **Activity feed** needs a public view over `challenge_sessions` that explicitly **excludes `snapshot`** — that column can carry a user's submitted code/data and must never be exposed on a page anyone can load.
- **Completed paths** has no backing table at all — it's derived today via `isStepDone`/`PathProgress` (`features/paths/domain/path-status.ts`), built from `completedChallengeSlugs` (`challenge_sessions`) and `readDocSlugs` (`doc_reads`, itself `select own` only per its own spec, `specs/learning-paths.md`'s post-phase-2 read-tracking work). A profile page needs that same signal for an _arbitrary_ user, not just the signed-in viewer. Expose only the derived per-path boolean, not raw `doc_reads` rows — a stranger's full reading history is a materially different (and more sensitive) thing to make public than "did they finish this path," and nothing in this brief asks for a reading-history feature.
- **OG image**: the existing pattern (`app/og/docs/[...slug]/route.tsx`) uses `next/og`'s `ImageResponse` with fumadocs-ui's `generate()` helper, and is fully static — `generateStaticParams()` over every doc page plus `revalidate = false`, because a guide's title and description don't change after it's written. **None of that holds for a profile.** Points, badges, and completed paths change over time, and there's no way to enumerate every username at build time. `/og/u/[username]` has to render at request time (a short `revalidate`, not `false`), and the layout needs to be built by hand rather than reused from `generate()`, which is shaped for a doc's title/description, not a stats card.

## Physical constraints

- The leaderboard already has 100 rows with nowhere to go — hyperlinking each row to its profile page is a natural, cheap addition worth including here rather than as a separate follow-up.
- `/paths` and `/playground` layouts already call `cookies()`/`createClient()` and load `avatar_url`/`username` to hand to `PlaygroundNav`/`MobileNav`. A "your profile" nav entry is nearly free — that data is already in scope at the point those components render.
- Unlike the docs pages, there is no static-rendering invariant to protect here: `/u/[username]` reads data for _someone else_, not the viewer, so it doesn't have the docs pages' reason to stay SSG. It can be a normal dynamic route, consistent with `/paths` and `/playground`.

## Non-goals

- **No bio or display-name editing.** Username and avatar are GitHub's, shown as-is. Nothing here adds a settings page.
- **No profile directory or search.** A profile is reached by a direct link or by clicking through from the leaderboard — not by browsing a list of everyone.
- **No privacy controls.** Decided public-by-default; an opt-out is a different, larger feature this brief doesn't scope.
- **No leaderboard pagination.** Out of scope for this module even though it touches the same view.
- **No reading-history feature.** `doc_reads` already stores `lang` with an eye toward this someday (per its own spec), but this brief only asks for a completed/not-completed signal per path — not a history surface.

## Open questions for the design session

1. **Off-the-board rank.** What does the page say when a user isn't in the top 100 — a plain count-based rank, or something softer?
2. **Activity feed density.** How much of "recent activity" earns space on a profile that also has to fit stats, badges, and completed paths without turning into a scroll of everything?
3. **Relationship to `RewardMoment`.** A profile is a durable, third-person version of the same celebration `RewardMoment` gives the user themselves once, in the moment. Same register, or a calmer one — the same question `specs/path-card-completed-state.md` asked about `PathCard`, one level up.
4. **The OG card's own layout.** It can't borrow fumadocs' `generate()`. What does a stats/trophy card look like at 1200×630, and how much of the profile's four sections does it try to summarize versus just the headline number?
5. **Tone.** Same question every celebration surface in this app has had to answer: how loud, between a quiet stat block and a genuine "look what they did" — especially for a user with very little to show yet (one badge, low points). A profile with almost nothing on it still has to look deliberate, the same way a single completed path had to on `/paths`.

## Deliverable

Mocks for a populated profile and a sparse one (one badge, no completed paths) side by side, plus the OG card at 1200×630, in the tokens above. Rationale for questions 1–4 in prose; a recommendation, not a menu.
