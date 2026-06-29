# Architecture Assessment Report — openbranch

> Status: Draft · Type: Architecture Review · Date: 2026-06-29
> Scope: Whole repository. **Analysis only — no production code was modified.**

This report maps the current architecture, identifies architectural smells with concrete
file references, and explains why each one matters. The companion documents are
[`02-refactoring-roadmap.md`](02-refactoring-roadmap.md) and [`03-github-issue.md`](03-github-issue.md).

---

## 1. Executive summary

openbranch is a Next.js 16 / React 19 documentation site with an interactive **Playground**
module (coding challenges with badges, sessions, and an in-browser editor). The codebase is
small (≈259 tracked files), strongly typed, lint-clean, and the individual files are written
to a high standard (arrow functions, explicit return types, `readonly` props, low cognitive
complexity per recent commits).

The weaknesses are **structural, not local**. The repository is organized by _technical type_
(`components/`, `lib/`, `app/`) rather than by _domain_, so the Playground — by far the most
complex feature — is physically smeared across six top-level directories. Inside the
Playground, the five challenge "tracks" (code-review, bug-fix, testing, git, documentation)
were each added by copy-and-adapt, producing five parallel registries, five parallel server
actions, five parallel completion/badge flows, and duplicated category/icon/badge maps in at
least four files. Domain contracts (types) live wherever they were first needed, including
_inside React component files that `lib/` then imports back_, which inverts the dependency
direction.

None of this is on fire. But every new challenge track currently costs a change in ~8 files,
and the duplication means consistency is maintained by hand. The goal of the refactor is to
make "add a challenge track" a localized, additive change, and to make the repository's
top-level structure _scream_ "this is openbranch: docs + playground."

**Overall maturity:** good engineering hygiene at the file level; weak module architecture.

---

## 2. Current structure (as-is)

```
openbranch/
├── app/                         # Next.js App Router (routing + RSC + server actions + API)
│   ├── [lang]/(home)/           # landing
│   ├── [lang]/docs/             # docs reader
│   ├── [lang]/playground/       # playground routes (hub, detail, active, result)
│   ├── actions/playground.ts    # ALL playground server actions (single 347-line file)
│   ├── api/                     # auth callback, search, playground-search
│   └── og/, llms*.txt/...       # metadata routes
├── components/                  # organized by technical type / surface
│   ├── ui/                      # shadcn/ui primitives (13)
│   ├── shared/                  # cross-surface (Footer, logos, ScrollReveal, i18n)
│   ├── home/                    # landing components (11)
│   ├── docs/                    # docs components (13)
│   └── playground/              # playground UI (23 + git/ testing/ documentation/ subdirs)
├── lib/                         # organized by technical type
│   ├── playground/              # registries, diff3, templates, types, worker (10)
│   ├── hooks/                   # 2 hooks (landing animations only)
│   ├── supabase/                # client/server factories
│   └── *.ts                     # i18n, dictionaries, source, utils, ... (16 root files)
├── content/                     # MDX guides + playground challenge content & templates
├── icons/index.tsx              # Tabler icon re-export barrel
├── supabase/migrations/         # SQL
└── docs/                        # internal planning docs
```

**Observation:** to understand _one feature_ (Playground) an engineer must open
`app/[lang]/playground/`, `app/actions/playground.ts`, `components/playground/`,
`lib/playground/`, `content/playground/`, and `supabase/migrations/`. The structure tells you
_what framework_ this is (Next.js), not _what product_ it is.

---

## 3. Strengths (keep these)

| Strength                           | Evidence                                                                                                                                                                       | Why it matters                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Consistent file-level style        | Arrow functions, explicit return types, `readonly` props everywhere                                                                                                            | Low-friction reading; matches team conventions               |
| Strong typing discipline           | 59 exported types; `satisfies` used in server actions ([`app/actions/playground.ts:62`](../../app/actions/playground.ts))                                                      | Compile-time safety on snapshots/contracts                   |
| Clean icon barrel                  | [`icons/index.tsx`](../../icons/index.tsx) re-exports Tabler with semantic aliases                                                                                             | Single source for iconography                                |
| Centralized i18n dictionaries      | `lib/playground-dictionary.ts`, `lib/landing-dictionary.ts`, `lib/dictionaries/docs.ts`                                                                                        | UI strings out of components                                 |
| Good RSC/Client boundary awareness | Serializable-subset pattern documented ([`docs-types.ts:12`](../../lib/playground/docs-types.ts), [`active/page.tsx:139`](../../app/[lang]/playground/[slug]/active/page.tsx)) | Avoids "functions can't cross to Client Components" footguns |
| shadcn/ui already adopted          | 13 primitives in `components/ui`, `components.json` present                                                                                                                    | Foundation for a shadcn-first policy already exists          |
| Per-track decomposition started    | `git/` and `testing/` already split into pane/sidebar/toolbar/hooks/types                                                                                                      | Proven the team _can_ modularize a track                     |

