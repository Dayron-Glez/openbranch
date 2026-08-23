# Mini-spec: public profiles — the page

**Status:** Implementing — PR 2 of 4
**Date:** 2026-08-16
**Owner:** @Dayron-Glez
**Parent:** `specs/public-profiles.md` + the Claude Design handoff. Builds on `specs/public-profiles-data-surface.md` (PR 1).

## The direction

A profile is the **durable, third-person** version of what `RewardMoment` gives the user once, in the moment. Same palette, same icons, lower volume: no animation, no count-up, no second person. Celebration becomes constancy — the same move `PathCard` made one level down, where saturated progress became a collapsed trophy.

**One template, two densities.** Section order is fixed — identity → summary → badges → paths → activity — so a sparse profile never reorders to hide what it lacks. It shows the same containers with deliberate states: a rank that goes quiet, a dashed empty state for paths, a feed that fits in one row. A profile with almost nothing on it still has to look intentional.

## What "reuse" actually cost

The handoff lists `StatsStrip`, `BadgesSection` and `PathCard` as reuse. All three are reused — but three of them needed a change first, and none of those changes were in the handoff.

**The copy was second-person.** Not in the components, which are clean, but in the dictionary they read from: `stats.eyebrow` is "Tu progreso", `stats.streakAlive` is "Viva — completaste uno hoy", `stats.bestNote` is "Récord personal", `badges.lockMessage` is "Completa retos para desbloquear badges". Every one of those is addressed to the person who earned the numbers. On a page about someone else they are wrong, and a stranger reading them is the entire failure mode. So `lib/dictionaries/profile.ts` carries its own `stats` block in the same shape, third person throughout, and `StatsStrip` takes it unchanged.

**Two `StatsStrip` fields are viewer-centric and are deliberately blanked**, not sourced:

- `pointsToday` — "+40 today" is a fact about your own session. On a stranger's page, read a week later, it answers a question nobody asked. Passed as `0`, so the badge never renders.
- `nextTrack` — renders "next up: {track}", a nudge aimed at whoever is looking. A new optional `completedSub` prop replaces that line instead, turning the cell's sub-text from a prompt into a record of the tracks they finished in. Omitted everywhere else, so the hub keeps its nudge.

`streakState` is derived rather than stored: the database already zeroes `current_streak` once the last completion falls outside today-or-yesterday, so a positive streak is a live one.

**`BadgesSection` gained two optional props**, both defaulting to current behaviour: `showLockMessage` (the profile suppresses it rather than telling a stranger to go work on someone else's collection) and `headingNote` for the "5/7" count. `TOTAL_BADGE_COUNT` is exported derived from the key list, not written as a literal, so adding a badge cannot desynchronise the caption.

**`IconTrophy` did not exist** in the `@/icons` barrel — the rank chip's glyph. Added from Tabler.

**`formatRelativeDate` moved.** It lived in `lib/section-stats.ts`, a docs-stats module, with its two special-case literals hardcoded inline. A second caller made both facts wrong, so the bucketing moved to `lib/relative-date.ts` taking its labels from the caller. `section-stats.ts` keeps its entry point and passes the same literals, so the docs cards are untouched.

## Rank: three tiers

Ranked positions stop being useful fast. `#412 of 1,240` reads as _last in the class_ — the opposite of what someone still building a record needs.

| Condition                                       | Shows                                      |
| ----------------------------------------------- | ------------------------------------------ |
| In the top 100                                  | `#7`, accent chip with the trophy          |
| Ranked, below 100                               | `Top 15%`, same chip                       |
| No completions (`profile_rank` returns no rows) | Quiet chip, "Empezando" — no number at all |

The third tier reads the _absence of a row_, which is why PR 1's function returns none rather than a sentinel. The "see on the leaderboard" link is also suppressed there — it only makes sense once they are on it.

## The deliberate deviation from the mock

**The mock composes for a catalogue this repo does not have.** It shows "34 de 48" challenges and 1240 points. The repo has **six challenges** and a ceiling near 110 points — and the owner has completed all six, so the one real populated profile today reads **"6 de 6"**.

That is not a smaller version of the same state. "34 of 48" says _progress_; "6 of 6" says _finished the entire product_, and a sub-line nudging toward what is next would be actively wrong. So the completed cell's sub-line has three branches: nothing completed, some completed (the tracks they worked in), and **everything completed** — which says so outright.

The mock never had to design this because at eight times the catalogue size it cannot happen. At the real size it is the default case.

## Files

- `app/[lang]/u/[username]/{layout,page}.tsx` — dynamic route, no `generateStaticParams`. The layout copies `/paths`' shell; the user it reads is the _viewer_, only for the nav avatar. The page reads someone else's record entirely through PR 1's public views and **works signed out**, which is the main case here, not an edge.
- `lib/dictionaries/profile.ts`, `lib/relative-date.ts`
- `features/profiles/components/` — `ProfileHeader`, `RankChip`, `CompletedPaths`, `ActivityFeed`, plus `SectionLabel` and `EmptySection` shared between the two new sections.

`CompletedPaths` special-cases nothing: cards get a progress object where every step is done, and `PathCard` already knows to draw the collapsed two-node stepper.

## Verification

- `types:check` / `lint` / `build` green; `/[lang]/u/[username]` renders `ƒ`, and `/[lang]/docs/[[...slug]]` still `●`.
- Signed out, both locales, 375px and desktop.
- The sparse profile: every section shows its deliberate state rather than a gap.

## Not in this PR

Leaderboard row links and the nav entry are PR 3. The OG card is PR 4 — `generateMetadata` here sets title and description only, and gains `openGraph.images` then.
