# Mini-spec: the 404 page — implementation

**Status:** Implementing
**Date:** 2026-08-17
**Owner:** @Dayron-Glez
**Parent:** `specs/not-found-page.md` (brief, PR #188) + the Claude Design handoff (`design_handoff_404/`).

## What the handoff got right

The direction holds up: reuse `Nav`, `Footer`, `AmbientBackground` and `LogoMark` as-shipped, no second illustration language. The one foreground graphic is the brand mark itself, lightly re-tuned — the branch stops short with a dashed, severed tail, and its accent endpoint breaks free and drifts. That reasoning survived contact with the real components unchanged.

## What building it against the real app changed

**1. A nested `[lang]/not-found.tsx` alone does not catch a genuinely unmatched URL.** This is a real Next.js App Router limitation, not something either the brief or the handoff accounted for: Next only renders a segment's `not-found.tsx` when `notFound()` is called from a page that matched. A URL that matches no page at all falls through to the root `app/not-found.tsx` if one exists, or the framework default otherwise — outside the `[lang]` tree, with no locale context. Confirmed against Next's own documented behavior before writing any page code, not assumed.

Fixed with `app/[lang]/[...slug]/page.tsx` — a catch-all that does nothing but call `notFound()`. Next always resolves a more specific route first, so it never shadows a real page; it only fires for a path that matches nothing, and because it still lives inside `[lang]`, the nested `not-found.tsx` renders with locale intact. Without this file, the second half of the brief's own acceptance criteria — "and for any unmatched top-level path" — would have stayed unmet.

**2. `params` can arrive without a `lang`.** `next build` invokes this file's shared not-found boundary at least once during static generation without a resolved params object — confirmed directly: the first build crashed with `Cannot destructure property 'lang' of undefined` on an unrelated docs page, because `not-found.tsx` was rendered somewhere in that pass with no params at all. `params` is now optional and `lang` falls back to `"es"` the same way every other dict lookup here already treats an unrecognized locale — not a special case, just the existing fallback pattern applying one layer earlier.

**3. The dead-path readout row is dropped.** The mock's `.nf-path` line echoes the URL that failed to resolve. Next's Server Components have no clean way to read the original request path from inside `not-found.tsx` — the only path to it is a header injected by `proxy.ts` and read back out, and that file already juggles Supabase session refresh, docs content negotiation, and the i18n rewrite. Adding a fourth concern to already-dense middleware for a decorative, non-essential row isn't a good trade, and the handoff's own README pre-authorized dropping it: "Optional — drop it if the route can't cheaply surface the attempted path." Dropped, not built with a fake placeholder path.

**4. `Nav`'s primary CTA stays exactly as shipped.** The handoff's inline mock recreates its own simplified nav, and that recreation's CTA reads "Ir al inicio" (→ home). The real `shared/Nav.tsx` hardcodes its CTA to `dict.getStarted` (→ Docs) with no prop to override it per page. The handoff's own overview line — "the real `Nav`, unchanged" — is the instruction that actually matters here; special-casing a shared, already-used-everywhere component's copy and destination for one page would cost more than it's worth, especially since the page's own "Volver al inicio" link already gets a visitor home in one click without touching `Nav` at all.

## Reuse, made real

- **`LogoMark` gained a `broken` prop** rather than a second hand-drawn SVG. Same trunk, same node positions; only the branch path is shortened and the accent node's position and animation change. One geometry, defined once — if the mark ever changes, both variants change together. The drift animation (`ob-loose-drift`) and its `prefers-reduced-motion` guard live in `app/animations.css` next to the mark's existing `logo-play` keyframes.
- **`AmbientBackground` is untouched as a component.** Only its shared CSS gained two custom properties (`--ambient-dots-mask-y`, `--ambient-graph-mask-y`), defaulting to the exact values the home page already uses. The 404 page wraps it in a `.notfound-ambient` class that overrides just those two properties, matching the handoff's "recentered slightly, nothing else changes." The home page's rendering is provably identical — its markup never touches the new class.
- **`lib/dictionaries/not-found.ts`** follows the flat `{ es, en }` + `tx()` shape (`playground-dictionary.ts`, `dictionaries/profile.ts`) rather than side-by-side locale objects, for the same reason the profile dictionary was rewritten mid-session: with two locales sharing identical keys, the side-by-side form is duplicated lines by construction.

## Files

- `app/[lang]/not-found.tsx` — replaces the uncommitted draft entirely.
- `app/[lang]/[...slug]/page.tsx` — new, the routing fix from finding 1.
- `shared/LogoMark.tsx` — `broken` prop.
- `app/animations.css` — `.n-loose` drift keyframes + reduced-motion guard; `--ambient-dots-mask-y` / `--ambient-graph-mask-y` custom properties.
- `lib/dictionaries/not-found.ts` — new.
- `icons/index.tsx` — added `IconArrowLeft` (the only new icon; the dead-path row's warning icon was never needed once that row was dropped).

## Verification

- `types:check` / `lint` / `build` green. Build output: `/[lang]/[...slug]` renders `ƒ` (must stay request-time — it exists purely to catch arbitrary paths); `/[lang]/docs/[[...slug]]` still `●`, unaffected.
- Manual: a known bad path under a real section (e.g. `/docs/does-not-exist`), a fully unmatched top-level path (e.g. `/whatever-this-is`), and `/en/*` equivalents of both — all should render this page, not Next's bare default.
- Both locales, 375px and desktop — the exit (destinations + back link) should read without scrolling.
- `prefers-reduced-motion`: the anchor's loose node should sit still, not drift; the ambient background should already be static per its existing guard.
- The home page (`/` and `/en`) should look and animate exactly as before — the ambient mask-position change is opt-in via `.notfound-ambient`, not a change to the shared default.
