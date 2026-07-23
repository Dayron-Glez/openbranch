# Spec: Learning Paths — Connecting Docs and Playground

**Status:** Draft — ready for a design session
**Date:** 2026-07-23
**Owner:** @Dayron-Glez
**Roadmap:** module 2 of 4 (post-color-system), see project memory. Module 1 (gamification quick-wins, `specs/gamification-quickwins.md`) shipped in PR #149.

## Context

Docs and playground are two fully-built, fully-disconnected islands. Verified by grep across the whole repo: no doc mentions "playground," no playground code imports or links to `/docs/`, and no frontmatter field on either side references the other. The _only_ place the two domains already meet is the unified search dialog (`features/docs/components/SearchDialog.tsx`, backed by `app/api/playground-search/route.ts`), which returns mixed results for a query — but that's retrieval, not curation. A user who finishes reading "Branching strategies" has no prompt to go try `git-merge-conflict`, and a user who just struggled through that challenge is never pointed back at the guide that explains the concept they were missing.

This document is written to be handed to a design session (Claude Design) — it describes product intent, the content and data actually available, the existing design language, and one hard content-scale constraint the design needs to grapple with head-on. Visual exploration and the linear-vs-DAG structural question are the session's job; this is the brief, not the decision.

## Goal

Give a signed-in (or anonymous) visitor a guided sequence that alternates reading and doing — a curated path through 2-4 pieces of content around one theme (e.g. "Master Git workflows": a guide, then the challenge that puts it into practice) — with visible progress and a natural next step at the end of each piece.

## Content reality check — read before designing

This is thinner content than `specs/engagement-ui.md` or the color system worked with, and the mismatch matters for scope:

- **Docs**: 6 sections (`content/docs/*/`), each with exactly one `index` page plus **at most one** additional guide. Total: 6 non-index guides.
- **Playground**: 6 challenges across 5 tracks — every track has exactly 1 challenge except `bug-fix`, which has 2.
- **No structural link exists.** Neither MDX schema (`source.config.ts`) has a field connecting a doc to a track or a challenge to a guide. `recommended_first` on playground frontmatter is unrelated — it's a checklist-ordering hint, not a cross-domain link.
- **Docs sections and playground tracks don't line up 1:1.** `git` (docs) ↔ `git` (track) and `pull-requests` (docs) ↔ `code-review` (track) map cleanly. `testing` maps to `testing`. But the `documentation` track (challenge: write docs for a module) has no docs section that's actually about _writing_ docs — `contributing/ci-guardrails` is the closest and it's a stretch. And `bug-fix` has no docs-section counterpart at all today.

**Net effect: at current content depth, a real curated path is 2 steps** (one guide + one challenge) for the 2-3 tracks where the mapping is clean, and for the rest there's no honest guide to pair with the challenge yet. Two options, and the design session should pick one on purpose rather than default into it:

1. Ship a **small number of genuinely-curated 2-step paths** (the clean matches only — likely git and code-review, maybe testing) as a pattern-setting v1, matching the "ship what today's content supports" philosophy that kept module 1 scoped tight — and treat "not every track has a path yet" as an acceptable, visible gap rather than something to paper over.
2. **Pair this module with writing 1-2 new guides** (e.g. a short "how to fix a bug without breaking things" guide for the `bug-fix` track) so every track gets a path from day one — pushes scope from "connect existing content" into "write new content," which changes the estimate from M to closer to L.

Either is defensible; what's not defensible is designing a paths UI sized for 5-10 rich multi-step journeys when the content only supports 2-3 thin ones today. Flag this to the owner explicitly before visual design starts.

## Non-goals

- Doc-reading progress tracking. Confirmed by grep: no table, column, or server action anywhere persists "did this user read this guide." `lib/reading-time.ts` only _estimates_ reading time from word count — it doesn't observe actual reading. Building real read-tracking (scroll depth, time-on-page, or a manual "mark as read" affordance) is a real decision the design session needs to make, not an assumption to inherit — see open questions.
- A general-purpose course/curriculum builder. Paths are a curated, hand-authored sequence — not a system for arbitrary content graphs, tagging, or user-generated paths (that's closer to module 4's territory).
- Changing how badges, points, or streaks are computed — a path can _surface_ existing engagement data (e.g. "you've completed 3 of 4 steps") but does not introduce new scoring rules.
- Public path-completion badges or sharing — that's module 3's territory (profiles + shareable cards); this module can leave a hook for it, not build it.

## Data available

### Docs (Fumadocs)

Page tree comes from `lib/source.ts` (`fumadocs-core/source` `loader()`), sourced from `content/docs/` via the `docs` collection defined in `source.config.ts`. Frontmatter schema: fumadocs' base `pageSchema` (`title`, `description`, `icon`) extended with `maturity` and `authors`. Route: `/[lang]/docs/[[...slug]]`.

### Playground

`features/playground/domain/manifest.ts` — `CHALLENGE_TRACKS` (5 entries: `category`, `iconName`, `badgeKey`, `slugPrefix`, `colorToken`). Frontmatter schema (`source.config.ts`, `playground` collection) adds `category`, `difficulty`, `estimated_minutes`, `validation`, plus challenge-specific fields. Routes: `/[lang]/playground`, `/[lang]/playground/[slug]`, `/active`, `/active/result`.

