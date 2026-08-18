# Mini-spec: badge unlock animations

**Status:** Implementing
**Date:** 2026-08-18
**Owner:** @Dayron-Glez
**Parent:** issue #199. Source: Claude Design project "Animaciones de badges OpenBranch" (`Badges Unlock.dc.html` + `animations-v3.jsx` + `badges-video.jsx` + `support.js`).

## What the source actually is, and what's portable

`Badges Unlock.dc.html` is a scripted 1920×1080 **video composition** for Claude Design's internal renderer (`dc-runtime`, shipped as `support.js` — "GENERATED from dc-runtime/src/\*.ts", not a library that exists outside that tool). `animations-v3.jsx` is that renderer's animation engine: one authored timeline (`T`), named "cues" derived from a scene list, a `useComposition()` hook, `<CompositionStage>`, `<Captions>` — none of it importable into a Next.js app. The composition itself walks all 7 badges in a fixed order with camera pans and narrated captions, which is a video's structure, not a live-product interaction.

**What's genuinely portable, and the reason this is worth doing**: the seven per-badge icon choreographies in `badges-video.jsx` (`MergeIcon`, `PrIcon`, `FlaskIcon`, `RocketIcon`, `BookIcon`, `FlameIcon`, `AwardIcon`) are plain React components driven by a single `t` (seconds since the icon's animation started). The three motion primitives underneath them (`clamp`, `animate`, `Easing.{easeOutCubic,easeInOutQuart,easeOutBack}`) are self-contained Penner-style formulas — copied here verbatim in `badge-motion.ts`, not imported from anywhere:

```ts
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const animate =
  ({ from, to, start, end, ease }) =>
  (t) => {
    if (t <= start) return from
    if (t >= end) return to
    return from + (to - from) * ease((t - start) / (end - start))
  }
// easeOutCubic: t => (--t)*t*t + 1
// easeInOutQuart: t => t<0.5 ? 8*t**4 : 1 - 8*(--t)**4
// easeOutBack: t => 1 + c3*(t-1)**3 + c1*(t-1)**2, c1=1.70158, c3=c1+1
```

So the icon components themselves port almost verbatim — the only real rewrite is _what drives `t`_ (a video's global authored clock, replaced with a GSAP-driven progress value per trigger) and _where colors come from_ (see below).

## Colors: `var(--track)`, not the mock's inline `oklch()`

`badges-video.jsx` hardcodes `track(hue) => oklch(78% 0.18 ${hue})` because it's a standalone file with no access to the app's CSS — same reason the OG card had to hardcode literals for Satori. This isn't Satori: it's a real browser, and `app/global.css` already defines exactly these tokens as `--track`/`--track-soft`/`--track-ring` under `[data-track="git"|"review"|"test"|"bugfix"|"docs"]`, which `BadgesSection.tsx`'s tiles already set via `data-track={track?.colorToken}`. The icons read `var(--track)` etc. instead of computing their own color — one fewer thing to keep in sync with the design system, and dark-mode-proof automatically (the site is dark-only anyway). `streak-7` and `all-tracks` have no `TRACK_BY_BADGE_KEY` entry (confirmed against `BadgesSection.tsx`'s `hasTrack` branch) — they use the existing `--color-ob-accent`/`accent-soft`/`accent-ring` tokens, matching how their tiles already render today.

## The real gap: only 5 of 7 badges are currently detectable as "just earned"

