# Spec: Difficulty Bars — Neutral Count + Consolidation (Color System — Surface 4 of 4)

**Status:** Ready to implement
**Date:** 2026-07-22
**Parent brief:** `specs/color-system.md`

## What ships

The last piece of the original color-system brief. Decision Q2 (already settled in the Claude Design session, `Color System.html` section 05): difficulty is a **magnitude, not a category** — it reads as a neutral bar count (`fg-2` filled / `fg-faint` empty), not a color ramp, because a green→amber→red ramp would collide with amber = in-progress. All three difficulty-bar renderers currently paint filled bars `bg-ob-accent` (green) — none of them use a ramp, but green is still a color signal that doesn't belong here per Q2, and none of them are consolidated yet.

## What's actually duplicated — 3 renderers, not 2

The original brief only flagged two (`shared/DiffBars.tsx` and a duplicate in `ChallengeCard.tsx`). A grep for `DifficultyBars|DiffBars` while implementing turned up a **third**, in `app/[lang]/playground/[slug]/page.tsx`:

| Renderer                                   | Input                         | Bar heights                           | Fill technique                                               | Label                              |
| ------------------------------------------ | ----------------------------- | ------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `shared/DiffBars.tsx` (canonical target)   | `difficulty: string`          | 5px / 8px / 12px                      | solid swap: `bg-ob-accent` ↔ `bg-fg-faint`                   | caller renders separately          |
| `ChallengeCard.tsx` local `DifficultyBars` | pre-computed `level: 1\|2\|3` | 8px / 10px / 12px (different scale)   | opacity swap: `opacity-100` ↔ `opacity-20` on `bg-ob-accent` | caller renders separately          |
| `[slug]/page.tsx` local `DifficultyBars`   | pre-computed `level: number`  | 5px / 8px / 12px (matches `DiffBars`) | solid swap: `bg-ob-accent` ↔ `bg-fg-faint`                   | baked in (`text-fg text-[13.5px]`) |

`shared/DiffBars.tsx` and `[slug]/page.tsx`'s version already agree on bar scale and fill technique — `ChallengeCard.tsx`'s is the visual outlier (different heights, opacity-dimming instead of a real color swap, so its "empty" bars still show a faint green tint instead of reading fully neutral). Two more consumers already use `shared/DiffBars.tsx` correctly and need no changes: `app/[lang]/playground/[slug]/active/result/page.tsx` (2 call sites) and `features/docs/components/SearchDialog.tsx`.

## The fix

1. **`shared/DiffBars.tsx`** — swap `bg-ob-accent` → `bg-fg-2` (2 occurrences, the two `level >= n` branches that currently paint green). `bg-fg-faint` for the empty state is unchanged. No API change — still takes `difficulty: string`, still renders bars only, no label. This single change also fixes the 2 already-correct call sites for free (`active/result/page.tsx`, `SearchDialog.tsx`) since they already delegate to this component.
2. **`ChallengeCard.tsx`** — delete the local `DifficultyBars` component and the local `difficultyLevel` map (no longer needed — `DiffBars` computes level internally from `difficulty`). Replace `<DifficultyBars level={difficultyLevel[difficulty]} />` with `<DiffBars difficulty={difficulty} />`, imported from `@/shared/DiffBars`. This also silently fixes the height-scale/opacity inconsistency — the card now renders the same bars as everywhere else.
3. **`[slug]/page.tsx`** — delete the local `DifficultyBars` component and the local `DIFFICULTY_LEVEL` map. Replace the single call site with the same two-piece pattern `active/result/page.tsx` already uses: `<DiffBars difficulty={page.data.difficulty} />` next to a separately-rendered `<span className="text-fg text-[13.5px]">{difficultyLabel}</span>`, preserving the exact same rendered markup/wrapper (`<span className="inline-flex items-center gap-2">`).

## Guardrails carried over from `color-system.md`

- Decision Q2 is final: neutral count, no ramp, no per-level hue.
- No new tokens needed — `fg-2`/`fg-faint` already exist.
- This is a rename/consolidation, not a redesign — bar count, sizing, and spacing stay the same wherever `shared/DiffBars.tsx`'s existing scale already applies (2 of 3 renderers); only `ChallengeCard.tsx` visually changes (adopts the majority scale/technique, arguably a small consistency fix rather than a redesign).

## Acceptance criteria

- Difficulty bars render `fg-2` (filled) / `fg-faint` (empty) everywhere — no green, anywhere, at any difficulty level.
- Only one `DifficultyBars`-shaped component exists in the codebase: `shared/DiffBars.tsx`. Zero duplicate local renderers remain.
- Challenge-card footer, challenge-detail sidebar, the "keep going" suggestions on the result page, and playground search results all render visually consistent bars (same height scale, same fill technique).
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): compare a `beginner`/`moderate`/`demanding` challenge across the hub grid, the detail page, and search — bars should look like the same component everywhere.

## Action plan (single PR)

1. Issue `feat(playground): consolidate difficulty bars to a neutral-count treatment (color system, surface 4/4)` + branch `<N>-difficulty-bars-consolidation`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: `shared/DiffBars.tsx` color swap to `fg-2`.
4. Commit 3 — `feat(playground)`: `ChallengeCard.tsx` — delete local renderer, use `DiffBars`.
5. Commit 4 — `feat(playground)`: `[slug]/page.tsx` — delete local renderer, use `DiffBars`.
6. Checks + full SonarCloud report; owner verifies visually on localhost.
7. Merge (merge commit) — this closes out the original 4-surface color-system brief.
