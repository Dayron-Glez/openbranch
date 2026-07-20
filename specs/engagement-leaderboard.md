# Spec: Leaderboard Page (Engagement UI — Surface 2 of 3)

**Status:** Ready to implement
**Date:** 2026-07-19
**Parent brief:** `specs/engagement-ui.md`
**Design reference:** Claude Design project "openbranch" → `playground 2.0/leaderboard.html` + `ob-engagement.css` (states: sparse / full / empty; copy es+en in the mock's inline dictionaries)

## What ships

A dedicated page **`/[lang]/playground/leaderboard`** (per the design decision: own page, not a hub tab) plus the **"Leaderboard →" ghost link** in the hub header that was deferred from Surface 1.

Page anatomy (from the mock):

- Breadcrumb `Playground / Leaderboard` (reuse `PlaygroundBreadcrumb`).
- Header: accent eyebrow "Playground — all time" / "Playground — histórico"; title "Leaderboard — _every merge counts_" / "Clasificación — _cada merge cuenta_" (accent span in `font-light`); a one-line sub that varies by state.
- The board card (`bg-bg-card`, `--r-12` border), grid columns `64px 1fr 130px 130px 130px`: header row (Rank · Builder · Points · Completed · Best streak, mono uppercase), data rows of 58px, mono `tabular-nums` numerals right-aligned, rank `01` zero-padded with **#1 in accent**.
- Own row: accent-tinted background (`color-mix` ~6%) + "you"/"tú" tag chip.
- Footer line (mono, muted) with state-dependent copy.

### The three states

1. **Sparse** (total rows ≤ 6 — the launch reality): all real rows, then **ghost "open seat" rows** (dashed top border, dashed empty avatar, muted "Open seat — one completion puts a builder here") filling up to 6 seats. Footer: "Refreshed on every completion · usernames sync from GitHub on login".
2. **Full** (rows > 10): top 10 rows; if the signed-in user is outside the top 10, a `···` gap row followed by their **pinned row** (accent ring top border + accent-soft background) with their real rank. Footer: "Your position updates the moment a challenge completes".
3. **Empty** (0 rows): centered icon tile + "The board is waiting" + body ("Nobody has completed a challenge yet. The first one takes #1 — and holds it until someone earns it back.") + primary CTA "Start a challenge" → the hub. Footer: "Ranked by points, then challenges completed".

Below the card: centered ghost link "← All challenges" back to the hub.

## Not in this PR

- Result-page reward moment (Surface 3).
- Pagination, time windows, per-track boards (parent brief non-goals).
- Realtime updates — server-rendered per request is enough at this scale.

## Data

- **Source:** the public `leaderboard` view (anon read): `username`, `avatar_url`, `total_points`, `completed_count`, `best_streak`, pre-ordered by points desc, completed desc. **Rank = row index + 1** (the view has no rank column).
- **Fetch:** all rows with `.limit(100)` — the view has no user_id and single-digit users at launch; revisit pagination if the board ever approaches the cap (out of scope now).
- **Own-row matching:** the view deliberately exposes no `user_id`, so match by `username`: fetch the signed-in user's `username` from `public.users` (select-own) and compare. GitHub usernames are unique upstream; document the assumption in code.
- **Service:** `features/playground/server/leaderboard-service.ts` → `getLeaderboard(supabase, userId | null)` returns `{ rows, ownRank | null }` or `null` on query error (same philosophy as Surface 1: log with `console.error`, page renders a quiet error line — never a broken page, and never the misleading empty state).

## Components (feature-first)

| Piece                                        | Kind                   | Notes                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui/table.tsx`                    | shadcn primitive (new) | The official shadcn Table component (semantic `<table>`-family wrappers), added per the shadcn docs. Restyled via className to the mock's grid metrics.                                                                                                                                                                     |
| `server/leaderboard-service.ts`              | server module          | Fetch + rank + own-row match, typed result.                                                                                                                                                                                                                                                                                 |
| `components/LeaderboardTable.tsx`            | server presentational  | Built on the shadcn `Table` primitives: header row, rows, ghost seats, gap + pinned row, empty state, footer. Rows use `Avatar`/`AvatarFallback` from `components/ui` (initials fallback when `avatar_url` is null), `next/image`-compatible GitHub avatars (domain already allowed — `StartChallengeButton` renders them). |
| `app/[lang]/playground/leaderboard/page.tsx` | route                  | `<main data-pg-main>` (GSAP transition requirement), breadcrumb, header, table, back link, `generateMetadata`. Dynamic route (session + live data), same as the hub.                                                                                                                                                        |
| Hub header link                              | edit                   | Ghost link "Leaderboard →" in `app/[lang]/playground/page.tsx` header (flex row, link aligned right as in `hub-active.html`).                                                                                                                                                                                               |

**Decided (2026-07-19):** shadcn Table **primitives only** for now — server component, no new dependencies. The shadcn DataTable pattern (`@tanstack/react-table`: sortable columns, pagination) is the documented upgrade path when the board outgrows a single screen; re-sorting also conflicts with rank semantics at this stage, and the parent brief lists pagination as a non-goal.

## i18n

New `leaderboard` section in `PlaygroundDict` (es + en), copy lifted from the mock: breadcrumb/title/eyebrow/accent, column headers, `you` tag, open-seat line, the three footers, empty-state block, back link, plus one new `error` line not present in the mock ("The board took a break — refresh to retry." / "El tablero se ha tomado un descanso — recarga para reintentar."). Sub-line under the title interpolates `{count}` for the sparse/full variants.

## Responsive & a11y

- Board container max-width ~980px (`board-wrap` in the mock), inside the standard page padding.
- **< 640px:** hide the Completed and Best streak columns (grid becomes `48px 1fr 80px`); rank, builder and points survive. Header row hides the same cells.
- The table is semantic by construction: the shadcn `Table` primitives render a real `<table>`-family tree, so screen readers get column headers for free (the mock's div-grid is not load-bearing).
- Ghost rows are decorative: `aria-hidden`.
- Avatars: `alt` = username; own-row tag is real text.
- Both themes via tokens; `tabular-nums` everywhere numeric.

## Acceptance criteria

- With current production data (1 user): sparse state with 1 real row (highlighted as "you" when signed in, #01 in accent) + 5 ghost seats.
- Signed-out: same board, no highlight, no pinned row; page fully public.
- Empty DB renders the empty state with working CTA; query failure renders the error line (not the empty state).
- Full state verified by mocking (temporarily seeding user_stats or lowering TOP_N in review): gap + pinned own row with correct rank.
- Hub shows the "Leaderboard →" link; navigation both ways works with the GSAP transition (`data-pg-main` present).
- es + en, both themes, breakpoints. `types:check`, `lint`, build green; SonarCloud 0 new issues.

## Action plan (single PR, every diff shown before its commit)

1. Issue `feat(playground): leaderboard page` + branch `<N>-leaderboard`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: `leaderboard` dictionary section (es/en).
4. Commit 3 — `feat(playground)`: `leaderboard-service.ts`.
5. Commit 4 — `feat(playground)`: `LeaderboardTable` + route page + hub header link.
6. Checks + full SonarCloud report; user verifies visually on localhost (sparse signed-in/out; empty and full via temporary data tweaks in the Table Editor).
7. Merge (merge commit). No DB changes.
