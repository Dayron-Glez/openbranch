# Contributing to openbranch

Thanks for taking the time. openbranch is built the same way it documents software — through pull requests.

openbranch has two kinds of content: **guides** (opinionated docs in `content/docs/`) and **playground challenges** (hands-on coding exercises in `content/playground/`). You can contribute to either, plus the UI and infrastructure that power them.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Getting started](#getting-started)
- [Writing a new guide](#writing-a-new-guide)
  - [Guide frontmatter](#guide-frontmatter)
  - [Heading hierarchy](#heading-hierarchy)
  - [Authorship](#authorship)
- [Adding a playground challenge](#adding-a-playground-challenge)
  - [Challenge anatomy](#challenge-anatomy)
  - [The five engine contracts](#the-five-engine-contracts)
  - [Challenge frontmatter](#challenge-frontmatter)
  - [Registering it in the catalogue](#registering-it-in-the-catalogue)
  - [Writing the brief](#writing-the-brief)
  - [Challenge ideas worth building](#challenge-ideas-worth-building)
- [Project conventions](#project-conventions)
- [Commit and PR conventions](#commit-and-pr-conventions)
- [Running the project locally](#running-the-project-locally)

---

## Ways to contribute

- **Fix a factual error or outdated advice** — open a PR directly, or use the _Improve guide_ issue template.
- **Write a new guide** — use the _New guide_ issue template to discuss scope before writing.
- **Add a playground challenge** — a real-world bug, review, testing, Git, or docs exercise. This one is a coding contribution, not a content one; use the _New Challenge_ issue template to pitch it first.
- **Translate** — add the missing `*.en.mdx` / `*.es.mdx` (or `*.mdx`) counterpart and open a PR.
- **Improve the UI or infrastructure** — same flow as any other PR.

---

## Getting started

1. Fork the repo and create a branch from `main`.
2. Make your changes (a guide, a challenge, or code — see the sections below).
3. Run `bun run build` **and** `bun run lint` — both must pass with no errors before you open a PR.
4. Open a pull request using the provided template.

---

## Writing a new guide

Guides live in `content/docs/<topic>/` and ship in both languages:

```
content/docs/git/branching-strategies.mdx       ← Spanish (default)
content/docs/git/branching-strategies.en.mdx    ← English
```

Step by step:

1. **Pick the topic folder.** Existing topics: `git/`, `pull-requests/`, `testing/`, `releases/`, `best-practices/`. Proposing a new topic? Mention it in your _New guide_ issue.
2. **Create both files** with the same base name (`.mdx` for Spanish, `.en.mdx` for English). If you only speak one language, ship that file and note it in the PR — a maintainer or another contributor will handle the translation. Keep the two versions structurally equivalent: the same headings at the same levels.
3. **Fill in the frontmatter** (see below).
4. **Write the body** with a real `h2 › h3` heading hierarchy (see [Heading hierarchy](#heading-hierarchy)).
5. **Add yourself to `authors:`** (see [Authorship](#authorship)).
6. **Verify locally.** Run `bun run build` and open the guide at `/docs/<topic>/<slug>` (Spanish) and `/en/docs/<topic>/<slug>` (English).
7. **Open the PR** using the template.

### Guide frontmatter

Every guide starts with a YAML frontmatter block:

```yaml
---
title: Your guide title
description: One-sentence summary shown in the card and meta tags.
icon: GitBranch # Lucide icon name
maturity: draft # draft | rfc | field-tested | battle-tested | archived
authors:
  - Your Name
---
```

| Field         | Required | Notes                                                             |
| ------------- | -------- | ----------------------------------------------------------------- |
| `title`       | yes      | Short, imperative. "Killing flaky CI" not "How to kill flaky CI". |
| `description` | yes      | One sentence, no trailing period.                                 |
| `icon`        | no       | A [Lucide](https://lucide.dev) icon name.                         |
| `maturity`    | yes      | See maturity levels below.                                        |
| `authors`     | no       | See [Authorship](#authorship).                                    |

**Maturity levels** (the source of truth is `lib/maturity.ts`):

| Value           | Meaning                                                 |
| --------------- | ------------------------------------------------------- |
| `draft`         | Work in progress; not production-ready advice yet.      |
| `rfc`           | Proposed pattern, open for community feedback.          |
| `field-tested`  | Used in real projects; refined but still evolving.      |
| `battle-tested` | Proven across teams; the default recommendation.        |
| `archived`      | Kept for reference but superseded by a better approach. |

### Heading hierarchy

Structure each guide with a real `h2 › h3` hierarchy. The "On this page" table of contents renders a _stepped_ (indented) outline derived from your heading levels — so a subsection only shows up nested if it is a real `###` heading. Bold lead-ins (`**Like this.**`) and list items do not count and stay flat.

- Use `##` for top-level sections.
- Use `###` for subsections, where a section naturally breaks into parallel parts — steps, categories, options.
- Don't force subheadings just to create steps. Flat prose is fine when a section doesn't subdivide.
- Keep the Spanish and English versions structurally equivalent: the same headings at the same levels.

### Authorship

The `authors` field in frontmatter is how authorship is tracked and displayed on the site (the featured guide card shows real author names and avatars derived from initials).

**Convention:**

- If you write a new guide, add your name to `authors:`.
- If you substantially edit an existing guide (rewrites, major corrections), add your name to the existing list.
- Minor fixes (typos, grammar, formatting) do not require adding yourself.
- Use the name you want displayed publicly — it does not have to match your GitHub username.

```yaml
authors:
  - Alice Kim
  - Jordan M.
```

There is no automated author extraction from git history. The frontmatter is the source of truth.

---

## Adding a playground challenge

A challenge is a short, self-contained exercise the reader solves in an in-browser workspace.

**Read this part before you start.** A challenge is not a drop-in content contribution. The workspace, the starting code, the reference solution and the grading logic are all TypeScript that ships in the application bundle, and each of the five categories has its own template shape. Writing a challenge means programming against one of five engines. The brief is the easy half.

If that is more than you were looking for, a guide is a genuinely content-only contribution — and the _New Challenge_ issue template is a good way to pitch a scenario for someone else to build.

### Challenge anatomy

A challenge is three parts: the **brief** (what the reader reads), the **engine template** (the workspace and grading logic), and a **registry entry** that connects the two.

```
content/playground/<slug>.es.mdx                         ← the brief (Spanish)
content/playground/<slug>.en.mdx                         ← the brief (English)
features/playground/challenges/<category>/…/<slug>.ts    ← the engine template
features/playground/challenges/<category>/…-registry.ts  ← one line registering it
```

Concretely, for the existing testing challenge:

```
content/playground/testing-fetchupstream.es.mdx
content/playground/testing-fetchupstream.en.mdx
features/playground/challenges/testing/testing-fetchupstream.ts
features/playground/challenges/testing/testing-registry.ts   ← + "testing-fetchupstream": testingFetchUpstream
```

Two things about this that are easy to get wrong:

- **`category` selects the engine.** `app/[lang]/playground/[slug]/active/page.tsx` branches on it to pick the view and the registry. `validation` is a label shown to the reader, not a dispatcher.
- **Without the registry entry, the challenge 404s.** The detail page will render from the MDX alone, but opening the workspace calls `notFound()` because the template lookup returns `null`. Adding the entry is not optional.

### The five engine contracts

Each category has its own template type, its own folder and its own registry file — the names are historical and not uniform, so take them from this table rather than guessing:

| Category        | Template file                                       | Registry to edit       |
| --------------- | --------------------------------------------------- | ---------------------- |
| `code-review`   | `challenges/code-review/diffs/<slug>.ts`            | `diff-registry.ts`     |
| `bug-fix`       | `challenges/bug-fix/sandpack-templates/<slug>.ts`   | `sandpack-registry.ts` |
| `testing`       | `challenges/testing/<slug>.ts`                      | `testing-registry.ts`  |
| `git`           | `challenges/git/git-templates/<slug>.ts`            | `git-registry.ts`      |
| `documentation` | `challenges/documentation/docs-templates/<slug>.ts` | `docs-registry.ts`     |

What each template has to export:

- **`code-review`** — a `readonly DiffFile[]`: the PR diff the reader annotates, written by hand, hunk by hunk. The only engine with no hints and no reference solution — submission is gated on the reader having left at least one inline comment and picked a review decision, and the judgement itself is theirs.
- **`bug-fix`** — `files`, `editableFile`, `testFile`, `solutionCode`, an optional `bugLine`, and `hints`. The reader's fix is graded by running `testFile` against their edit.
- **`testing`** — the above plus `correctSource`, `minTests`, `referenceTests` and **`mutants[]`**: deliberately broken variants of the source that the reader's tests have to kill. Designing the mutants is most of the work in this engine.
- **`git`** — `versions{base,ours,theirs}`, `extraModules`, `hiddenTests`, `conflictCount` and `solutionCode`. The reader resolves a three-way merge; hidden tests decide whether the resolution was semantically right.
- **`documentation`** — `files`, `editableFile` and `criteria[]`, where each criterion carries a `check` function that grades the reader's prose. That function runs in the browser, so keep it cheap and forgiving.

Every engine except `code-review` ships `hints` in English plus a `hintsByLang.es` array. Both are needed for a bilingual challenge.

Look at the existing challenge in the same category before you start — that file is the real specification, and this table is only a map to it.

### Challenge frontmatter

```yaml
---
title: "A concrete, specific scenario title"
description: "What's wrong and why it matters, in one or two sentences."
icon: Bug # Lucide icon name
maturity: stable # stable = published · draft = hidden (work in progress)
authors:
  - Your Name
category: bug-fix # bug-fix | code-review | testing | git | documentation — selects the engine
difficulty: beginner # beginner | moderate | demanding — also sets the points awarded
estimated_minutes: 15
validation: jest # checklist | jest | typecheck — the grading style shown to the reader
skills:
  - The concrete skills it exercises
  - Keep these specific and searchable
---
```

`code-review` challenges may also declare `pr_preview` (the PR header card) and `recommended_first` (a nudge shown on the detail page). Copy the shape from `code-review-noisy-pr.es.mdx`.

> A challenge only appears on the site when `maturity: stable`. Leave it as `draft` (the default) while the workspace isn't ready — draft challenges are hidden.

### Registering it in the catalogue

Completing a challenge awards points, and the points come from a `challenges` row in the database keyed by slug. Regenerating that catalogue is a **maintainer step**, not something a contributor can do from a fork:

```bash
bun run db:sync-challenges   # writes a migration from the MDX frontmatter
bunx supabase db push        # applies it
```

Until it runs, a newly merged challenge still works — it just scores the beginner default of 10 points regardless of its declared difficulty. Mention in your PR that the sync is pending so it doesn't get forgotten.

### Writing the brief

Keep it tight and grounded in a realistic scenario. The existing challenges follow a consistent shape — match it:

- **A framing paragraph** — the "ticket": what was reported and where the code lives (`src/<module>.ts`).
- **`## The situation`** — what to look at, with the failing test or visible symptom shown.
- **`## What you'll do`** — a short numbered path (read the failure → trace the logic → fix it).
- **`## Done when`** — the exact success condition (e.g. "all four tests pass; the fix is a single expression").

Ship the brief in both languages and keep them structurally equivalent, like guides.

### Challenge ideas worth building

Good challenges are small, have one clear "aha", and grade objectively. Pitch your idea with the _New Challenge_ issue template before building the template — a scenario that doesn't fit any of the five engines is worth catching before you write the code, not after. Some gaps worth filling:

- **bug-fix** — a debounce that drops the final call; a timezone off-by-one in date math; a memory leak from a missing effect cleanup; money rounding that breaks with floats.
- **testing** — pin down a flaky time-dependent function; test an async retry-with-backoff; characterize a legacy function before refactoring it.
- **code-review** — spot an N+1 query; catch unsanitized input reaching a database call; flag a breaking change to a public API contract.
- **git** — clean a messy history with an interactive rebase; resolve a _semantic_ conflict (both sides merge cleanly but the result is wrong); recover a "lost" commit with the reflog.
- **docs** — document a confusing function's contract and edge cases; turn a raw changelog into release notes; write a migration note for a breaking change.

---

## Project conventions

Match the surrounding code. The essentials:

**Code style**

- **Arrow functions** for components and helpers; **descriptive names**, no cryptic abbreviations.
- **Strict TypeScript.** Annotate hook generics explicitly (`useState<boolean>(false)`) and always annotate function return types. Avoid `any`; prefer precise types and `zod` schemas at boundaries (see `lib/maturity.ts`).

**React & components**

- `useEffect` is only for synchronising with **external** systems (DOM, network, subscriptions) — never to react to a component's own internal state. Derive values during render instead.
- Every playground challenge `<main>` must keep its `data-pg-main` attribute — the GSAP page transition depends on it.

**Architecture & imports**

- The codebase is **feature-first**: each feature under `features/{docs,home,playground}/` owns its components, hooks, and logic. A feature must **not** import another feature — promote shared pieces to `shared/` or `components/ui/`. ESLint enforces this.
- Dependency direction: `app/` (thin) → `features/` → `shared/` → `components/ui/` + `lib/`. `lib/` imports no UI.
- **No barrel `index.ts` files.** Use explicit paths (`@/features/home/components/Hero`) — they trace better in errors and avoid server/client boundary issues in the App Router.
- See [`docs/architecture/`](./docs/architecture/) for the full rationale.

**Styling & animation**

- Use the design tokens in `app/global.css` (`text-ob-accent`, `text-fg-muted`, `bg-accent-soft`, …) instead of raw color values.
- Animations use GSAP 3 + `IntersectionObserver` — see `shared/ScrollReveal.tsx` and `features/home/components/FeaturedGuideStats.tsx` for the pattern.
- New runtime dependencies need a justification in the PR description.

---

## Commit and PR conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): short description
fix(scope): short description
docs(scope): short description
refactor(scope): short description
chore(scope): short description
```

Common scopes: `docs`, `playground`, `home`, `shared`, `content`, `lib`, `ci`, `deps`.

One logical change per commit. PRs can have multiple commits if each one is self-contained.

---

## Running the project locally

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # production build + type check
bun run lint     # ESLint, including the architecture guards
```

The site is bilingual. The Spanish root is `/`, the English root is `/en`.
