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
  - [Challenge frontmatter](#challenge-frontmatter)
  - [Writing the brief](#writing-the-brief)
  - [Challenge ideas worth building](#challenge-ideas-worth-building)
- [Project conventions](#project-conventions)
- [Commit and PR conventions](#commit-and-pr-conventions)
- [Running the project locally](#running-the-project-locally)

---

## Ways to contribute

- **Fix a factual error or outdated advice** — open a PR directly, or use the _Improve guide_ issue template.
- **Write a new guide** — use the _New guide_ issue template to discuss scope before writing.
- **Add a playground challenge** — a real-world bug, review, testing, Git, or docs exercise. Pitch it in a _Feature request_ issue first.
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

A challenge is a short, self-contained exercise the reader solves in an in-browser sandbox. It grades objectively — the reader's solution passes when the challenge's tests (or diff) pass.

### Challenge anatomy

A challenge is two parts: the **brief** (what the reader reads) and the **sandbox template** (the code they edit).

```
content/playground/<slug>.es.mdx          ← the brief (Spanish)
content/playground/<slug>.en.mdx          ← the brief (English)
content/playground/templates/<slug>/      ← the runnable sandbox
├── package.json
├── tsconfig.json
└── src/
    ├── <module>.ts                        ← the code to fix or extend
    └── <module>.test.ts                   ← the tests that grade it
```

The `sandbox_template` frontmatter field links the brief to its template folder. The reader edits the sandbox in the browser; validation runs the template's tests; the challenge is solved when they pass.

### Challenge frontmatter

```yaml
---
title: "A concrete, specific scenario title"
description: "What's wrong and why it matters, in one or two sentences."
icon: Bug # Lucide icon name
authors:
  - Your Name
category: bug-fix # bug-fix | code-review | testing | git | docs
difficulty: beginner # beginner | moderate | demanding
estimated_minutes: 15
validation: jest # the runner that grades the sandbox
sandbox_template: <slug> # folder under content/playground/templates/
skills:
  - The concrete skills it exercises
  - Keep these specific and searchable
---
```

### Writing the brief

Keep it tight and grounded in a realistic scenario. The existing challenges follow a consistent shape — match it:

- **A framing paragraph** — the "ticket": what was reported and where the code lives (`src/<module>.ts`).
- **`## The situation`** — what to look at, with the failing test or visible symptom shown.
- **`## What you'll do`** — a short numbered path (read the failure → trace the logic → fix it).
- **`## Done when`** — the exact success condition (e.g. "all four tests pass; the fix is a single expression").

Ship the brief in both languages and keep them structurally equivalent, like guides.

### Challenge ideas worth building

Good challenges are small, have one clear "aha", and grade objectively. Pitch your idea in a _Feature request_ issue before building the sandbox. Some gaps worth filling:

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
