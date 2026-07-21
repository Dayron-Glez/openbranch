# Spec: Color System — Reality-Aligned Palette (Design Brief)

**Status:** Draft — ready for a design session
**Date:** 2026-07-20
**Owner:** @Dayron-Glez
**Design reference:** to be produced in a Claude Design session from this brief (same flow as `specs/engagement-ui.md` → mockups → per-surface implementation PRs)

## Context

openbranch reads as a **3-color** system — near-black backgrounds, off-white text, one green accent. It's clean and it's the brand. But it means **color carries only one axis of meaning**: everything active / earned / correct / selected is the same green, and everything else is muted or faint. Distinct things that deserve distinct signals — each unlocked badge, each of the 5 tracks, difficulty tiers — all collapse into that one green. This brief defines a deliberate way to introduce more color **without losing the consistency already achieved**.

### The reframe: it's not 3 colors, it's 1 active accent + 3 latent semantic tokens

`app/global.css` (lines 46–52) already defines four colors on a **shared OKLCH construction**:

| Token               | Value                 | Hue         | Role today                              |
| ------------------- | --------------------- | ----------- | --------------------------------------- |
| `--color-ob-accent` | `oklch(78% 0.18 148)` | green (148) | the only actively-used accent           |
| `--color-info`      | `oklch(78% 0.13 230)` | blue (230)  | defined, barely used                    |
| `--color-warn`      | `oklch(80% 0.14 75)`  | amber (75)  | defined, bypassed by ad-hoc `amber-400` |
| `--color-danger`    | `oklch(72% 0.18 25)`  | red (25)    | defined, bypassed by ad-hoc `red-400`   |

They all hold **L ≈ 78%, C ≈ 0.13–0.18, and vary only in hue.** The green is not arbitrary — it's one point on a deliberate ring. **This is the consistency guardrail, already encoded as a rule:** any new hue that obeys _hold L≈78%, hold C≈0.18, vary only the hue_ will read as a sibling of the green, native rather than bolted on. That single rule is the spine of this whole initiative.

The accent green is consumed through 4 derived tokens: `--color-ob-accent`, `--color-accent-soft` (same hue @ 0.15 alpha), `--color-accent-ring` (@ 0.35 alpha), `--color-accent-ink` (`#062612`, dark green for text-on-accent). Any new identity hue needs the same derived set.

## Goal

Give color a **second axis of meaning** — identity, alongside the existing state axis — so unlocked badges and tracks feel distinct and rewarding, while the black/white/green essence stays intact everywhere it currently defines the brand.

## Locked decisions (from the owner, 2026-07-20)

1. **Two layers ship: STATE + IDENTITY.** (A) Systematize the state color that already exists half-done (amber = in-progress, red = error) onto the `warn`/`danger`/`info` tokens; (B) introduce **new identity color** to badges and tracks.
2. **Identity spread = badges + tracks.** Each of the 5 tracks (`code-review`, `bug-fix`, `testing`, `git`, `documentation`) gets a **signature hue** that flows to its badge tile, its filter tab, its category pill, and its challenge-card. Leaderboard podium (gold/silver/bronze) is **out of scope** (deferred).
3. **Semantic color reaches docs; identity color does not.** Docs callouts/admonitions may use `info`/`warn`/`danger`. Identity (per-track) color is **playground-only** — docs have no tracks. The landing hero and global chrome/nav stay **strictly monochrome + green**.

## Non-goals

- Leaderboard podium coloring (deferred, not dropped).
- Any change to the light theme. The app is **dark-forced** (`app/[lang]/layout.tsx` hardcodes `.dark`; the `:root` light values in `global.css` are effectively dead). Design for dark; note light as future work only.
- A theme toggle / next-themes provider.
- Changing the green's role. Green stays **primary, brand, and "success/you-succeeded."** No new hue ever takes a primary action button or the completion/success meaning.

## Current token map (what a new palette must respect)

- **Backgrounds:** `bg` `#0b0c0e` · `bg-elev` `#111316` · `bg-card` `#14171b` · `bg-hover` `#181b20`.
- **Text:** `fg` `#eceef1` · `fg-2` `#b7bcc4` · `fg-muted` `#6f7681` · `fg-faint` `#3e444c`.
- **Lines:** `line` `#1f2328` · `line-2` `#2a2f36`.
- **Accent + semantic:** the OKLCH ring above.
- **Radius/shadow/motion:** `--r-6..16`, `--r-full`; `--sh-2..4`; `--ease`, `--d-fast/base/slow` — unchanged by this work.

All tokens live in Tailwind CSS 4 `@theme` in `app/global.css` (there is **no `tailwind.config.*`**). New tokens are added there and auto-generate utilities (`text-<name>`, `bg-<name>`, `border-<name>`).

## Layer A — STATE (systematize, don't invent)

Nothing new to design here — this layer **rationalizes what already exists**. Today, functional state is signaled with ad-hoc Tailwind-palette classes that bypass the tokens:

