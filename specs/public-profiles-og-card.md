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

**That reasoning was untested, and turned out to be wrong.** Verified directly against this repo's real `next/og` pipeline with a throwaway route: a repeating `backgroundImage` dot pattern (`radial-gradient(circle, ... 3px, transparent 3px)`, tiled via `backgroundSize`) combined with `maskImage: radial-gradient(ellipse ... , black, transparent 78%)` rendered successfully — `200`, valid PNG, file size consistent with a faded texture rather than a solid frame. So the implementation uses the real `AmbientBackground` technique as-is, not a hand-rolled per-dot fallback: one absolutely-positioned layer with `.ambient-dots`' exact values from `app/animations.css` — `radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px)` tiled at `32px 32px`, masked with `radial-gradient(ellipse 90% 65% at 50% 50%, black, transparent 78%)` (centered on the 1200×630 canvas rather than the page's off-center `35%`, since there's no hero block pulling focus here). Applies to both card states — it's a background layer, unaffected by populated/sparse.

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
