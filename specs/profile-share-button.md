# Mini-spec: share profile button

**Status:** Implementing
**Date:** 2026-08-18
**Owner:** @Dayron-Glez
**Parent:** issue #197, filed as a follow-up once #196 (the OG card) shipped — the profile page had a working `og:image`, but nothing in the UI pointed at it. This closes that gap.

## Decisions (asked, not assumed)

- **Any profile, not just the viewer's own.** No owner-check against the signed-in session — the button renders on every `/u/[username]` visit, same as GitHub's own profile share icon. Simpler (no need to know who's looking) and it also covers "share someone else's cool profile."
- **URL + pre-written text, not a bare link.** The clipboard/share payload is a sentence plus the URL, not just the URL alone — gives the receiving chat context without the recipient having to click through first.

## Copy is third person, matching the page itself

The profile page's own copy was rewritten to third person in PR #186 specifically because a stranger reads it, not the profile's owner — "Tu progreso" became "En openbranch desde…" (see [[public-profiles]]). The share text has the exact same audience problem, made sharper: since the button now renders on _any_ profile, first person ("Mira mi progreso…") would be actively wrong whenever someone shares a profile that isn't their own. So the share sentence stays third person regardless of who clicks:

- `es`: `El progreso de {username} en openbranch`
- `en`: `{username}'s progress on openbranch`

The URL is appended after a space for the clipboard path; passed as a separate `url` field to `navigator.share`.

## Component

`features/profiles/components/ShareProfileButton.tsx` — a client component (`"use client"`), icon-only, square, matching the tooltip-icon-button pattern already in `CopyTemplate.tsx` and `PlaygroundNav.tsx` rather than inventing a new one.

- Feature-detection happens **inside the click handler**, not at render time — `navigator` isn't available during SSR, and branching in the handler means the server and client render the exact same markup (no hydration mismatch to guard against, no `useEffect` needed just to detect a capability).
- Click: build the absolute URL (`SITE_URL` from `lib/constants.ts` + `localizedHref(lang, /u/${username})`) and the share text. If `navigator.share` exists, call it with `{ title: dict.metaTitle(username), text, url }` and swallow a rejection silently — the only realistic rejection is the user closing the native share sheet, which isn't an error. Otherwise fall back to `navigator.clipboard.writeText(`${text} ${url}`)` and flip to a 2-second "copied" state, the same `IconCheck` swap + `setTimeout` shape `CopyTemplate.tsx` already uses.
- No loading/error UI beyond that — both code paths are synchronous from the user's point of view (native sheet or instant clipboard write).

## Placement

`ProfileHeader.tsx`'s header row is `Avatar | identity block (flex-1) | RankChip`. The button becomes a new flex item to the left of `RankChip`, both wrapped in a `flex items-center gap-2` group — keeps the header's three-part shape (identity anchored left, status anchored right) and reads as "the actions living next to the person's standing," not a fourth competing block.

## Icon

`IconShare` isn't in the barrel (`icons/index.tsx`) yet — adding `IconShare` from `@tabler/icons-react`, following the file's existing re-export convention.

## Dictionary

New keys on `ProfileDict` (`lib/dictionaries/profile.ts`), same flat `{es,en}` + `tx()` shape as the rest of the file:

- `shareLabel` — tooltip/aria-label before copying: "Compartir perfil" / "Share profile"
- `shareCopied` — tooltip label for the 2s post-copy state: "Copiado" / "Copied"
- `shareText(username)` — the third-person sentence above

## Verification

- `types:check` / `lint` / `build` green.
- Manual: click the button in a desktop browser (no `navigator.share`) — confirm the clipboard receives `"<sentence> <url>"` and the tooltip flips to "Copiado" for 2s, both locales.
- `resize_window` to mobile width and confirm the button still renders correctly (native share sheet itself can't be exercised from an automated browser, but the code path is a straight feature-detect branch — worth a quick manual phone check by the owner if convenient, not blocking).
- Confirm `docs/[[...slug]]` build output is unaffected (this button lives entirely under `/u/[username]`, already dynamic — no risk to the static docs route, but worth a glance at the build's route table anyway).
