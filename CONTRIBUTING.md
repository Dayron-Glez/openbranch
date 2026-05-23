# Contributing to openbranch

Thanks for taking the time. openbranch is built the same way it documents software — through pull requests.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Getting started](#getting-started)
- [Writing and editing guides](#writing-and-editing-guides)
  - [Guide frontmatter](#guide-frontmatter)
  - [Authorship](#authorship)
- [Code contributions](#code-contributions)
- [Commit and PR conventions](#commit-and-pr-conventions)
- [Running the project locally](#running-the-project-locally)

---

## Ways to contribute

- **Fix a factual error or outdated advice** — open a PR directly, or use the _Improve guide_ issue template.
- **Write a new guide** — use the _New guide_ issue template to discuss scope before writing.
- **Translate a guide** — add a `*.en.mdx` (or `*.mdx` for Spanish) counterpart and open a PR.
- **Improve the UI or infrastructure** — same flow as any other PR.

---

## Getting started

1. Fork the repo and create a branch from `main`.
2. Make your changes (see sections below for content vs code).
3. Run `bun run build` — it must pass with no TypeScript errors before you open a PR.
4. Open a pull request using the provided template.

---

## Writing and editing guides

Guides live in `content/docs/<topic>/`. Each guide has two files:

```
content/docs/git/branching-strategies.mdx       ← Spanish (default)
content/docs/git/branching-strategies.en.mdx    ← English
```

Both files must be kept in sync. If you only speak one language, open the PR anyway and note it in the description — a maintainer or another contributor will handle the translation.

### Guide frontmatter

Every guide starts with a YAML frontmatter block:

```yaml
---
title: Your guide title
description: One-sentence summary shown in the card and meta tags.
maturity: draft | rfc | stable | legacy
authors:
  - Your Name
---
```

| Field         | Required | Notes                                                             |
| ------------- | -------- | ----------------------------------------------------------------- |
| `title`       | yes      | Short, imperative. "Killing flaky CI" not "How to kill flaky CI". |
| `description` | yes      | One sentence, no trailing period.                                 |
| `maturity`    | yes      | See maturity levels below.                                        |
| `authors`     | no       | See [Authorship](#authorship).                                    |

**Maturity levels:**

| Value    | Meaning                                             |
| -------- | --------------------------------------------------- |
| `draft`  | Work in progress, not production-ready advice.      |
| `rfc`    | Proposed pattern, open for community feedback.      |
| `stable` | Battle-tested, recommended for most teams.          |
| `legacy` | Still accurate but superseded by a better approach. |

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

## Code contributions

The stack is Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 + Fumadocs 16. Before touching UI components:

- Check `components/` for an existing component that already does what you need.
- Design tokens live in `app/globals.css` — use them (`var(--color-ob-accent)`, `text-fg-2`, etc.) instead of raw color values.
- Animations use GSAP 3 + `IntersectionObserver` (see `components/ScrollReveal.tsx` and `components/FeaturedGuideStats.tsx` for the pattern).
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

Common scopes: `landing`, `docs`, `lib`, `content`, `ci`, `deps`.

One logical change per commit. PRs can have multiple commits if each one is self-contained.

---

## Running the project locally

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # production build + type check
```

The site is bilingual. The Spanish root is `/`, the English root is `/en`.
