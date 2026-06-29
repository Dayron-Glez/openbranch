# Refactoring Roadmap — openbranch

> Status: Draft · Companion to [`01-assessment-report.md`](01-assessment-report.md).
> **Planning only.** No code is changed by this document. Prefer incremental, non-breaking migrations.

This roadmap sequences the work from [§6 debt register](01-assessment-report.md#6-technical-debt-register-prioritized-by-impact)
into phases that each ship independently and leave `main` green (`types:check`, `lint`, build).

Guiding rules for execution:

- One phase = one (or a few small) PRs. Never a single "big bang" PR.
- Keep public route URLs and the Supabase schema **unchanged** unless a phase explicitly targets them.
- Lean on TS path aliases + re-export shims so moves don't force mass import rewrites in one PR.
- Every phase ends with `bun run types:check && bun run lint` passing and the app building.

---

## Target architecture (north star)

Feature-first, dependency direction strictly inward (`app → features → shared → ui`):

```
src/                                  # (or keep root; key point is feature-first grouping)
├── app/                              # routing, RSC pages, route handlers ONLY (thin)
├── features/
│   ├── playground/
│   │   ├── domain/                   # contracts: snapshots, templates, DiffFile, manifest types
│   │   ├── challenges/               # one folder per track: manifest + template + view
│   │   │   ├── code-review/
│   │   │   ├── bug-fix/
│   │   │   ├── testing/
│   │   │   ├── git/
│   │   │   └── documentation/
│   │   ├── registry/                 # generic createChallengeRegistry + aggregate manifest
│   │   ├── server/                   # session service, badge policy, server actions (thin)
│   │   ├── components/               # ChallengeLayout, ChallengeCard, BadgesSection, FilterBar...
│   │   └── hooks/                    # useChallengeSubmit, track editors/runners
│   ├── docs/
│   └── home/
├── shared/                           # business-agnostic: Logo, ScrollReveal, i18n provider, Footer
├── components/ui/                    # shadcn/ui primitives (unchanged location)
├── lib/                              # truly cross-cutting infra: supabase, source, utils, i18n
└── icons/
```

The single most valuable artifact is the **challenge-track manifest**: one record per track that
names its `category`, `icon`, `badge`, `slugPrefix`, `registry`, and `view`. Page maps, badge
policy, routing dispatch, and the registry all _derive_ from it instead of re-declaring it.

```ts
// features/playground/domain/manifest.ts  (illustrative — not to be committed yet)
export type ChallengeTrack = {
  readonly category: CategoryKey
  readonly slugPrefix: string // "git-", "docs-", ...
  readonly badge: BadgeKey
  readonly icon: IconKey
  readonly snapshot: "review" | "bugfix" | "testing" | "git" | "docs"
}
export const CHALLENGE_TRACKS: Record<CategoryKey, ChallengeTrack> = {
  /* one place */
}
```

---

## Phase 0 — Guardrails & quick wins (no structural moves)

- **Objective:** Remove cheap inconsistencies and establish a dependency-direction lint rule so
  later phases can't regress.
- **Scope:**
  - Fix `components.json`: `iconLibrary` → reflect Tabler reality (or document the divergence);
    remove/repoint the dead `"hooks": "@/hooks"` alias (D9).
  - Remove unawarded badge keys or wire them up; document the badge set (D10).
  - Add an ESLint `no-restricted-imports`/`import/no-restricted-paths` rule forbidding
    `lib/** → components/**` (locks the §4.5 fix in place going forward).
- **Dependencies:** none.
- **Expected impact:** Cleaner tooling, guardrail against regressions. Zero behavior change.
- **Complexity:** XS.
- **Risks:** Lint rule may flag the _existing_ `DiffFile` inversion immediately — acceptable; fix
  lands in Phase 2, so scope the rule as a warning until then, or land Phase 2 first.

## Phase 1 — Define the contracts (`domain/`) layer

- **Objective:** Give the Playground a single, discoverable contracts surface; stop types living
  inside components.
- **Scope:**
  - Create `features/playground/domain/` (or `lib/playground/domain/` if staying root-first).
  - Move `DiffFile` out of `components/playground/DiffViewer.tsx` into `domain/diff.ts`; the
    component imports it back (D5/D6). Update `diff-registry.ts` + `diffs/*` to import from domain.
  - Consolidate snapshot DTOs (`review-types.ts`), docs contracts (`docs-types.ts`), and the
    per-track `types.ts` (git/testing) under `domain/`, re-exporting from old paths via shims to
    avoid a mass import churn.
  - Extract the shared file shape (`DocsFile` ≈ `BugFixTemplateFile`) into one `TemplateFile` type.
- **Dependencies:** Phase 0 lint rule (optional but recommended).
- **Expected impact:** Dependency inversion removed; contracts discoverable; foundation for the
  manifest.
- **Complexity:** S–M.
- **Risks:** Import churn — mitigate with re-export shims and a single `tsc --noEmit` gate.

## Phase 2 — The challenge-track manifest (single source of truth)

- **Objective:** Collapse the category/icon/badge/slug-prefix duplication (D4) into one record.
- **Scope:**
  - Create `domain/manifest.ts` (`CHALLENGE_TRACKS`) — the only place category↔icon↔badge↔prefix
    is declared.
  - Refactor consumers to derive from it: `playground/page.tsx` (`CATEGORY_ORDER`, `CATEGORY_ICONS`,
    `inferCategoryBadge`), `playground/[slug]/page.tsx` (`CHALLENGE_ICONS`),
    `lib/playground/challenge-icons.tsx`, `BadgesSection.tsx` (`BADGE_KEYS`/`BADGE_ICONS`).
- **Dependencies:** Phase 1 (domain layer + icon keys).
- **Expected impact:** Adding a category/badge becomes a one-line manifest edit. Eliminates drift.
- **Complexity:** M.
- **Risks:** Behavioral parity — snapshot the rendered hub/detail/badges before & after; pure
  refactor, URLs unchanged.

## Phase 3 — Generic registry

- **Objective:** Replace the five registry files (D2) with one generic factory + per-track data.
- **Scope:**
  - `registry/createChallengeRegistry.ts` → `<T>(map) => (slug) => T | null`.
  - Each track exposes its own small `registry` entry; an aggregate registry resolves a slug to
    `{ track, template }` using the manifest's `slugPrefix`.
  - Delete `sandpack-/testing-/git-/docs-/diff-registry.ts` once callers migrate.
- **Dependencies:** Phase 1–2.
- **Expected impact:** New track registry = a manifest entry + a template module. No new plumbing.
- **Complexity:** S–M.
- **Risks:** `active/page.tsx` dispatch must keep type narrowing per track — preserve discriminated
  unions on snapshot type.

## Phase 4 — Server-action / badge service consolidation

- **Objective:** Remove the five duplicated `complete*`/`save*` blocks and the five-times-repeated
  badge policy (D3, D11).
- **Scope:**
  - `server/session-service.ts`: `getUserOrNull`, `saveSnapshot(slug, snapshot)`,
    `completeSession(slug, lang)` — single implementations.
  - `server/badge-policy.ts`: derives the badge to award from the manifest (`slugPrefix → badge`),
    replacing five hand-written award blocks.
  - `app/actions/playground.ts` becomes a thin `"use server"` facade delegating to the service
    (kept at the same path so the `"use server"` boundary and imports are stable).
- **Dependencies:** Phase 2 (manifest provides slug→badge), Phase 1 (snapshot contracts).
- **Expected impact:** Badge rules live in one tested place; auth boilerplate written once.
- **Complexity:** M.
- **Risks:** Highest-risk phase (touches persistence + auth + redirects). Mitigate: keep exported
  action names/signatures identical; add a parity checklist per track; manual smoke test of one
  challenge per track in local before merge.

## Phase 5 — Challenge-view shell + submit hook

- **Objective:** Absorb the repeated view shell and submit logic (D8) into composition.
- **Scope:**
  - `components/ChallengeLayout.tsx`: `<main data-pg-main>` + responsive wrapper + breadcrumb +
    `[1fr_340px]` grid slots (`editor`, `sidebar`). **Must preserve `data-pg-main`** (required by
    the GSAP page transition).
  - `hooks/useChallengeSubmit.ts`: wraps `useTransition` + `save → complete` pattern.
  - Migrate the five `*ChallengeView` to compose the shell; keep each track's editor/sidebar local.
- **Dependencies:** Phase 4 (so submit hook calls the consolidated actions).
- **Expected impact:** Layout/behavior changes happen once. Tracks shrink to their unique parts.
- **Complexity:** M.
- **Risks:** Subtle per-track layout differences (grid widths, padding) — make the shell accept
  className overrides; verify each track visually.

## Phase 6 — Shared UI de-duplication + shadcn-first pass

- **Objective:** One Logo, one ScrollReveal; document component policy (D7).
- **Scope:**
  - Merge `Logo`/`LogoMark` into one `shared/Logo` with an `animate` prop and `iconOnly` variant.
  - Merge the two ScrollReveal implementations into one configurable `shared/ScrollReveal`.
  - Audit each custom component against the **shadcn/ui-first policy** (below); record verdict
    (keep-as-shadcn-wrapper / compose / replace) in a short `components/README.md`.
- **Dependencies:** none hard (can run in parallel with 1–5).
- **Expected impact:** Single source per visual concern; clear policy for future components.
- **Complexity:** S–M.
- **Risks:** Visual regressions in landing/docs animations — verify both surfaces.

## Phase 7 — Feature-first relocation (physical move)

- **Objective:** Make the structure _scream_ the product (D1). Done **last**, after logical
  boundaries already hold, so it is a near-mechanical move.
- **Scope:**
  - Introduce `features/{playground,docs,home}` and `shared/`; move already-cohesive modules in.
  - Use re-export shims + alias updates; split into one PR per feature to keep diffs reviewable.
  - `lib/` retains only cross-cutting infra (supabase, source, i18n, utils).
- **Dependencies:** Phases 1–6 (so each feature is already internally coherent).
- **Expected impact:** One folder per feature; onboarding/impact-analysis localized.
- **Complexity:** M (mostly mechanical), but large diff.
- **Risks:** Big rename diff; merge contention. Mitigate: do it in a quiet window, one feature per
  PR, rely on `tsc` to catch every broken path.

---

## shadcn/ui-first policy (to adopt in Phase 6, enforce thereafter)

Order of preference when a UI need arises:

1. **Use** an existing `components/ui` shadcn primitive.
2. **Compose** existing primitives.
3. **Extend** a shadcn primitive (wrap, add variants via `cva`).
4. **Build custom** only when: shadcn has no equivalent, design can't be reached by composition,
   or it's a reusable _domain_ component (e.g., `DiffViewer`, `ChallengeCard`).

Component placement:

- `components/ui/` — shadcn primitives only (generated/maintained via `shadcn add`).
- `shared/` — business-agnostic reusable (Logo, ScrollReveal, Footer, i18n provider).
- `features/<f>/components/` — feature-specific (ChallengeCard, BadgesSection, DiffViewer, Hero…).

Candidate verdicts (initial, to confirm during the audit):
| Component | Verdict | Reason |
|---|---|---|
| `ui/confirm-dialog`, `ui/kbd` | Keep as shadcn-style primitives | Generic, belong in `ui/` |
| `shared/logo.tsx` + `LogoMark.tsx` | **Merge** → one `shared/Logo` | Duplicate SVG |
| `shared/ScrollReveal` + `docs/DocsScrollReveal` | **Merge** → one configurable | Duplicate concern |
| `playground/DiffViewer`, `ChallengeCard`, `BadgesSection` | Keep, move to feature | Domain-specific |
| `home/Terminal` + `HeroTerminal` | Review for overlap | Possible partial dup |

---

## Sequencing & dependency graph

```
Phase 0 (guardrails) ─┐
                      ├─> Phase 1 (domain) ─> Phase 2 (manifest) ─┬─> Phase 3 (registry)
                      │                                           └─> Phase 4 (server/badges) ─> Phase 5 (view shell)
Phase 6 (shared UI / shadcn) ── independent, anytime ──────────────────────────────────────────┘
Phase 7 (feature-first move) ── LAST, after 1–6 ───────────────────────────────────────────────┘
```

Recommended order: **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**, with Phase 6 parallelizable.

## Definition of done (per phase)

- `bun run types:check` and `bun run lint` pass; app builds.
- Public routes and Supabase schema unchanged (unless the phase targets them).
- No `lib/** → components/**` (or `shared → features`) imports.
- Manual smoke test of at least one challenge per affected track.
