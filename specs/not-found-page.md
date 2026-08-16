# Spec: the 404 page

**Status:** Draft — problem framed, ready for a design session
**Date:** 2026-08-16
**Owner:** @Dayron-Glez

## Context

The app has no custom 404 today. Eight call sites already call `notFound()` — every docs page, path page, playground challenge and result page, and now the public profile — and any URL that matches nothing at all falls through the same way. All of them currently render Next.js's bare default 404: no nav, no brand, no language, no way back in.

This is the one page in the product that is guaranteed to be someone's _worst_ moment on the site — a dead link, a typo, a stale bookmark, an old share. It deserves the same design attention as any other surface, not the framework default.

## What exists already — read before designing

A rough local draft (`app/[lang]/not-found.tsx`, not committed, not a deliverable) worked out the mechanical shape: reuse `Nav` and `Footer` so the page still feels like the site, a heading plus body copy, and a set of quick links back to Docs / Playground / Rutas. That structure is fine. **What is not fine, and the thing this brief exists to redirect**: the draft's hero includes a custom abstract SVG illustration — hand-drawn branch/tree line art with circles and dashed paths, invented specifically for this one page.

**No new illustration style for a single page.** The homepage already established the product's one ambient visual language — `AmbientBackground` (`features/home/components/AmbientBackground.tsx`, styled in `app/animations.css`): a faint dot grid plus a network of thin animated lines and nodes, fixed behind the content, `pointer-events-none`, `aria-hidden`. It is subtle, it is already shipped, and it is the app's single answer to "quiet technical texture in the background." A 404 page is exactly the kind of secondary page that should sit inside that existing language rather than add a second one. If the session concludes the page wants a graphic, look at reusing or lightly re-tuning `AmbientBackground` before proposing new vector art — a page about a broken path does not need its own bespoke diagram to make the point.

## Design system inventory — reuse, don't invent

Same dark-by-construction surface as the rest of the app (`app/global.css`, tokens in a plain `@theme` block). No light-mode variant needed.

- **`shared/Nav.tsx`** and **`shared/Footer.tsx`** — the page keeps the site's frame; a 404 is not a full-bleed takeover.
- **`shared/LogoMark.tsx`** — the brand mark already used as a quiet accent element elsewhere (e.g. inside an accent-ringed circle).
- **`AmbientBackground`** — see above. The homepage's only ambient graphic; the 404's likely visual anchor if the session wants one at all.
- **Accent triad** — `bg-ob-accent` / `border-accent-ring` / `bg-accent-soft`, the same "quiet accent circle" treatment used for `LogoMark` on the homepage and for done-state nodes elsewhere in the product.
- Mono eyebrow + heading pattern already established on the homepage hero (`font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted` eyebrow above a large `font-medium` heading) — the same vocabulary, not a new type scale for one page.

## What the page needs to do

1. **Say clearly that the link is dead**, without jargon or a stack trace. This is a real visitor, not a developer.
2. **Get them back into the product in one click.** The three top-level destinations — Docs, Playground, Rutas — are the honest set of places to send anyone, since the app has no search-first landing pattern outside the docs search dialog.
3. **Respect the locale.** Bare paths are Spanish, `/en/*` is English (`lib/i18n.ts`) — the page has to resolve which copy to show without assuming a lang param is always available (a truly unmatched top-level path may not carry one).
4. **Not overstay its welcome.** This is a redirect moment, not a content page — whatever the session designs, it should read in a glance, not require scrolling to find the way out.

## Physical constraints

- Full page (`Nav` + content + `Footer`), not a modal or inline card — this replaces the entire route.
- Needs to work with **no query context at all**: no challenge slug, no doc slug, no username — just "this didn't resolve."
- Mobile down to 375px, same as every other top-level page.

## Non-goals

- **No search box on the page itself.** The existing docs search dialog (`⌘K`) is already global and already in the nav; duplicating it here is redundant.
- **No error reporting / "report this link" flow.** Out of scope — this is a wayfinding page, not a support surface.
- **No per-section 404 variants** (a "no such challenge" page distinct from "no such doc"). One page, one design, used everywhere `notFound()` is called.

## Deliverable

A mock of the page at desktop and 375px, in the tokens above. If the session proposes keeping any illustration, show it reusing or clearly derived from `AmbientBackground`'s existing visual language, with the reasoning for that choice — not a new one designed from scratch.
