# Spec: Filter Bar Visual Redesign (Design Brief)

**Status:** Draft — ready for a design session
**Date:** 2026-07-22
**Owner:** @Dayron-Glez
**Parent brief:** `specs/color-system.md`
**Design reference:** to be produced in a Claude Design session from this brief (same flow as `specs/challenge-card-redesign.md` → `Challenge Card Redesign.html` → chosen variant implemented in #135)

## Context

The challenge card just picked up a richer treatment (corner glow + hover reveal, #135) on top of its #131 icon-tile bloom. Next to it, the filter bar (`features/playground/components/FilterBar.tsx`) — the row of category tabs above the challenge grid ("Todos", "Revisión de código", etc.) — now reads as comparatively flat: plain pill tabs in a bordered container, a small 7px hue dot per category, active tab marked only by a background/text-color swap. The owner flagged this directly after reviewing #135 on the live hub page.

## Current state (baseline)

- Outer container: `border-line bg-bg-card rounded-(--r-10) border p-1`, `TabsList` from the shared `components/ui/tabs` primitive.
- Each tab (`TabsTrigger`): flat pill, `rounded-(--r-8) px-2.5 py-1.5`.
  - **Active:** `bg-bg-elev text-ob-accent shadow-sm` — background fill + green text + a barely-visible shadow.
  - **Inactive:** `text-fg-muted`, `hover:bg-bg-elev/60`.
- Category tabs additionally show a 7px track-hue dot (shipped in #131) before their icon — the _only_ per-track color in the whole component, deliberately subtle per `color-system.md` decision Q3.
- "Todos" tab has a grid icon instead of a dot (it has no single track).
- A separate sort control (dropdown + asc/desc toggle) sits to the right of the tab list, visually disconnected from it.

## Goal

Give the filter bar more visual depth/polish — so it doesn't feel like the plainest surface on a hub page where badges, cards, and pills all now carry some identity or refinement — **without** violating the green-active-baseline rule the brief already locked in.

## Guardrails (inherited from `color-system.md`, non-negotiable)

- **Decision Q3 stands: green-active baseline, hue stays a subtle accent.** The _active_ tab must still read primarily as **green** (the brand's "you are here" signal) — no variant should make a category's track hue the dominant color of its own active state. The per-track dot is the ceiling for how much identity color this component carries; a variant may restyle _how_ the dot is presented, not promote it to a full-tab wash.
- **The OKLCH rule is law** for any track color touched — L≈78%, C≈0.18, hue-only, reusing the 5 existing tokens.
- **No new hues, no ad-hoc hex.** Only `--color-ob-accent` (green) and the existing `--color-track-*` tokens.
- **Identity is playground-only.** No spillover to docs/landing navigation, which is a separate, unrelated tab-like pattern.
- **Judge every variant in its real context — the full bar, not one isolated tab.** This is the exact lesson from the challenge-card review (`specs/challenge-card-redesign.md`): a single-tab mock can hide density/repetition problems a real 6-tab row reveals. **Any variant must be rendered as the complete row** — "Todos" + all 5 category tabs + the sort control together, at realistic tab widths (short and long labels, e.g. "Git" vs "Documentación").
- **This is a re-skin, not a re-scope.** Same tabs, same counts, same sort dropdown/toggle, same underlying `Tabs`/`TabsList`/`TabsTrigger` primitives from `components/ui/tabs` (Radix-based) — no new interaction model, no removed functionality.
- **Responsive.** The tab list already scrolls horizontally on overflow (`overflow-x-auto`) at narrow widths — whatever ships must preserve that, not assume every tab always fits.

## Ideas to explore (starting menu — the session can propose others)

1. **Sliding active indicator** — an animated underline or pill background that slides between tabs on selection, instead of an instant background swap. Motion as the "upgrade," not more static color.
2. **More depth on the container** — inset shadow, subtle gradient, or a slightly elevated `bg-bg-elev` base instead of flat `bg-bg-card`, to give the whole bar more presence against the page background.
3. **Stronger active/inactive contrast** — the current inactive state (`text-fg-muted`) is quite low-contrast against active; explore whether inactive tabs could read clearer without becoming loud.
4. **Dot treatment refinement** — the 7px dot is small and easy to miss; explore whether it could be slightly larger, given a subtle ring/glow consistent with the badge/card treatment, or repositioned, while staying within the "accent, not wash" ceiling from Q3.
5. **Unify the sort control** — visually integrate the sort dropdown/toggle with the tab list (shared container, consistent depth) rather than two disconnected pieces sitting side by side.
6. **Anything else the session considers** — e.g. count-badge styling, icon treatment, spacing rhythm.

## Deliverable

A Claude Design mock (same DesignSync project, new file) presenting 3-5 named variants, **each rendered as the complete filter bar row** (all 6 tabs + sort control, realistic label lengths), with a recommendation and reasoning for why it stays within the green-active-baseline guardrail.

## Rollout

Once a direction is chosen, it ships as its own implementation PR (its own mini-spec, following the established per-surface pattern: diffs shown before each commit, `types:check`/`lint`/`build` green, SonarCloud full report 0 new issues, visual check on localhost). Not blocking on the rest of the color-system rollout (state-token migration, difficulty).