---

## 4. Weaknesses & architectural smells

Each item: **what**, **where**, **why it matters**, **principle violated**.

### 4.1 Technical-type top-level organization (Screaming Architecture violation) — HIGH

- **What:** Top-level dirs are `components/`, `lib/`, `app/` — buckets by implementation
  detail, not by domain.
- **Where:** Playground spans `app/[lang]/playground`, `app/actions/playground.ts`,
  `components/playground`, `lib/playground`, `content/playground`, `supabase/migrations`.
- **Why it matters:** No single place "owns" a feature. Onboarding, code review, and impact
  analysis all require a mental join across directories. New features inherit the smear.
- **Principle:** Screaming Architecture, Feature-first, Domain-driven boundaries, High cohesion.

### 4.2 Five parallel registries (duplication / missing abstraction) — HIGH

- **What:** Five near-identical `Record<string, T>` + `getXBySlug` lookups.
- **Where:** [`sandpack-registry.ts`](../../lib/playground/sandpack-registry.ts),
  [`testing-registry.ts`](../../lib/playground/testing-registry.ts),
  [`git-registry.ts`](../../lib/playground/git-registry.ts),
  [`docs-registry.ts`](../../lib/playground/docs-registry.ts),
  [`diff-registry.ts`](../../lib/playground/diff-registry.ts).
- **Why it matters:** Each new track = a new registry file. The shape is identical; only the
  type and the data map differ. This is a textbook missing generic abstraction.
- **Principle:** Reusability over duplication, DRY, SOLID (OCP).

### 4.3 Five parallel server actions with duplicated badge logic (duplication) — HIGH

- **What:** `save*State` + `complete*Challenge` repeated per track; each `complete*` re-implements
  the same "update→completed, check existing badge, count completed of prefix, insert badge,
  redirect" sequence with only the badge id and slug-prefix changing.
- **Where:** [`app/actions/playground.ts`](../../app/actions/playground.ts) (347 lines, ~5×
  duplicated completion blocks: lines 68–117, 134–172, 193–231, 268–306, 308–346).
- **Why it matters:** Badge rules are duplicated five times; a change to award logic must be
  made in five places. The auth/`getUser` boilerplate is repeated ~11 times.
- **Principle:** DRY, Separation of concerns (badge policy ≠ persistence ≠ routing), SOLID (SRP).

### 4.4 Scattered + duplicated domain maps (category / icon / badge) — HIGH

- **What:** The same category/icon/badge knowledge is re-declared in multiple files.
- **Where:**
  - Category order + icons + slug→badge inference: [`playground/page.tsx:17-29,105-112`](../../app/[lang]/playground/page.tsx)
  - Challenge icon map (again): [`playground/[slug]/page.tsx:15-24`](../../app/[lang]/playground/[slug]/page.tsx)
  - Icon resolver (again): [`lib/playground/challenge-icons.tsx`](../../lib/playground/challenge-icons.tsx)
  - Badge keys + icons (again): [`BadgesSection.tsx:17-37`](../../components/playground/BadgesSection.tsx)
  - Badge award rules (again, per track): [`app/actions/playground.ts`](../../app/actions/playground.ts)
- **Why it matters:** Adding a category/badge requires synchronized edits in 4–5 files; drift is
  inevitable (e.g., `BADGE_KEYS` includes `streak-7`/`all-tracks` that no action awards).
- **Principle:** Single source of truth, High cohesion, Consistency.

### 4.5 Dependency inversion: `lib/` imports from `components/` — HIGH

