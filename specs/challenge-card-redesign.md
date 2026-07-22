# Spec: Challenge Card Visual Redesign (Design Brief)

**Status:** Draft — ready for a design session
**Date:** 2026-07-22
**Owner:** @Dayron-Glez
**Parent brief:** `specs/color-system.md`
**Design reference:** to be produced in a Claude Design session from this brief (same flow as `specs/color-system.md` → `Color System.html` → per-surface implementation PRs)

## Context

While implementing surface 2 of the color system rollout (`specs/color-track-surfaces.md`, PR #131), the challenge card (`features/playground/components/ChallengeCard.tsx`) got two treatments tried live:

1. **Icon-tile-only bloom** — the icon tile takes the track's `-ring`/`-soft`/base trio (same treatment as the earned badge tile), card border and background stay neutral. **Shipped in #131.**
2. **Full-card border tint** — the whole card's outer border took the track's `-ring` color instead of neutral `border-line`. **Rejected in review** — across a dense 3-column grid of mixed tracks, every card getting a different-colored border read as noisy/loud rather than as a coherent identity system.

The icon-tile-only version is live and accepted as the baseline, but it's a fairly minimal treatment — the card otherwise looks flat and doesn't feel meaningfully upgraded by having track identity available. This brief asks for a proper design exploration of what the card _could_ look like, learning from why the border experiment failed.

## Goal

Explore concrete visual variants for the challenge card that make better use of track identity (or other means) than the current icon-tile-only baseline — without repeating the "too loud in a dense grid" mistake.

## What must not change (guardrails, inherited from `color-system.md`)

- **The OKLCH rule is law.** Any track color introduced holds L≈78%, C≈0.18, varies hue only — same ring as the 5 existing track tokens (`git` 265° / `review` 310° / `docs` 350° / `bugfix` 50° / `test` 195°). No new hues, no new construction.
- **Green stays primary/success.** The card's "Completado" status text/dot must stay green — track hue must never compete with or replace that meaning.
- **Identity is playground-only.** No spillover into docs or landing.
- **Judge every variant in-context, not in isolation.** The border-tint mistake only became visible in a multi-card, multi-track grid — a single hero-card mock would have hidden it. **Any variant proposed must be rendered as a grid of 4-6 cards spanning at least 4 different tracks side by side**, matching the real hub layout (3-col at desktop).
- **This is a re-skin, not a re-scope.** All existing fields stay: icon, status (not-started / in-progress / completed), title, 2-line description, difficulty bars, estimated time. No new fields, no removed fields, no layout restructure beyond what a variant's color/emphasis treatment requires.
- **Responsive.** Cards render at 3-col → 2-col (`max-[980px]`) → 1-col (`max-[640px]`). Whatever ships must hold up at all three, at minimum conceptually.
- **Difficulty stays out of this.** The difficulty bars' neutral-count treatment is a separate, already-decided piece (`color-system.md` decision Q2) — not in scope for this exploration.

## What's known not to work

- Tinting the full card border in the track hue (session decision "Q3-adjacent," discovered live rather than in the original design session). Explain briefly in the mock output _why_ it was rejected, so the chosen direction visibly avoids the same failure mode (too much saturated area repeated across many adjacent cards).

## Variants to explore (starting menu — the session can propose others)

1. **Baseline (control)** — current shipped icon-tile-only treatment, included for side-by-side comparison.
2. **Thin leading edge** — a 2-3px accent bar on one edge of the card (left or top) in the track hue, instead of a full border. Much less colored area than a full border while still being a strong per-card marker.
3. **Hover/focus-only reveal** — card is fully neutral at rest; the track ring (or edge accent) appears only on hover/keyboard focus, so color reads as an interaction affordance rather than a static grid-wide load.
4. **Icon tile + matching footer accent** — keep the icon tile as the main color carrier, but tie the difficulty-bars or time icon into a _very_ restrained accent (e.g. tinted only on hover) so identity shows up twice, lightly, rather than once, strongly.
5. **Anything else the session considers** — e.g. a subtle top-edge gradient fade, a colored corner mark, texture/pattern differentiation instead of more color. Not limited to the four above.

## Deliverable

A Claude Design mock (same project, new file) presenting 3-5 named variants, **each shown as a populated multi-card grid** (not a single isolated card), with a recommendation and the reasoning for why the recommended one avoids the border-tint failure mode.

## Rollout

Once a direction is chosen, it ships as its own implementation PR (its own mini-spec, following the established per-surface pattern), replacing the current icon-tile-only treatment in `ChallengeCard.tsx`. Not blocking on the rest of the color system rollout (state-token migration, difficulty).
