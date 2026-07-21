# Spec: Color Tokens & Badge Identity (Color System — Surface 1 of 4)

**Status:** Ready to implement
**Date:** 2026-07-21
**Parent brief:** `specs/color-system.md`
**Design reference:** Claude Design project "openbranch" → `Color System.html` (sections 01–03, 07)

## What ships

The token foundation for the color system, plus the first surface it reaches: the earned-badge tile.

1. **Identity tokens** — five per-track hues on the existing OKLCH ring (hold L≈78%, C≈0.18, vary only hue), each with the same derived set the accent already has: base, `-soft` (@0.15), `-ring` (@0.35), `-ink` (dark, for text-on-color).
2. **State tokens, rounded out** — `warn`/`info`/`danger` get the same `-soft`/`-ring`/`-ink` set the accent has. Nothing consumes them yet (that's surface 3); this PR only completes the set so surface 3 doesn't also have to touch `global.css`.
3. **Data source** — `colorToken` field on `ChallengeTrackMeta`, one per track.
4. **First consumer** — `BadgesSection.tsx` earned-badge tile.

## The 5 track hues

All at `L 78% · C 0.18`, dark-only. Chosen for even spacing on the open arc and a ≥25° margin from every reserved state hue (green 148 / amber 75 / red 25 / blue 230), so no track can be misread as a state.

| Track           | `colorToken` | Hue  | Nearest reserved hue      | Margin  |
| --------------- | ------------ | ---- | ------------------------- | ------- |
| `git`           | `git`        | 265° | info (230°)               | 35°     |
| `code-review`   | `review`     | 310° | documentation (350°)      | 40°     |
| `documentation` | `docs`       | 350° | danger (25° / 385°)       | 35°     |
| `bug-fix`       | `bugfix`     | 50°  | warn (75°) / danger (25°) | **25°** |
| `testing`       | `test`       | 195° | info (230°)               | 35°     |

`bugfix` at 50° has the tightest margin on both sides — flag it during the visual pass, since a bug-fix card can carry its orange identity next to an amber "in-progress" state badge at the same time.

## Tokens (`app/global.css`, `@theme`)

```css
/* Layer B — per-track identity (playground only) */
--color-track-git: oklch(78% 0.18 265);
--color-track-git-soft: oklch(78% 0.18 265 / 0.15);
--color-track-git-ring: oklch(78% 0.18 265 / 0.35);
--color-track-git-ink: oklch(27% 0.07 265);

--color-track-review: oklch(78% 0.18 310);
--color-track-review-soft: oklch(78% 0.18 310 / 0.15);
--color-track-review-ring: oklch(78% 0.18 310 / 0.35);
--color-track-review-ink: oklch(27% 0.07 310);

--color-track-docs: oklch(78% 0.18 350);
--color-track-docs-soft: oklch(78% 0.18 350 / 0.15);
--color-track-docs-ring: oklch(78% 0.18 350 / 0.35);
--color-track-docs-ink: oklch(27% 0.07 350);

--color-track-bugfix: oklch(78% 0.18 50);
--color-track-bugfix-soft: oklch(78% 0.18 50 / 0.15);
--color-track-bugfix-ring: oklch(78% 0.18 50 / 0.35);
--color-track-bugfix-ink: oklch(27% 0.07 50);

--color-track-test: oklch(78% 0.18 195);
--color-track-test-soft: oklch(78% 0.18 195 / 0.15);
--color-track-test-ring: oklch(78% 0.18 195 / 0.35);
--color-track-test-ink: oklch(27% 0.07 195);

/* Layer A — round out the existing semantic tokens */
--color-warn-soft: oklch(80% 0.14 75 / 0.15);
--color-warn-ring: oklch(80% 0.14 75 / 0.35);
--color-warn-ink: oklch(27% 0.06 75);

--color-info-soft: oklch(78% 0.13 230 / 0.15);
--color-info-ring: oklch(78% 0.13 230 / 0.35);
--color-info-ink: oklch(27% 0.06 230);

--color-danger-soft: oklch(72% 0.18 25 / 0.15);
--color-danger-ring: oklch(72% 0.18 25 / 0.35);
--color-danger-ink: oklch(27% 0.07 25);
```

The `-soft` values for warn/info/danger are not in the design session's token dump (it only lists `-ring`/`-ink` there), but the same session's own callout demo (section 02) uses `--warn-soft`/`--info-soft`/`--danger-soft` for the icon chip background. Added here for consistency with the accent's four-token set and so surface 3 has everything it needs already in place.

### Consumption mechanism — `[data-track]`

Components never branch on hue directly and never receive inline styles. A track-bearing element sets `data-track="<colorToken>"`; a `@layer base` block rebinds four local custom properties that Tailwind's arbitrary-value utilities then read — the same idiom the repo already uses for `rounded-(--r-10)` / `ease-(--ease)`.

```css
@layer base {
  [data-track="git"] {
    --track: var(--color-track-git);
    --track-soft: var(--color-track-git-soft);
    --track-ring: var(--color-track-git-ring);
    --track-ink: var(--color-track-git-ink);
  }
  [data-track="review"] {
    /* … same shape … */
  }
  [data-track="docs"] {
    /* … */
  }
  [data-track="bugfix"] {
    /* … */
  }
  [data-track="test"] {
    /* … */
  }
}
```

```tsx
<span
  data-track={track.colorToken}
  className="border-(--track-ring) bg-(--track-soft) text-(color:--track)"
>
```

This is the seam every later surface (chip, filter dot, card tile) reuses — no per-component color switch statements.

## Data source

`features/playground/domain/manifest.ts`:

```ts
export const TRACK_COLOR_TOKENS = ["git", "review", "docs", "bugfix", "test"] as const
export type TrackColorToken = (typeof TRACK_COLOR_TOKENS)[number]

export type ChallengeTrackMeta = {
  readonly category: CategoryKey
  readonly iconName: string
  readonly badgeKey: string
  readonly slugPrefix: string
  readonly colorToken: TrackColorToken
}
```

Each entry in `CHALLENGE_TRACKS` gets its `colorToken` per the table above. Add `TRACK_BY_BADGE_KEY: ReadonlyMap<string, ChallengeTrackMeta>` alongside the existing `TRACK_BY_CATEGORY`, so `BadgesSection` can resolve a badge key to its track without a linear scan.

## First consumer — earned badge tile

`features/playground/components/BadgesSection.tsx`. Today the earned branch is uniform green:

```tsx
earned ? "border-accent-ring bg-accent-soft text-ob-accent" : "border-line bg-bg-elev text-fg-faint"
```

It becomes: look up the badge's track via `TRACK_BY_BADGE_KEY`; if found, render `data-track={track.colorToken}` with `border-(--track-ring) bg-(--track-soft) text-(color:--track)`; if not found (badges without a track: `streak-7`, `all-tracks`), keep the current green classes unchanged. **Locked tiles are untouched** — they stay `border-line bg-bg-elev text-fg-faint` regardless of track, so the earn moment is where color blooms, per the design session's decision Q4.

## Out of scope (later surfaces in this rollout)

- Category pill / filter-tab dot / challenge-card icon tile (surface 2/4).
- State-token migration (ad-hoc `amber-*`/`red-*`/`rose-*` → `warn`/`danger`) + docs callout treatment (surface 3/4).
- Difficulty bars — neutral-count treatment per decision Q2 (surface 4/4, only if it's worth a dedicated PR on its own).
- Leaderboard podium coloring (deferred by the parent brief, not part of this rollout at all).

## Acceptance criteria

- The 5 track tokens + the 3 rounded-out semantic tokens exist in `@theme`, each following `L≈78%, C≈0.18, vary hue` (state tokens keep their original L/C, only `-soft`/`-ring`/`-ink` are new).
- `colorToken` is present on every entry of `CHALLENGE_TRACKS`; `types:check` catches any track missing one (exhaustive union, not optional).
- Earned badge tiles render their track's hue via `data-track`; badges without a track keep green; locked tiles are pixel-identical to before.
- No inline styles, no ad-hoc hex, no dynamic Tailwind class construction for color.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): all 5 earned hues legible on `bg-card`, `bugfix` orange doesn't read as a warn/danger state next to real state badges elsewhere on the hub.

## Action plan (single PR)

1. Issue `feat(playground): color tokens and badge identity (color system, surface 1/4)` (#128) + branch `128-color-tokens-badges`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(design)`: tokens + `[data-track]` blocks in `app/global.css`.
4. Commit 3 — `feat(playground)`: `colorToken` field + `TRACK_BY_BADGE_KEY` in `manifest.ts`.
5. Commit 4 — `feat(playground)`: `BadgesSection.tsx` earned-tile seam.
6. Checks + full SonarCloud report; owner verifies visually on localhost.
7. Merge (merge commit).
