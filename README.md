# openbranch

openbranch is an open, opinionated resource for software engineering. It pairs practical guides — Git workflows, pull requests, testing, releases, best practices — with an **interactive playground** of hands-on challenges (bug fixes, code review, testing, Git conflicts). Fully bilingual (Spanish / English), built with Next.js 16 and Fumadocs.

## Getting started

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Tech stack

| Layer           | Choice                      |
| --------------- | --------------------------- |
| Framework       | Next.js 16 (App Router)     |
| Docs engine     | Fumadocs 16                 |
| Styling         | Tailwind CSS 4              |
| Language        | TypeScript                  |
| Package manager | Bun                         |
| CI              | GitHub Actions + SonarCloud |
| Deploy          | Vercel                      |

## Project structure

```
app/                     ← routes, RSC, server actions (thin)
├── [lang]/
│   ├── (home)/          ← landing page
│   ├── docs/            ← documentation pages
│   └── playground/      ← interactive challenge routes
├── actions/            ← server actions
├── api/                ← search, playground-search, auth callback
└── og/, llms.txt/, …   ← generated metadata routes

features/               ← feature-first: each domain self-contained
├── docs/components/    ← documentation UI
├── home/              ← landing page (components + hooks)
└── playground/        ← challenges, domain, registry, server, components, hooks

shared/                ← cross-feature leaf components
                         (Nav, Footer, Logo, MaturityBadge, DiffBars, …)

components/
└── ui/                ← shadcn/ui primitives (do not modify directly)

lib/                   ← cross-cutting infra (i18n, sources, constants, supabase, …)

content/
├── docs/              ← MDX guides, organised by topic
└── playground/        ← MDX challenge definitions
```

### Why feature-first

The codebase is organised by **feature**, not by file type. Each feature under `features/` (`docs`, `home`, `playground`) owns its components, hooks, and — for playground — its domain logic, registry, and server actions. Opening a feature folder tells you its full shape without reading a file.

The architecture enforces a strict dependency direction, checked by ESLint (`no-restricted-imports`):

- **`app/`** is thin and may import any feature.
- **`features/`** are self-contained; a feature must **not** import another feature. Shared pieces are promoted to `shared/` or `components/ui/`.
- **`shared/`** is a leaf — it never imports a feature (dependencies are injected via props; see `I18nRootProvider`).
- **`lib/`** is the lowest layer — no UI, no features.

No barrel `index.ts` files are used: explicit imports (`@/features/home/components/Hero`) are easier to trace in errors and refactors, and they avoid the server/client boundary issues barrels cause in the Next.js App Router. See [`docs/architecture/`](./docs/architecture/) for the full rationale.

## Content

Guides live in `content/docs/` as MDX files. Each guide has a Spanish version (`.mdx`) and an English version (`.en.mdx`). Frontmatter fields:

```yaml
---
title: Guide title
description: One-sentence summary shown in cards and SEO.
icon: IconName # Lucide icon name
maturity: draft # draft | rfc | field-tested | battle-tested | archived
authors:
  - Name Surname
---
```

Maturity levels signal how settled the guidance is — `battle-tested` is proven across teams and the default recommendation, `field-tested` is used in real projects but still evolving, `rfc` is a working proposal open to revision, and `draft` is early and incomplete. The full set is defined in `lib/maturity.ts`.

Playground challenges live in `content/playground/` as MDX files, also bilingual (`.es.mdx` / `.en.mdx`). In addition to the guide fields, each challenge declares its `category` (bug-fix, code-review, testing, git, docs), `difficulty`, `estimated_minutes`, the `validation` runner, a `sandbox_template`, and the `skills` it exercises.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide — how to run the project locally, write a new guide, open a PR, and what the review process looks like.
