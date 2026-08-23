# Mini-spec: public profiles — links and nav entry

**Status:** Implementing — PR 3 of 4
**Date:** 2026-08-17
**Owner:** @Dayron-Glez
**Parent:** `specs/public-profiles.md`. Builds on PR 1 (`specs/public-profiles-data-surface.md`) and PR 2 (`specs/public-profiles-page.md`).

## Scope correction from the issue

The issue this PR closes said a profile entry in "`PlaygroundNav`, `MobileNav`, and `Nav`" would be "close to free" because `username`/`avatar_url` are already loaded wherever those render. That is true for `PlaygroundNav`/`MobileNav` — both already take `avatarUrl`/`username` props, fed by `/playground` and `/paths`' layouts, which already call `auth.getUser()`.

It is **not** true for `shared/Nav.tsx`, the nav used by docs and the home page. `app/[lang]/layout.tsx` — the layout above both — makes no Supabase call at all, which is deliberate: it is what keeps `/[lang]/docs/[[...slug]]` statically generated (`●`). Adding a profile link there would mean an auth lookup somewhere in that chain, which either breaks the static invariant or means a client-side fetch pattern like `doc_reads`' read-tracking island (`specs/learning-paths.md`'s post-phase-2 work) — real new scope, not a free addition.

**Decided: the nav entry lands in `PlaygroundNav`/`MobileNav` only** — the surfaces that already know who's signed in. `shared/Nav.tsx` is untouched.

## What ships

**Leaderboard rows link to profiles.** `LeaderboardTable`'s `BuilderCell` — the avatar + username — becomes a `Link` to `/[lang]/u/[username]`. Only that cell, not the whole `<TableRow>` (an anchor wrapping a table row is invalid HTML, and every other cell — points, completed, streak — has no reason to navigate anywhere). `LeaderboardTable` gains a `lang: string` prop to build the href; the leaderboard page already has `lang` in scope, just wasn't threading it down.

**A profile link in the two navs that already show identity.** Both `PlaygroundNav` and `MobileNav` already render the signed-in user's avatar — today purely decorative, an `<img>` with no affordance. It becomes a link to that user's own profile:

- `PlaygroundNav`: the avatar `<img>` wraps in a `Link`, matching the Discord/GitHub icon buttons' existing `Tooltip` treatment in the same component ("Tu perfil" / "Your profile").
- `MobileNav`: the identity block (avatar + username row) wraps in a `Link`, closing the sheet on click — the same pattern every other link in that sheet already uses.

Both only render when `username !== null`, which is already the guard the avatar itself uses.

## Not in this PR

`shared/Nav.tsx` / docs / home — no profile link, for the static-rendering reason above. The OG card is PR 4.

## Verification

- `types:check` / `lint` / `build` green; `/[lang]/docs/[[...slug]]` still `●` — confirms the scope cut actually held.
- Signed in, both locales: leaderboard row → own profile; nav avatar → own profile; mobile sheet identity row → own profile, sheet closes.
- Signed out: no avatar anywhere, nothing new to click, no broken link rendered.
