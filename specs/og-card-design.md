# Spec: the profile's shareable OG card — round 2

**Status:** Draft — round 1 landed and mostly holds, this round asks for more personality within it
**Date:** 2026-08-18
**Owner:** @Dayron-Glez
**Depends on:** `specs/public-profiles.md` (parent brief, issue #181). Round 1 of this brief and its result, `design_handoff_og_card/OG Card - u-username.html`, are the starting point here — read that file before this one. This round is a refinement, not a restart.

## What round 1 got right — keep all of it

Round 1 solved the two problems that actually mattered:

1. **The headline moved from points to a catalogue fraction** — "3 de 6 retos" instead of a bare point count. This is the right call and stays exactly as designed: self-explanatory to a stranger, a single composition that holds from 1 to 6 (and past it — the digit just steps down at two digits), and its ceiling ("6 de 6 · catálogo completo") is the strongest sentence this product can say today.
2. **The full Satori risk inventory (§06 of the handoff)** — zero `var()`, zero `mask-image`, one inlined SVG for the whole card, the designed initials fallback for a failed avatar fetch, the JS-side step-down rule for long usernames. This is exactly the translation this brief asked for and it does not need another pass.
3. **Rejecting badge icons (Q3)** — correct on both grounds given: illegible at thumbnail size, and each one is a separate inlined-SVG risk surface. Do not bring icons back.

None of the above is what this round is about. Say so explicitly if a proposal touches any of it, but the default is: unchanged.

## The actual ask this round

The card is correct and safe, and reads as flat. Every element on it is a number, a label, a chip, or a rounded rectangle — three neat horizontal rows of data. It solved for "won't break, won't lie about scale, won't look empty" and, in solving only for that, ended up with almost nothing on the canvas that isn't typography or a box. For something whose one job is to make a stranger want to click through from a chat timeline, that's a real gap, not a taste preference — a technically perfect card that nobody notices hasn't done its job either.

This round asks for **more visual character inside the same constraint set**, not a re-litigation of what's already settled.

## Three specific directions to explore — starting points, not a spec

These are the shapes of the gap as it looks from outside the design session, not prescriptions. Take them as material, replace any of them with something better if the reasoning holds.

1. **The brand mark is doing pure attribution duty in a corner.** At 46px, top-right, it's the one hand-drawn (non-typographic, non-rectangular) shape on the entire 1200×630 canvas, and its job today is just "sign the card." What happens if it's allowed to do more than sign it — larger, and part of the composition rather than a corner credit? (A watermark behind the headline digit is one version of this; it is not the only one worth trying.)
2. **The three rows are symmetric and self-contained**, each confined to its own horizontal band. That reads orderly, which is part of why it reads flat. Does the headline figure — already established in Q5 as the single loudest element on the card, "almost twice as tall as anything on the profile page" — actually need to stay inside its own row, or is there a version where it's allowed to overlap or dominate past its band?
3. **The six catalogue cells are identical in shape and size**, distinguished only by color and opacity (done vs. pending). That's legible but monotonous. Is there a low-risk way — no new icon, no new SVG — to give the _current_ / next-up cell a distinct treatment from a completed one and a pending one, so the strip reads as three states instead of two?

## Non-goals for this round

- No icons, no badge glyphs, no second SVG — Q3's reasoning still applies regardless of what changes elsewhere.
- No dot-grid texture, no `mask-image` — Q4's reasoning still applies.
- No change to the headline metric itself (still the catalogue fraction) or its three-tier rank-chip logic.
- No new data. Whatever the composition does, it's still built from what `getProfileOverview`/`getProfileRank`/`getProfileActivityAndBadges`/path progress already provide.
- No regression on the Satori risk table — any new visual idea gets checked against §06's categories (custom properties, implicit layout, `mask-image`, sprites, literal colors) before it's proposed, the same discipline round 1 already applied.

## Deliverable

A revised version of the populated and sparse cards at 1200×630, literal color values as before, explaining in prose what changed and why it still holds up at the ~360px chat-bubble thumbnail size (§02's own test is worth re-running against whatever this round produces). If a direction is tried and rejected, say so and why — round 1's own "what I tried and rejected" discipline is worth keeping.