### Progress signal available today

`challenge_sessions` (`user_id`, `challenge_slug`, `status: in_progress | completed`, `completed_at`) is the only durable per-user progress signal either domain has. There is nothing equivalent for docs. A path's progress bar can therefore only ever be as precise as "which challenge steps are completed" unless read-tracking is built — see non-goals and open questions.

## Surfaces to design

### 1. Path definition — where curated sequences live

Not yet decided whether this is data (a new `paths.ts` in `features/playground/domain/` or a shared `features/paths/` module, hand-authored array of `{slug, title, steps: [{type: "doc"|"challenge", ref: string}]}`) or content (new MDX collection under `content/paths/`, giving each path its own frontmatter + freeform intro copy). Content gives path authors a place to write an intro/motivation per path without touching TS; data is simpler and matches how `CHALLENGE_TRACKS` already works. Bring both to the design session as an open question, not a foregone conclusion — but note that either way, the source of truth is new: no existing structure can be reused unchanged.

### 2. Path page

A page that lists the path's steps in order, each step showing its content type (doc/challenge), an icon, a completed/current/locked state, and a "continue" CTA to whichever step is next. Likely route: `/[lang]/paths/[slug]`, sibling to `docs/` and `playground/` under `app/[lang]/`. `features/docs/components/SectionCards.tsx` (`Card`/`Cards` from `fumadocs-ui`, already used to list a section's child pages) is a directly reusable pattern for listing path steps.

### 3. Entry points

- From the playground hub (near `BadgesSection`/`StatsStrip`) and/or the docs sidebar (`features/docs/components/DocsSidebar.tsx`) — a small "part of a path" indicator or a paths index/hub page. Not yet decided whether paths get their own hub (`/[lang]/paths`) or surface only inline from docs/playground.
- **In-content**, at the bottom of a guide or a challenge's result page: "next in this path →" pointing at the following step. The result page (`RewardMoment.tsx`, already showing points/streak/badge) is a natural place to also surface "you finished step 2 of 3 in Master Git Workflows."

## Existing design language (reuse, don't reinvent)

Same visual system `specs/engagement-ui.md` and the color-system rollout established — nothing new to invent here:

- **Tone:** editorial-minimal, generous whitespace, no gamification kitsch. Dark-first with light support.
- **Typography:** mono uppercase eyebrows (`font-mono text-[11px] tracking-[0.08em] uppercase text-fg-muted`); large light headings with a `text-fg-2 font-light` accent span.
- **Track identity:** the 5 per-track hue tokens from `specs/color-tokens-badges.md` (`data-track` idiom, `--track`/`--track-soft`/`--track-ring`/`--track-ink`) are the obvious way to color-code a path's steps by which track they belong to, if paths end up track-aligned.
- **Reference components:** `SectionCards.tsx` (docs, step listing), `ChallengeCard.tsx` (state duality: locked/available/completed already solved for challenges), `BadgesSection.tsx` (earned/locked grid pattern), `RewardMoment.tsx` (completion celebration, extend rather than duplicate).
- **Motion:** GSAP page transitions; any new `<main>` under the playground or docs trees MUST carry `data-pg-main`. Respect `prefers-reduced-motion`.

## Implementation constraints (for the build that follows the design)

- Server components fetch via `lib/supabase/server` for anything needing session/progress data; path _definitions_ themselves can be static (no DB round-trip needed to render the structure).
- i18n: new strings need a new dictionary following the established `{ es: {...}, en: {...} } as const` shape — `lib/playground-dictionary.ts` and `lib/dictionaries/docs.ts` are the two existing examples to match, likely a new `lib/dictionaries/paths.ts` (or `lib/paths-dictionary.ts`, matching whichever naming the owner prefers between the two existing conventions — they're inconsistent with each other today).
- TypeScript strict, arrow functions with explicit return types; `useEffect` only for external-system sync.
- New feature code lives under `features/` (feature-first architecture, ESLint-guarded) — likely `features/paths/` as its own feature, given it spans both docs and playground rather than belonging to either.

## Acceptance criteria

- At least the content-scale decision (2-3 thin paths now vs. write new content first) is made explicitly by the owner before any UI ships — not defaulted into.
- A path page renders its steps in order with correct per-step state (locked/current/completed) for a signed-in user, and a sane degraded state for signed-out (no progress tracking, but the sequence itself is still readable).
- At least one entry point exists from playground and at least one from docs — a user can discover a path without already knowing the URL.
- Both locales, both themes, all breakpoints; no new SonarCloud issues.
- `types:check` / `lint` / `build` green.

## Open design questions

1. **Path definitions: data (`paths.ts`) or content (MDX collection)?** Affects how much freeform per-path copy is possible vs. how simple authoring stays.
2. **Linear or DAG?** Can a guide belong to more than one path? Does a path require completing steps in order, or can a user jump ahead?
3. **Is doc-reading progress tracked at all**, or does a path's "progress" only ever reflect the challenge steps within it (docs steps always render as available, never as completed)? Building real read-tracking is new DB/schema work, not a frontend-only decision.
4. **Which content-scale option (see "Content reality check")** — ship 2-3 thin paths now, or pair this module with writing 1-2 new guides so every track has one?
5. Do paths get their own hub page, or do they only ever surface inline from docs/playground?
