# Spec: Personal Stats Strip (Engagement UI — Surface 1 of 3)

**Status:** Ready to implement
**Date:** 2026-07-16
**Parent brief:** `specs/engagement-ui.md`
**Design reference:** Claude Design project "openbranch" → `playground 2.0/hub-active.html` + `ob-engagement.css` (states: alive / broken / signed-out; copy es+en included in the mock's inline dictionaries)

## What ships

A "Your progress" strip on `/[lang]/playground`, rendered between the page header and `StartingLine`, with three mutually exclusive states:

1. **Signed-in, streak alive** — four cells: Points (with a `+N today` delta chip when N > 0), Current streak (flame icon + days, sub "Alive — you completed one today"), Completed (`X of Y`, sub "Next up: {track}"), Best streak (sub "Personal best").
2. **Signed-in, streak broken** — same cells, but streak shows `0 days` in muted color with sub "Ended {date} — one completion restarts it".
3. **Signed-out** — a single-row nudge: flame tile, one-line pitch, "Sign in with GitHub" button.

Per design decisions already taken: strip lives **above the challenge grid**, minimal flame as the streak metaphor, mono uppercase cell labels, `tabular-nums` on every number.

## Not in this PR

- Leaderboard page and the "Leaderboard →" header link (Surface 2 — the link lands with the page it points to).
- Result-page reward moment (Surface 3).
- Anything else from the playground 2.0 mocks (locked cards, "Up next" redesign, 24-challenge world).
- A "hub zero" redesign: a signed-in user with no completions gets the same strip with zeroed values (rules below), not a separate layout.

## Data

### Sources

| Need                                                                                    | Source                                                                                                          |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `total_points`, `completed_count`, `current_streak`, `best_streak`, `last_completed_on` | `user_stats` (RLS select-own; row may not exist yet)                                                            |
| Catalog size Y in "X of Y"                                                              | `playgroundSource.getPages(lang)` filtered to `maturity === "stable"` (already computed in the hub page)        |
| Points earned today (`+N today`)                                                        | Derived: completed sessions (`challenge_slug`, `completed_at`) × `challenges` catalog (public read) — see rules |
| Tracks started / next track                                                             | Derived from completed slugs × `CHALLENGE_TRACKS` slug prefixes (`domain/manifest.ts`)                          |

### Derivation rules (server-side, in a new `stats-service.ts`)

- **Streak aliveness:** alive iff `last_completed_on` is today or yesterday in **UTC**. Otherwise render streak as `0` + broken sub with `last_completed_on` formatted via `Intl.DateTimeFormat(lang, { day: "numeric", month: "short" })`. Never display a stale `current_streak` number.
- **`+N today`:** N = sum of `challenges.points` over slugs whose **first** completion (`min(completed_at)` per slug) falls on today's UTC date. Two queries (own completed sessions; public catalog), grouped and summed in TypeScript — mirrors the DB's first-completion-only rule so the chip never shows points for repeats. Chip hidden when N = 0. Slugs missing from the catalog count 10 (same default as the DB trigger).
- **"Across N tracks":** N = distinct tracks (by slug prefix) with ≥1 completed challenge. Hidden when N = 0.
- **"Next up: {track}":** first category in `CATEGORY_ORDER` with zero completions, using `dict.category[cat]` as the label. When every track has ≥1 completion, fall back to "All tracks started".
- **No `user_stats` row** (signed-in, zero completions): all values 0, "X of Y" = "0 of Y", streak sub = "Your first completion starts it" (neutral, not the broken state), best streak = "0 days" with no sub.

## Components (feature-first: `features/playground/`)

| Piece                        | Kind                             | Notes                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/stats-service.ts`    | server module                    | `getEngagementStats(supabase, userId)` → typed result with the derived fields above. Errors log via `console.error` and return `null` → the strip silently doesn't render (stats must never break the hub).                                                                                                                                        |
| `components/StatsStrip.tsx`  | server-compatible presentational | Grid of 4 cells. Reuses tokens: `bg-bg-card border-line rounded-(--r-12)`; labels `font-mono text-[11px] tracking-[0.08em] uppercase text-fg-muted`; values 30px `font-light` with `tabular-nums`. Delta chip = `Badge` from `components/ui` restyled with `bg-accent-soft border-accent-ring text-ob-accent`. Flame = `IconFlame` from `@/icons`. |
| `components/SignInNudge.tsx` | client                           | Reuses `Button` from `components/ui` and the GitHub OAuth call from `StartChallengeButton` (`supabase.auth.signInWithOAuth`, `next=` the playground path). No dialog — the nudge itself is the pitch.                                                                                                                                              |

Wiring in `app/[lang]/playground/page.tsx`: fetch stats in the existing `Promise.all` alongside sessions/badges; render `<StatsStrip>` / `<SignInNudge>` under an eyebrow rule ("Your progress", same pattern as the category `rule` divider), before `StartingLine`.

## i18n

New `stats` and `nudge` sections in `PlaygroundDict` (es + en). Lift the copy from the mock's inline dictionaries (`hub-active.html`) — it is already written in both languages and on-tone. The broken-streak sub interpolates a `{date}` placeholder.

## Responsive & a11y

- Grid: 4 columns → `max-[980px]:grid-cols-2` (2×2) → `max-[520px]:grid-cols-1`. Hairline separators between cells must match `--line` at every breakpoint (per-cell borders with breakpoint-aware sides, or the gap-px/bg-line technique — visual result is what's specced).
- Numbers: `tabular-nums` (design's `.num`).
- The strip is informational: no interactive elements except the nudge CTA. Flame icon `aria-hidden`; cell labels are real text (no sr-only gymnastics needed).
- Both themes via existing tokens; no new colors.

## Acceptance criteria

- Signed-in with live streak: four correct values; delta chip appears only when points were earned today (UTC).
- Broken streak renders `0` + localized "Ended {date}" sub — never the stale number (acceptance criterion inherited from the parent brief).
- Zero-completions user sees zeroed strip with neutral copy; signed-out sees the nudge; a stats fetch failure renders nothing and logs, without breaking the hub.
- Repeating a challenge today does not light up `+N today`.
- es + en, both themes, 3 breakpoints. `types:check`, `lint`, build green; SonarCloud 0 new issues.

## Action plan (single PR)

1. Issue `feat(playground): personal stats strip on the hub` + branch `<N>-stats-strip`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: dictionary keys (es/en) in `lib/playground-dictionary.ts`.
4. Commit 3 — `feat(playground)`: `stats-service.ts` (fetch + derivations, typed).
5. Commit 4 — `feat(playground)`: `StatsStrip` + `SignInNudge` + hub wiring.
6. Checks + full SonarCloud report; user verifies visually on localhost (all three states — sign out, and streak states can be forced by editing `user_stats.last_completed_on` in the Table Editor).
7. Merge (merge commit). No DB changes — nothing to `db push`.
