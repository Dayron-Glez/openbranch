# Mini-spec: public profiles — the shareable OG card

**Status:** Implementing — PR 4 of 4, last one
**Date:** 2026-08-18
**Owner:** @Dayron-Glez
**Parent:** `specs/public-profiles.md`. Design: `specs/og-card-design.md` (round 2) + `design_handoff_og_card/OG Card - u-username v2.html`. Builds on PR 1 (data), PR 2 (page), PR 3 (links/nav) — all merged.

## What v2 solved that v1 didn't

v1 got the headline metric right (catalogue fraction, not points — self-explanatory at any scale, one composition from 1 to 6) but read as three flat, symmetric rows. v2 keeps the metric and the entire Satori risk discipline unchanged, and fixes the flatness with three moves, each with a documented reason tied to the renderer, not just taste:

- The brand mark grows from a 46px corner signature to a 214px ghost-branch composing in the empty space — still the card's only SVG.
- The headline digit (216px → 300px) breaks out of a shared row into a fixed-width column that sets the whole block's height; everything else stacks beside it. Not an overlap trick — v2 explicitly rejected absolute-positioning the digit because it would break the one guarantee this template has (1 and 6 land in the same spot), and got the same visual dominance from flexbox height instead.
- The catalogue strip gains a third cell state — _next_ — solid accent border + a small dot, derived from data already computed elsewhere (see below), not a new icon.

Two explorations were tried and explicitly rejected in the handoff: an outlined/watermark digit (needs `-webkit-text-stroke`, unsupported) and a progress ring (`conic-gradient` unsupported, hand-rolled arcs too fragile). Not revisiting either.

## A real gap between the mock and the actual catalog, found while reading it — not the design's fault

The mock's six strip cells read `GIT · REVIEW · TEST · DOCS · BUG · BUG` — that specific sequence matches neither `CATEGORY_ORDER` nor `CHALLENGE_TRACKS`' declared order. It's illustrative, built for the mock's own example data, not a real ordering this codebase already produces.

**What the strip's order and count actually are**: `playgroundSource.getPages(lang)` filtered to `maturity: "stable"`, in the order the source returns them — the exact same "recommended" default sort the playground hub already uses (`applySort` returns the array unsorted for that case). No new ordering invented; reusing the one that already exists.

## Data — five reads, all already public, no new queries

- `getProfileOverview` — identity, points, streak, member-since, `completedCount`.
- `getProfileRank` — same three-tier chip logic as the page (`#N` in top 100 / `Top N%` below it / absent → "Empezando").
- `getProfileActivityAndBadges` — `activity` entries carry `category`, used for the strip's done/pending split and for deriving _next_.
- `playgroundSource.getPages(lang)` (stable only) — the strip's real order and total count (6 today).
- `getAllPaths` + `buildPathCardItems` (already async, already computes per-path done/total) — filtered to fully-done paths, for the meta row's route count. Reused as-is rather than re-deriving path completion a second way.

**The _next_ cell reuses `EngagementStats.nextTrack`'s exact one-line rule** (`stats-service.ts`): the first category in `CATEGORY_ORDER` with no completion. Computed locally from `activity`'s categories the same way the profile page already derives `completedCategories` for its stats sub-line — not imported from `stats-service.ts`, which is wired to the signed-in viewer's own `userId`, a different code path than this route's arbitrary-username reads. Framed in third person on the card ("next: docs"), not the second-person nudge the page itself deliberately dropped — a fact about the profile, not advice to the reader.

## A fourth piece, added after the design handoff: the ambient dot texture

The owner asked for the same dot-grid texture `AmbientBackground` uses on the home page and the 404 page — static here, since this is a rendered image, not a live page. Round 1's Q4 rejected this, reasoning that `mask-image` — the thing `AmbientBackground` uses to fade the grid toward the edges — wasn't reliably supported by Satori, and without that fade a tiled dot pattern reads as a test pattern, not texture.

**First correction, which turned out to be incomplete**: a throwaway route proved `mask-image` itself renders without error against this repo's real `next/og` pipeline — `200`, valid PNG, a byte size consistent with a masked frame. That was read as clearance to use `AmbientBackground`'s exact technique (one `backgroundImage` tile faded by a `mask-image`). It wasn't: the check only confirmed the request didn't crash, never that the tiles were actually visible.

**Second correction, from actually looking at the rendered pixels**: building the real route with that technique produced a card indistinguishable from having no texture at all — confirmed by zooming into the output, not just checking status codes. The cause is a different, unrelated Satori gap: `backgroundSize`-tiled repetition isn't implemented, so a `radial-gradient(...)` sized smaller than its container renders once, unrepeated, at a scale invisible against a 1200×630 canvas. `mask-image` itself was never the problem this time.

**The fix that actually renders**: real elements, not a CSS pattern — a `DOT_GRID` array of ~190 positions on a 64px lattice, each a 3×3px `div` with `borderRadius: 999` and its own `opacity` computed once from distance to canvas center (`Math.hypot`, peak `0.09`, falling off to 0 past a 620px radius) — the same per-element-opacity shape the design handoff's §05·04 always specified, which this route only detoured away from mid-implementation. Confirmed visible by cropping and zooming the actual PNG output, not by status code. Applies to both card states — it's a background layer, unaffected by populated/sparse.

## Round 3: the dot texture alone wasn't the ambient background