- **What:** A lower layer (`lib`) imports a domain type from a higher layer (`components`).
- **Where:** [`lib/playground/diff-registry.ts:1`](../../lib/playground/diff-registry.ts) and
  [`lib/playground/diffs/code-review-noisy-pr.ts:1`](../../lib/playground/diffs/code-review-noisy-pr.ts)
  both `import type { DiffFile } from "@/components/playground/DiffViewer"`.
- **Why it matters:** Inverts the intended dependency direction (UI should depend on domain,
  not vice-versa). Creates a circular-risk knot: data/registry ↔ component. `DiffFile` is a
  _domain contract_, but it lives inside a React component file.
- **Principle:** Explicit dependency direction, Clean Architecture, Stable-dependencies.

### 4.6 Domain types scattered across components and template files — MEDIUM

- **What:** Contracts live wherever first used: snapshot DTOs in `lib/playground/review-types.ts`,
  docs contracts in `docs-types.ts`, git/testing types under `components/playground/*/types.ts`,
  template shapes _inside the data file itself_ (`BugFixTemplate` in
  [`bug-fix-off-by-one.ts:88-101`](../../lib/playground/sandpack-templates/bug-fix-off-by-one.ts)),
  and `DiffFile` inside a component.
- **Why it matters:** No discoverable "contracts" surface. Two near-identical file types exist
  (`DocsFile` in `docs-types.ts` vs `BugFixTemplateFile` in the bug-fix template) — a missed
  shared abstraction. Hard to know what a module's public type surface is.
- **Principle:** Minimal public surface, Discoverability, DRY.

### 4.7 Duplicated UI components — MEDIUM

- **What:** Two implementations of the same artifact.
- **Where:**
  - Logo rendered twice: [`components/shared/logo.tsx`](../../components/shared/logo.tsx) (`Logo`/`BranchIcon`)
    and [`components/shared/LogoMark.tsx`](../../components/shared/LogoMark.tsx) — same SVG path,
    different props/animation.
  - Scroll-reveal twice with divergent logic: [`components/shared/ScrollReveal.tsx`](../../components/shared/ScrollReveal.tsx)
    (global, `[data-scroll-reveal]`) vs [`components/docs/DocsScrollReveal.tsx`](../../components/docs/DocsScrollReveal.tsx)
    (children-based). Different thresholds/behavior.
- **Why it matters:** Two sources of truth for one visual concern; fixes/animations drift.
- **Principle:** Reusability over duplication, Consistency.

### 4.8 Repeated challenge-view shell (missing composition) — MEDIUM

- **What:** Every `*ChallengeView` repeats the same shell: `<main data-pg-main>` wrapper, the
  identical responsive classes, `PlaygroundBreadcrumb`, the `[1fr_340px]` grid, sidebar with
  exit, and the `useTransition` save→complete submit handler.
- **Where:** [`TestingChallengeView.tsx`](../../components/playground/testing/TestingChallengeView.tsx),
  [`DocumentationChallengeView.tsx`](../../components/playground/documentation/DocumentationChallengeView.tsx),
  `BugFixChallengeView.tsx`, `ActiveChallengeView.tsx`, `git/GitChallengeView.tsx`.
- **Why it matters:** Layout/behavior changes (e.g., breadcrumb tweak, autosave policy) must be
  repeated. A `ChallengeLayout` shell + a `useChallengeSubmit` hook would absorb this.
- **Principle:** Composition over inheritance, DRY, SRP.

### 4.9 Config / convention inconsistencies — LOW

- **What / Where:**
  - `components.json` declares `"iconLibrary": "lucide"` but the project uses **Tabler**
    (`@tabler/icons-react`); no `lucide-react` dependency exists. Misleading for `shadcn add`.
  - `components.json` alias `"hooks": "@/hooks"` points to a **non-existent** top-level dir;
    hooks actually live in `lib/hooks/` (kebab `use-*.ts`) and colocated in tracks
    (camelCase `useTestingEditor.ts`). Two hook naming/placement conventions coexist.
  - Custom-built dialogs (`components/ui/confirm-dialog.tsx`, `kbd.tsx`) sit beside generated
    shadcn primitives without a documented "is this shadcn or ours?" marker.