`reward-service.ts`'s `CompletionReward.badgeNewlyEarned` is a **boolean**, and only covers the 5 _track_ badges — it re-derives the DB trigger's own award condition (`count === 1` on completed sessions matching the track's slug prefix) read-only, same pattern as the rest of that service. Milestone badges (`streak-7`, `all-tracks`) are awarded by a separate DB-side path (`20260723000000_gamification_quickwins.sql`) that the result page has no visibility into at all today — a completion that happens to cross either threshold currently shows _no_ badge card, new or otherwise.

**Fix**: replace the boolean with `newlyEarnedBadgeKey: BadgeKey | null` on `CompletionReward`, resolving all 7 keys the same read-only way:

- Track badges: unchanged logic (`count === 1` after this completion), now returning the key instead of a bool.
- `streak-7`: `current_streak === 7` on `user_stats` _and_ this is the first completion of the day (mirrors the trigger's own "streak just reached 7" condition — re-derive, don't duplicate the increment logic).
- `all-tracks`: after this completion, every one of the 5 `CHALLENGE_TRACKS` has at least one completed session, and before this completion at least one didn't (a single read of `challenge_sessions` grouped by inferred category, compared against the pre-completion set inferred by excluding the current slug).

Only one badge can plausibly become newly-earned per completion in practice (a single challenge finish), so `BadgeKey | null` — not an array — matches reality and keeps the result-page integration a single conditional, not a list.

## Where the animation plays

**`RewardMoment`** (result page) — when `newlyEarnedBadgeKey !== null`, the existing static badge card (today: `BadgeStarIcon` + a "New" tag) is replaced by the real animated icon for that key, running its unlock choreography once, plus a shimmer sweep across the card (new — not in the mock, added per the owner's ask). This is the one genuine "reveal" moment; nothing else on the page re-triggers it.

**`BadgesSection`** (playground hub + public profile — same component, already shared) — every _earned_ tile replays its badge's icon choreography on hover, no shimmer (hover is "look at this again," not a re-celebration). This needs no "newly earned" state at all — it fires from `onMouseEnter` regardless of when the badge was actually earned, which is both simpler and matches what was asked ("cuando se haga hover sobre cada badge desbloqueada," not "sobre el que acabo de ganar"). Locked tiles are unaffected — hovering a lock still shows nothing.

Deliberately **not** building: a "just earned, so animate on the very next hub/profile visit" cross-navigation flag. That would need session/localStorage state tracking "have I already seen this badge's unlock," and the result page already owns that exact moment cleanly — adding a second, later echo of it isn't something the owner asked for and risks a stale flag someone sees days later.

## Architecture

- `features/playground/domain/badge-motion.ts` — `clamp`, `animate`, `Easing` (the 3 curves actually used), `dash()` (the `strokeDasharray`/`strokeDashoffset` helper). Pure functions, no React, no GSAP — ported verbatim from `animations-v3.jsx`'s math.
- `features/playground/components/badges/icons/` — one file per badge (`MergeIcon.tsx`, `PrIcon.tsx`, `FlaskIcon.tsx`, `RocketIcon.tsx`, `BookIcon.tsx`, `FlameIcon.tsx`, `AwardIcon.tsx`), each taking `{ t: number }` (plus `hue`/`ck` where the mock's version needs them, dropped in favor of `currentColor`/`var(--track)` since color now comes from the CSS cascade, not a prop) — ported near-verbatim from `badges-video.jsx`, adapted to `var(--track)` per above.
- `features/playground/components/badges/BadgeUnlockIcon.tsx` — the piece both integration points share: picks the right icon component for a `BadgeKey`, drives `t` via `gsap.to({ t: 0 }, { t: DURATION, duration: DURATION, ease: "none", onUpdate })`, exposes a `replay()` handle. `DURATION` is each icon's own natural settle point (the mock's last `pop`/`draw` end time — e.g. `MergeIcon` settles at 1.35s), not the mock's full idling-loop length, since a product reveal fires once and holds, it doesn't loop like the video does.
- `features/playground/components/badges/BadgeShimmer.tsx` — the sweep effect, new for this build (not in the mock): a `linear-gradient` band animated across the tile once via GSAP, `mix-blend-mode: overlay` or similar so it reads as a gloss pass rather than a flat wash.
- `gsap.matchMedia()` guard on every trigger point, following `PlaygroundTransition.tsx`'s exact established pattern (`"(prefers-reduced-motion: no-preference)"`) — reduced motion shows the finished earned state directly, no draw-on, no shimmer, no hover-replay motion.

## Verification

- `types:check` / `lint` / `build` green.
- Complete a challenge that awards each of the 5 track badges (or as many as the owner's account allows resetting) and confirm the result page shows that badge's real animation + shimmer, not the old static star icon.
- Confirm a repeat completion (`isFirstCompletion === false`) shows no badge reveal, same as today.
- Hover every earned tile in the hub and in a public profile — same component, so this should be one implementation, not two.
- `prefers-reduced-motion`: reduced-motion emulation in devtools, confirm tiles/cards render their end-state with no animation firing anywhere.
- No `aria-hidden` regressions — badge status is still conveyed by the existing text label, motion is decorative only.