The owner's reaction to the round-2 result — "no ha quedado como esperaba" — was correct. `AmbientBackground` is three stacked layers (`reference/Landing Page.html`), and the dot grid is the weakest of the three; what actually reads as "the ambient background" on the home and 404 pages is the **git graph** — seven vertical "streets," six branch arcs, twenty-one commit nodes, four of them accent-colored. A round-3 design handoff (`OG Card - u-username v3.html`) specified all three layers transcribed into the card, in the static end-state `prefers-reduced-motion` already defines (fully-drawn strokes, no dash animation, no blur filter on the sweep).

Implemented as two new layers alongside the existing dot grid:

- **`GraphLayer`** — the git graph's 13 paths + 21 circles, coordinates rewritten directly to the card's own 1200×630 (not sliced from the source's 1600×1000 via `preserveAspectRatio="slice"` — not worth trusting inside Satori for a background layer). `color: rgba(183,188,196,.10)` on the wrapping `div`, inherited by the SVG's `stroke="currentColor"`/`fill="currentColor"`, matching the source's `currentColor` pattern through `<use>`.
- **Sweep layer** — the source's `filter: blur(28px)` has no Satori equivalent, so it's a wider, softer unblurred `radial-gradient` instead (`480×756` at `rgba(85,214,113,.06)`), frozen in the one empty band of the layout (center-right, clear of both the content column and the ghost mark).
- Both masks recentered to `50% 50%` — production pushes them toward `35%`/`40%` for a top-third hero that doesn't exist here.

**The handoff's own risk table called the tiled-dot-grid technique "ok, verified" again** (`background-image` + `background-size` + `background-position`, one `div`) — re-tested directly rather than trusting that label a second time: a single exaggerated red dot rendered dead-center of the canvas, not a repeated grid. Confirmed conclusively that Satori has no `background-repeat`/tiling support at all, independent of mask or opacity — so the round-2 `DOT_GRID` per-element array stays, not the handoff's one-div version.

**`mask-image` itself was re-confirmed genuinely working this round** — pixel-diffed the graph layer masked vs. unmasked (sampled every 4px): 325 of ~47,000 sample points differed, some by up to 149/765 in summed RGB distance, concentrated toward the canvas edges as expected from an ellipse fading from 30% to 80% of its radius. So the round-2 finding stands precisely as scoped: masking a normal (non-tiled) layer works; tiling a background never does.

## Sparse vs. populated

Unchanged from round 1: `completedCount === 0`. The strip's _first_ cell becomes the _next_ cell in this state (nothing done yet, so the whole row is otherwise pending) — the handoff's own point that this is what keeps the empty state from reading as a blank inventory.

## Fonts

Three files, matching v2's type usage exactly (the rank chip's two font sizes are both Geist Mono at the same weight — no fourth file needed):

- `Geist-Light.ttf` (300) — the headline digit.
- `Geist-SemiBold.ttf` (600) — username, wordmark.
- `GeistMono-Regular.ttf` (400) — handle, rank chip, strip cells, meta row.

Copied from `node_modules/geist/dist/fonts/{geist-sans,geist-mono}/` into `assets/fonts/og/`, read via `fs.readFile(path.join(process.cwd(), ...))` at request time — predictable regardless of whether `node_modules` tracing survives the production build, which this repo doesn't otherwise configure for.

## Route

`app/og/u/[username]/route.tsx` — new. `notFound()` when `getProfileOverview` returns null, same rule the docs OG route follows for a missing page. `ImageResponse` at `width: 1200, height: 630`, fonts loaded above. `revalidate = 3600` — short enough that a card doesn't go stale for long after someone finishes a challenge, long enough that a link shared repeatedly doesn't recompute the image (fonts + an avatar fetch) on every preview crawl.

Every literal color, spacing, and type value comes from the handoff's §06/§08 tables (v2) — transcribed, not re-derived.

**Long usernames**: the handoff's JS step-down rule (`>18 chars → 42px, >28 → 34px`, never ellipsis) — GitHub allows up to 39.

**Remote avatar**: `<img src={avatarUrl}>` with a short timeout; falls back to the mono-initials circle (designed, not a placeholder) on failure — same avatar-fallback pattern `LeaderboardTable`/`ProfileHeader` already use client-side, translated to a server-side fetch-with-timeout here since there's no browser to let the `<img>` fail natively.

## Metadata wiring

- `lib/shared.ts` gains `profileImageRoute = "/og/u"`, alongside `docsImageRoute`.
- The profile page's `generateMetadata` gains `openGraph: { images: [...] }` and `twitter: { card: "summary_large_image" }`, mirroring `app/[lang]/docs/[[...slug]]/page.tsx`'s existing pattern.

## Verification

- `types:check` / `lint` / `build` green.
- A direct fetch against `/og/u/[username]` for a real username returns `200`, `content-type: image/png`, non-trivial byte size — confirms fonts + layout + the ghost-mark SVG actually rendered rather than silently failing into a blank frame. The single riskiest unverified item from the handoff (§07): the ghost mark's `stroke-width` scaling cleanly from a 64-unit viewBox to 214px on-canvas — checked directly against the rendered output, with the handoff's own fallback (rewrite the viewBox to 672 units, same five primitives) ready if it doesn't.
- Same check for a sparse profile and for a nonexistent username (`404`).
- The profile page's `<meta property="og:image">` resolves correctly, both locales.