- **Why it matters:** Small cuts that erode tooling trust and consistency.
- **Principle:** Consistency, Excellent DX.

### 4.10 Single 347-line server-action file (low cohesion) — LOW/MEDIUM

- **What:** `app/actions/playground.ts` mixes session lifecycle, five tracks' persistence,
  badge policy, and redirects in one module.
- **Why it matters:** Every track touches the same file → merge contention, weak ownership.
- **Principle:** SRP, High cohesion, Feature encapsulation.

---

## 5. Cross-cutting analysis

### 5.1 Dependency flow

Intended (healthy): `app (routes/actions) → features → lib (domain/services) → ui/icons`.
Actual deviations:

- `lib/playground/diff*` → `components/playground/DiffViewer` (**inverted**, §4.5).
- Cross-cutting domain maps duplicated in `app` and `components` rather than imported from a
  single domain module (§4.4).
- No circular import detected at module-resolution level, but §4.5 is a circular-risk seam.

### 5.2 Cohesion / coupling

- **High coupling, low cohesion across directories:** one feature, six homes.
- **Good local cohesion inside `git/` and `testing/` track folders** — these are the model to
  generalize: pane / sidebar / toolbar / `useXEditor` / `useXRunner` / `types.ts`.

### 5.3 Over- vs under-engineering

- **Under-engineered:** the registry/action/badge abstractions (copy-paste where a generic
  belongs).
- **Slightly over-engineered:** five separate registry _files_ for 1–2 entries each — premature
  file-level separation without the unifying abstraction that would justify it.

---

## 6. Technical debt register (prioritized by impact)

| #   | Debt                                                   | Type          | Impact | Effort  | Priority |
| --- | ------------------------------------------------------ | ------------- | ------ | ------- | -------- |
| D1  | Feature smeared across 6 top-level dirs                | Architectural | High   | High    | P1       |
| D2  | 5 parallel registries                                  | Org / Type    | High   | Low     | P1       |
| D3  | 5 parallel server actions + duplicated badge policy    | Architectural | High   | Med     | P1       |
| D4  | Category/icon/badge maps duplicated in 4–5 files       | Org           | High   | Low     | P1       |
| D5  | `lib` → `components` dependency inversion (`DiffFile`) | Architectural | High   | Low     | P1       |
| D6  | Domain types scattered / contracts inside components   | Type          | Med    | Med     | P2       |
| D7  | Duplicate Logo + ScrollReveal components               | UI            | Med    | Low     | P2       |
| D8  | Repeated challenge-view shell                          | UI / Comp     | Med    | Med     | P2       |
| D9  | `iconLibrary: lucide` + dead `@/hooks` alias           | Config        | Low    | Trivial | P3       |
| D10 | Dead/unawarded badge keys (`streak-7`, `all-tracks`)   | Dead code     | Low    | Trivial | P3       |
| D11 | 347-line monolithic actions file                       | Org           | Med    | Med     | P2       |

---

## 7. Risks of _not_ refactoring

- **Linear cost growth:** each new challenge track ≈ 8 edited files; consistency hand-maintained.
- **Drift:** badge/category/icon maps already diverge; will worsen.
- **Onboarding tax:** new contributors must learn the cross-directory join before any change.
- **Refactor fragility:** the `lib ↔ components` seam makes type moves risky.

## 8. Improvement opportunities (summary — detailed in roadmap)

1. Adopt **feature-first** top-level layout (`src/features/playground`, `src/features/docs`,
   `src/features/home`, `src/shared`, `src/components/ui`).
2. Collapse the 5 registries into **one generic `createChallengeRegistry`** + a per-track
   manifest.
3. Extract a **single challenge-track manifest** (category, icon, badge, registry, view) as the
   one source of truth; derive page maps, badge policy, and routing from it.
4. Generalize server actions into **one parameterized session/badge service**.
5. Establish a **contracts module per feature** (`features/playground/domain/`) and move
   `DiffFile` out of the component.
6. Introduce a **`ChallengeLayout` shell + `useChallengeSubmit` hook**.
7. De-duplicate **Logo** and **ScrollReveal**; fix `components.json`.
8. Document and enforce a **shadcn/ui-first** component policy.

See [`02-refactoring-roadmap.md`](02-refactoring-roadmap.md) for the phased plan.
