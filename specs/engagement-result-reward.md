# Spec: Completion Reward Moment (Engagement UI — Surface 3 of 3)

**Status:** Ready to implement
**Date:** 2026-07-20
**Parent brief:** `specs/engagement-ui.md`
**Design reference:** Claude Design project "openbranch" → `playground 2.0/result-earned.html` + `ob-engagement.css` (states: first completion / repeat completion / streak started; copy es+en in the mock's inline dictionaries)

## What ships

A reward row on `/[lang]/playground/[slug]/active/result`, inserted inside the existing hero (`mb-16 text-center` block) between the existing stat-chip row and the CTA buttons — it reads as a continuation of "what just happened" before the page pivots to "what's next." It has **two data states, not three**:

- **First completion of this slug** (`isFirstCompletion === true`) — one rendering path with a copy fork on the streak chip only:
  - `current_streak === 1` → "streak started" copy (day 1, with a "come back tomorrow" note).
  - `current_streak > 1` → "streak extended" copy (day N, "extended" tag).
  - Both branches always show: a `+N points` chip (count-up from 0), the streak chip (whichever branch), a rank chip (`#N on the board`, when available), and a `before → after total points` line (count-up on the "after" number only).
  - **Decision:** the design mock's "first completion" and "streak started" states are the same underlying case — the only thing that differs is which `current_streak` value comes back from the trigger. They are **one rendering branch**, not two separate states, driven by a single `streakEffect: "started" | "extended"` field.
- **Repeat completion** (`isFirstCompletion === false`) — a dimmed "Streak unchanged" chip, a time-comparison chip (`{current} vs {first} first run`), and the repeat note ("Points pay out once per challenge — the rep still counts."). No points chip (0 earned), no total-points line (before === after, nothing to animate), no rank chip.

Additionally, as part of the same "what this completion earned" scope:

- **Badge-earned card bug fix**: the existing card in `page.tsx` is hardcoded to `.eq("badge", "review-corps")` and `dict.badges["review-corps"]`. Fixed to resolve the slug's actual track via `inferCategoryBadge(slug)` so all 5 tracks show their correct badge, not just code-review.
- **Badge "New" tag**: when the just-completed session is the only completed session in that track (mirrors `awardTrackBadge`'s own award condition), the badge card gets a small "New" tag.
- **`ConfettiEffect` reduced-motion fix**: it currently fires unconditionally. Gated behind the same `globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches` idiom already used elsewhere in this codebase (`use-terminal-animation.ts`, `DocsScrollReveal.tsx`, `HeroPhrases.tsx`).

## Not in this PR

- **"Promote to a real contribution" card** (the mock's "PR #214 is a live issue on atlas/gateway... open it on the upstream repo... Post to GitHub" card). **Excluded — confirmed with the user.** It implies a real-world GitHub action, contradicting the hub's own stated principle ("Nothing leaves the playground" / `hub.intro`) and the tone corrections already made twice on Surface 2 (production-implying copy flagged and rewritten).
- **Wiring `dict.result.practiceAgain` into a new CTA.** It stays unused — adding a CTA to the hero's button row is a separate UI decision than "show what this completion earned."
- **Rewriting `result.body`.** Worth flagging: this copy ("you reviewed the diff... you shipped a call") is written for the code-review track specifically but shown verbatim for every track (bug-fix/testing/git/docs completions all see review-specific language, which is factually wrong for those tracks). Pre-existing scope issue, not touched here — it's the hero's unconditional body copy, not the reward row this feature adds.
- Leaderboard/stats-strip changes (Surfaces 1/2 already shipped).
- Any change to how points/streaks are computed — the DB trigger remains the sole source of truth; this PR only reads it.
- Confetti visual redesign beyond the reduced-motion gate.

## Data

### New server module: `features/playground/server/reward-service.ts`

```ts
export type StreakEffect = "started" | "extended" | "unchanged"

export type CompletionReward = {
  readonly isFirstCompletion: boolean
  readonly pointsEarned: number // challenges.points ?? FALLBACK_POINTS when first; 0 when repeat
  readonly totalPointsBefore: number // totalPointsAfter - pointsEarned (pure arithmetic, no snapshot query)
  readonly totalPointsAfter: number // user_stats.total_points, fetched fresh (post-trigger)
  readonly streakEffect: StreakEffect
  readonly currentStreak: number // fresh user_stats.current_streak; drives the day label
  readonly firstRunElapsedDisplay: string | null // mm:ss of the FIRST completed session; only used on repeat
  readonly rank: number | null // ownRank from getLeaderboard; only surfaced on first completion
  readonly badgeNewlyEarned: boolean // decorative; independent of the badge-card bug fix (see below)
}

export const getCompletionReward = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<CompletionReward | null> => { ... }
```

**Critical queries — any failure → `console.error` + return `null` (mirrors `stats-service`'s pattern):**

| Query                                                                                                                                                                                                                                                                 | Purpose                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `challenge_sessions` (`id, started_at, completed_at`) where `user_id`, `challenge_slug = slug`, `status = "completed"`, ordered `completed_at asc` — **no `lang` filter**, to exactly mirror the DB trigger's own guard which only keys on `user_id + challenge_slug` | Row count → `isFirstCompletion` (`rows.length === 1`). First row → `firstRunElapsedDisplay`.                                                      |
| `challenges` (`points`) where `slug = slug`, `.maybeSingle()`                                                                                                                                                                                                         | `pointsEarned` source; `?? FALLBACK_POINTS` (10) — same constant/convention as `stats-service.ts`.                                                |
| `user_stats` (`total_points, current_streak`) where `user_id`, `.maybeSingle()`                                                                                                                                                                                       | `totalPointsAfter`, `currentStreak` — both already updated by the trigger by the time this page loads (same transaction as the completion write). |

**Supplementary queries — non-critical, degrade to a default, never null the whole result:**

| Query                                                                                                                                                                                                    | Purpose                                                                              | On failure                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `getLeaderboard(supabase, userId)` (reused as-is from Surface 2)                                                                                                                                         | `rank = data?.ownRank ?? null`                                                       | Already returns `null` gracefully; `rank` becomes `null`, chip hidden. |
| `challenge_sessions` count (`{ count: "exact", head: true }`) where `user_id`, `status = "completed"`, `challenge_slug like '${slugPrefix}%'` — only run when `inferCategoryBadge(slug)` returns a track | `badgeNewlyEarned = count === 1` (mirrors `awardTrackBadge`'s own condition exactly) | Log + default `badgeNewlyEarned = false`.                              |

**`streakEffect` derivation:** `!isFirstCompletion → "unchanged"`; else `currentStreak > 1 → "extended"`, else `"started"`. Documented simplification: doesn't distinguish "extended earlier today by a different challenge" from "extended just now" — both read as "extended." Acceptable; avoids a before/after streak snapshot.

### Badge lookup fix (in the result page itself, NOT in `reward-service`)

```ts
const badgeKey = inferCategoryBadge(slug) // pure function, can't fail
const { data: badge } =
  badgeKey === null
    ? { data: null }
    : await supabase
        .from("user_badges")
        .select("badge")
        .eq("user_id", user.id)
        .eq("badge", badgeKey)
        .maybeSingle()
```

**Why this lives in the page and not in `reward-service`:** the badge-card bug fix is _existing, core_ functionality (the page already shows a badge card today; it's just wrong for 4 of 5 tracks) and must not become dependent on the new service's success. Only the "New" tag is new, decorative enrichment (`reward?.badgeNewlyEarned ?? false`) — if `reward-service` fails entirely, the badge card still renders correctly (bug fixed, badge shown), it just silently loses the "New" tag.

Rendering the name/description indexes `dict.badges` by the resolved key: `dict.badges[badgeKey as keyof PlaygroundDict["badges"]]`. Safe because `inferCategoryBadge` only ever returns one of the 5 track `badgeKey`s in `CHALLENGE_TRACKS` (`review-corps`, `ship-it`, `coverage-hero`, `first-merge`, `doc-writer`), all of which exist as `dict.badges` entries — the same structural assumption `BadgesSection.tsx`'s `BADGE_ICONS` record already relies on.

## Components (feature-first: `features/playground/`)

| Piece                                                 | Kind                                   | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/reward-service.ts`                            | server module                          | `getCompletionReward` as specified above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `domain/format-elapsed.ts`                            | pure helper (new)                      | `formatElapsed(totalSeconds: number): string` → `mm:ss`. Extracted from the page's existing inline computation (lines 224–231 today) so both the hero's current-run chip and the reward service's `firstRunElapsedDisplay` share one implementation.                                                                                                                                                                                                                                                                                                                               |
| `components/RewardCountUp.tsx`                        | client (new)                           | `{ from, to, durationMs = 900, className }`. `useState<number>(to)` as the initial/SSR value (no-JS or pre-hydration paint always shows the _correct final_ number, never a flash of 0). In a `useEffect`: if `globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches`, do nothing (stays at `to`); otherwise reset to `from` and run a `requestAnimationFrame` loop with a cubic ease-out (`1 - (1-t)³`) until `durationMs` elapses, landing exactly on `to`. Cleans up via `cancelAnimationFrame`.                                                                    |
| `components/RewardMoment.tsx`                         | server-compatible presentational (new) | `{ reward: CompletionReward \| null; currentElapsedDisplay: string \| null; dict: PlaygroundDict["reward"] }`. Returns `null` immediately if `reward === null` — the rest of the page is entirely unaffected. Otherwise renders the chip row (`flex flex-wrap justify-center gap-2`, matching the existing stat-chip row) branching on `reward.isFirstCompletion`, plus the total-points line below it on the first-completion path. `currentElapsedDisplay` is the page's own already-computed elapsed string, threaded through only for the repeat state's time-comparison chip. |
| `components/ConfettiEffect.tsx`                       | edit                                   | Add the reduced-motion gate as the first line of the `useEffect`: `if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return` before the `setTimeout`.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `app/[lang]/playground/[slug]/active/result/page.tsx` | edit                                   | 1) Fix the hardcoded badge query/dict lookup. 2) Use `formatElapsed` for the existing elapsed-time computation. 3) Bundle the badge check, next-challenge completed-slugs query, and `getCompletionReward` call into one `Promise.all` (all three are independent reads today, run sequentially). 4) Render `<RewardMoment reward={reward} currentElapsedDisplay={elapsedDisplay} dict={dict.reward} />` between the stat-chip row and the CTA row. 5) Pass `badgeNewlyEarned={reward?.badgeNewlyEarned ?? false}` into the (fixed) badge card.                                    |

**Chip icons** (check/flame/clock/trophy, matching the mock): small local inline SVGs added to `RewardMoment.tsx`, matching the page's own existing pattern of file-local icon consts rather than a new shared icon module.

- Points chip → check icon, accent style (`bg-accent-soft border-accent-ring text-ob-accent`, matching the page's existing `bg-ob-accent/[0.12] border-ob-accent/40 text-ob-accent` "completed" chip treatment).
- Streak chip (both branches) → flame icon, accent style.
- Rank chip → trophy icon, normal style (`bg-bg-card border-line`, matching the page's existing secondary chips).
- Time-comparison chip (repeat) → clock icon, normal style.
- Streak-unchanged chip (repeat) → flame icon, dimmed style (`text-fg-muted`, muted border) — a third visual tier distinct from "normal."

## i18n

New top-level `reward` section in `PlaygroundDict` (es + en) — following the Surface 1/2 precedent of adding new top-level sections rather than overloading `result`:

```ts
readonly reward: {
  readonly pointsSuffix: string // appended after the animated number, e.g. "+20 points"
  readonly streakExtendedLabel: string // "{day}" placeholder
  readonly streakExtendedTag: string
  readonly streakStartedLabel: string // day is always 1 here — hardcoded, no placeholder
  readonly streakStartedNote: string
  readonly streakUnchangedLabel: string
  readonly rankLabel: string // "{rank}" placeholder
  readonly totalPointsSuffix: string // appended after the animated "before → after" line
  readonly timeComparisonLabel: string // "{current}" / "{first}" placeholders
  readonly repeatNote: string
  readonly badgeNewTag: string
}
```

Copy (concise, no gamification kitsch, no production-implying language — same tone discipline applied twice already on Surface 2):

| Key                    | es                                                                            | en                                                          |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `pointsSuffix`         | "puntos"                                                                      | "points"                                                    |
| `streakExtendedLabel`  | "Racha — día {day}"                                                           | "Streak — day {day}"                                        |
| `streakExtendedTag`    | "extendida"                                                                   | "extended"                                                  |
| `streakStartedLabel`   | "Racha iniciada — día 1"                                                      | "Streak started — day 1"                                    |
| `streakStartedNote`    | "Vuelve mañana (UTC) para llegar al día 2."                                   | "Come back tomorrow (UTC) to make it day 2."                |
| `streakUnchangedLabel` | "Racha sin cambios"                                                           | "Streak unchanged"                                          |
| `rankLabel`            | "#{rank} en el tablero"                                                       | "#{rank} on the board"                                      |
| `totalPointsSuffix`    | "puntos totales"                                                              | "total points"                                              |
| `timeComparisonLabel`  | "{current} vs {first} primera vez"                                            | "{current} vs {first} first run"                            |
| `repeatNote`           | "Los puntos se otorgan una sola vez por reto — la repetición sigue contando." | "Points pay out once per challenge — the rep still counts." |
| `badgeNewTag`          | "Nuevo"                                                                       | "New"                                                       |

The points/total-points numbers render via `RewardCountUp`, composed as JSX around the translated suffix/label strings (not baked into templated numeric strings) — the count-up node sits directly next to its static text.

## Reduced-motion handling

- **Confetti:** `ConfettiEffect` skips firing entirely when `prefers-reduced-motion: reduce` is set — no confetti call at all, matching the codebase's existing idiom.
- **Count-up:** `RewardCountUp` defaults its state to the final value (`to`) so the very first paint is already correct; its effect only kicks off the animate-from-`from` behavior when reduced motion is **not** preferred. Under reduced motion the number is simply correct the whole time — no jump, no flash.
- Both reuse the exact same `globalThis.matchMedia(...)` idiom already used in `use-terminal-animation.ts` / `DocsScrollReveal.tsx` / `HeroPhrases.tsx` — no GSAP involved in either, so GSAP's own `matchMedia` helper doesn't apply here.

## Responsive & a11y

- Reward chip row uses the same `flex flex-wrap items-center justify-center gap-2` treatment as the existing stat-chip row directly above it — no new breakpoint needed.
- Numbers (`RewardCountUp` output, rank, total-points line) use `tabular-nums` so digit-width doesn't jitter mid-animation.
- Chip icons are `aria-hidden="true"` (matching the page's existing `CheckIcon`/`ClockIcon` pattern); chip label text is always real text.
- The "New" badge tag is real text, not color-only.
- Both themes via existing tokens (`bg-accent-soft`/`bg-ob-accent`, `border-accent-ring`, `text-ob-accent`, `text-fg-muted`, `bg-bg-card`, `border-line`) — no new palette entries.
- `RewardMoment` renders nothing interactive — informational only, same as `StatsStrip`.

## Acceptance criteria

- First completion, `current_streak > 1` ("extended"): points chip count-up 0→N (or instant N under reduced motion), correct day count in the streak chip with the "extended" tag, rank chip shown when `getLeaderboard` resolves an own rank, total-points line count-up `before→after`.
- First completion, `current_streak === 1` ("started"): same points/rank/total-points behavior; streak chip reads "Streak started — day 1" with the "come back tomorrow" note; no "extended" tag.
- Repeat completion: no points chip, no total-points line; "Streak unchanged" dimmed chip; time-comparison chip renders `{current} vs {first} first run` when both timestamps are available, hidden if either is missing; repeat note visible.
- Badge card shows the correct badge for all 5 tracks (verified across at least code-review + one other track), not just `review-corps`.
- Badge card shows a "New" tag only on the completion where that track's badge is first awarded; a later completion in the same track shows the badge without the tag.
- A `getCompletionReward` query failure hides only the reward chip row (and drops the "New" tag) — badge display, confetti, next-challenge suggestions, and the rest of the page keep working exactly as today.
- `ConfettiEffect` fires normally with no reduced-motion preference; fires not at all with `prefers-reduced-motion: reduce` set.
- `RewardCountUp` animates under normal conditions and renders the final value immediately under reduced motion.
- es + en, both themes, existing breakpoints. `types:check`, `lint`, build green; SonarCloud 0 new issues.

## Action plan (single PR, every diff shown before its commit)

1. Issue `feat(playground): completion reward moment on the result page` + branch `<N>-result-reward`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: `reward` dictionary section (es/en) in `lib/playground-dictionary.ts`.
4. Commit 3 — `fix(playground)`: resolve the result page's badge lookup via `inferCategoryBadge(slug)` instead of the hardcoded `review-corps` filter; extract `domain/format-elapsed.ts` and use it in the page's existing elapsed-time computation. (Stands on its own as a real bug fix, independent of the reward feature.)
5. Commit 4 — `feat(playground)`: `server/reward-service.ts` (`getCompletionReward`: first/repeat detection, points before/after, streak effect, rank, badge-newly-earned).
6. Commit 5 — `feat(playground)`: `RewardCountUp` + `RewardMoment` components; wire both into the result page hero (`Promise.all` bundling; pass `badgeNewlyEarned` into the badge card).
7. Commit 6 — `fix(playground)`: `ConfettiEffect` respects `prefers-reduced-motion`.
8. Checks + full SonarCloud report; user verifies visually on localhost — force each state via the Table Editor (edit a `challenge_sessions` row's `status`/`completed_at` to create/remove a "repeat," edit `user_stats.current_streak` to flip the "started" vs "extended" branch, complete challenges across different tracks to confirm the badge fix), and toggle OS-level reduced motion to confirm confetti/count-up gating.
9. Merge (merge commit). No DB changes — nothing to `db push`.