- **amber = in-progress / warning:** `ChallengeCard.tsx` status, `[slug]/page.tsx:122-140` status badge, `PlaygroundBreadcrumb.tsx`, testing/git toolbars — all `amber-400/500` instead of `--color-warn`.
- **red/rose = removed / error:** `DiffView.tsx`, `TestCard.tsx`, `git/GitFooterBar.tsx` — `red-300/400` / `rose-*` instead of `--color-danger`.
- **The big offender:** `git/ThreeWayMergeEditor.tsx` runs a self-contained IDE theme in `sky/amber/emerald/rose/zinc` — treat as its own contained sub-system; migrate only where it's cheap, don't force it.
- **Confetti** (`ConfettiEffect.tsx:15`) mixes greens + purple/blue/pink/amber hex — decorative, leave as-is (it's celebration noise, not semantic).

**The work:** migrate the semantic uses onto `--color-warn` / `--color-danger` / `--color-info`, and **extend the same tokens to docs callouts/admonitions** (Fumadocs admonition components). Design-session output needed here is light: confirm the three semantic tokens read correctly on `bg-card`/`bg-elev` at their soft/ring alphas, and specify the callout treatment for docs.

## Layer B — IDENTITY (new — the design session's real job)

Five per-track signature hues, placed on the **same OKLCH ring** (hold L≈78%, C≈0.18, vary hue), each with its own derived set (`-soft` @0.15, `-ring` @0.35, and an `-ink` for text-on-color).

**The single hardest constraint — call it out and solve it first:** track hues must **avoid the state hues** so a track never reads as a state. Occupied hues: green **148** (brand/success), amber **75** (in-progress), red **25** (error), blue **230** (info). Green is spoken for, so the 5 tracks occupy the remaining arc. A _starting sketch_ (exact values are the session's job): teal/cyan (~180–200, but far enough from info-blue 230), violet (~290), magenta/pink (~330), a distinct orange clearly separated from warn-amber, and one more — the session should place all 5 with even perceptual spacing and verify none collides with the four reserved hues.

**Where a track's hue flows** (all already keyed off `category`/`CategoryKey`, so it's data-driven, not per-component hardcoding):

- **Earned-badge tile** — `features/playground/components/BadgesSection.tsx:57-60`. The earned branch is a single seam: today `border-accent-ring bg-accent-soft text-ob-accent` (uniform green). It becomes the track's `-ring`/`-soft`/base trio. **The locked branch stays neutral** — so the _earn moment_ is where color blooms. This is the owner's original example.
- **Filter active tab** — `features/playground/components/FilterBar.tsx:142` (`data-[state=active]:text-ob-accent`).
- **Category pill** (challenge detail) — `app/[lang]/playground/[slug]/page.tsx:185` (`border-accent-ring bg-accent-soft text-ob-accent`).
- **Challenge-card icon tile** — `features/playground/components/ChallengeCard.tsx:73` (currently neutral `border-line bg-bg-elev text-fg-2`).

**Data home:** add a `colorToken` (or `hue`) field to `ChallengeTrackMeta` in `features/playground/domain/manifest.ts` (which already carries `category, iconName, badgeKey, slugPrefix`). One source of truth; components read the track's color the same way they already read its icon.

## Difficulty (Layer A-adjacent — a design question, not locked)

`shared/DiffBars.tsx` and the near-duplicate `DifficultyBars` in `ChallengeCard.tsx` paint every filled bar `bg-ob-accent` regardless of level. A green→amber→red ramp is the classic move — but **amber already means in-progress**, so a `demanding` challenge glowing amber could be misread. The session decides: keep difficulty neutral/monochrome, use a non-amber ramp, or accept the overlap with clear context. If it ships, consolidate the two duplicate renderers into `DiffBars`.

## Surface inventory — where color lives vs where monochrome stays strict

| Surface                                                     | Layer    | Treatment                                   |
| ----------------------------------------------------------- | -------- | ------------------------------------------- |
| Earned badges, category pills, filter tabs, challenge cards | Identity | per-track hue                               |
| Challenge-solving state (in-progress, error, removed lines) | State    | `warn`/`danger` tokens                      |
| Docs callouts/admonitions                                   | State    | `info`/`warn`/`danger` tokens               |
| Leaderboard                                                 | —        | stays green (podium deferred)               |
| **Landing hero, global nav/chrome, docs body text, search** | **none** | **strictly monochrome + green — untouched** |

## Guardrails

- **Green primacy.** Green keeps every primary-action button and every success/completion signal. New hues are identity/state only, never "the main thing to do."
- **The OKLCH rule is law.** Every new color: L≈78%, C≈0.18 (±small), vary only hue. No exceptions — this is what preserves consistency.
- **New token or nothing.** No more ad-hoc hex or Tailwind-palette classes for semantic/identity color — everything routes through `@theme` tokens in `global.css`. (Bonus: this reduces the duplicated-literal surface SonarCloud flags.)
- **A11y.** Every new hue at its base and `-ink` variants must clear contrast against `bg-card`/`bg-elev` and `fg` respectively. Verify on dark (the only live theme).
- **Motion unaffected.** No animation/reduced-motion implications.

## Open questions for the design session

1. The exact 5 track hues (even perceptual spacing; zero collision with green 148 / amber 75 / red 25 / blue 230).
2. Difficulty: neutral, non-amber ramp, or accept the amber overlap? (see above)
3. How saturated should identity color get in green-heavy components — does the hub filter bar go fully multi-hue on active tabs, or stay green-active with the hue only as a subtle accent?
4. Do earned-badge cards tint their _text/label_ too, or only the icon tile? (locked-branch stays neutral either way)
5. Leaderboard podium — confirm deferred; sketch only if time allows.

## Rollout (after the design session)

Per-surface implementation PRs, each with its own spec, mirroring the 3 engagement surfaces — likely: (1) tokens + `manifest` color field + badge tile; (2) category pill / filter / card; (3) state-token migration + docs callouts; (4) difficulty (if it ships). Each PR: every diff shown before commit; `types:check`/`lint`/`build` green; SonarCloud 0 new issues; and a grep confirming **no new ad-hoc hex/Tailwind-palette color outside `@theme`**.
