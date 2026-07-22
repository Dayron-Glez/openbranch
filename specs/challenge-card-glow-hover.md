# Spec: Challenge Card — Corner Glow + Hover Reveal (Chosen Treatment)

**Status:** Ready to implement
**Date:** 2026-07-22
**Parent brief:** `specs/challenge-card-redesign.md`
**Design reference:** Claude Design project "openbranch" → `Challenge Card Redesign.html`, section 06 ("Glow + reveal — hybrid," tagged "Your pick")

## What ships

Replaces the icon-tile-only baseline (`#131`) with a richer treatment, chosen from the 5 variants + hybrid explored in the design brief:

**At rest:**

- Icon tile keeps its existing bloom (`border-(--track-ring) bg-(--track-soft) text-(color:--track)`, unchanged from #131).
- A soft radial glow of the track's `-soft` color, anchored behind the icon tile, fading to transparent within ~120px — at low opacity (0.4).
- A short top-left edge stub (56px wide, 2.5px tall) in the track's base color, at low opacity (0.5).
- Card border stays neutral (`border-line`, unchanged).

**On hover / focus-within:**

- The glow intensifies (opacity → 1).
- The edge stub grows to the full card width (opacity → 0.9).
- The card border promotes from neutral to the track's `-ring`.

This was explicitly designed against the rejected full-border-tint mistake: saturated color stays anchored to one corner and thin at rest, and only the card being pointed at blooms further — a mixed-track grid stays calm, the interacting card reads as clearly active.

## Why a dedicated stylesheet

The design uses `::before`/`::after` pseudo-elements with a positioned `radial-gradient` and per-property transitions (`opacity`, `width`) that don't map cleanly onto Tailwind utility classes. `features/playground/components/git/ThreeWayMergeEditor.tsx` already establishes the precedent for a co-located CSS file (`merge-editor.css`) for exactly this kind of non-trivial, component-scoped styling — this follows the same pattern with a new `challenge-card.css`.

## Implementation

### `features/playground/components/challenge-card.css` (new)

```css
[data-challenge-card] {
  position: relative;
}

[data-challenge-card] > * {
  position: relative;
  z-index: 1;
}

[data-challenge-card]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: radial-gradient(120px 120px at 38px 38px, var(--track-soft), transparent 70%);
  opacity: 0.4;
  pointer-events: none;
  transition: opacity var(--d-slow) var(--ease);
}

[data-challenge-card]::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 56px;
  height: 2.5px;
  background: var(--track);
  opacity: 0.5;
  transition:
    width var(--d-slow) var(--ease),
    opacity var(--d-slow) var(--ease);
}

[data-challenge-card]:hover,
[data-challenge-card]:focus-within {
  border-color: var(--track-ring);
}

[data-challenge-card]:hover::before,
[data-challenge-card]:focus-within::before {
  opacity: 1;
}

[data-challenge-card]:hover::after,
[data-challenge-card]:focus-within::after {
  width: 100%;
  opacity: 0.9;
}
```

The radial-gradient anchor (`38px 38px`) is computed from the real component's geometry — `p-5` (20px) padding plus half the `size-9` (36px) icon tile — not copied verbatim from the design mock, whose card padding differs. The design's `opacity: 1.1` on hover is clamped to `1` here since values above `1` have no additional visual effect.

### `ChallengeCard.tsx`

- `import "./challenge-card.css"` alongside the existing imports.
- Move `data-track={colorToken}` from the icon-tile `<span>` to the outer `<Link>` — custom properties cascade to descendants, so the icon tile still resolves `--track`/`--track-soft`/`--track-ring` correctly, and the new pseudo-elements (which live on the `<Link>` itself) gain the same variables.
- Add `relative` to the `<Link>`'s className (required for the pseudo-elements' `position: absolute`).
- Drop `hover:border-line-2` from the `<Link>`'s className — superseded by the stylesheet's `:hover { border-color: var(--track-ring) }`. Keep `hover:bg-bg-hover` (background lightening is independent of the border/glow treatment).

## Guardrails carried over from `color-system.md` / `challenge-card-redesign.md`

- OKLCH ring untouched — no new hues, reuses the 5 existing track tokens.
- Green stays the only color on the status row (done/in-progress/not-started) — untouched by this change.
- Difficulty bars stay neutral-count — untouched.
- Playground-only — no spillover to docs/landing.

## Acceptance criteria

- Rest state: every card in a mixed-track grid shows a subtle, low-opacity glow + edge stub — calm, not competing, no full-perimeter saturated border (the rejected failure mode).
- Hover/focus-within: the glow intensifies, the edge stub grows full-width, and the border promotes to the track ring — clearly reads as "this card is active" without affecting sibling cards.
- Keyboard focus (`:focus-within`) produces the same visual promotion as `:hover` (a11y parity — the card `<Link>` is keyboard-focusable).
- No inline styles, no ad-hoc hex — only the existing `--track`/`--track-soft`/`--track-ring` custom properties from #129.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner).

## Action plan (single PR)

1. Issue `feat(playground): challenge card corner-glow + hover-reveal track treatment` (#134) + branch `134-challenge-card-glow-hover`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: `challenge-card.css`.
4. Commit 3 — `feat(playground)`: wire `ChallengeCard.tsx` to the new stylesheet and move `data-track` to the outer card.
5. Checks + full SonarCloud report; owner verifies visually on localhost.
6. Merge (merge commit).
