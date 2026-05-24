# openbranch

An open documentation site for software engineering — practical, opinionated guides on Git workflows, pull requests, testing, releases, and best practices. Built with Next.js and Fumadocs.

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
app/
├── [lang]/
│   ├── (home)/         ← landing page
│   └── docs/           ← documentation layout and pages
├── api/search/         ← Fumadocs search route handler
└── global.css

components/
├── home/               ← landing page features
│   ├── Hero.tsx
│   ├── HeroTerminal.tsx
│   ├── AmbientBackground.tsx
│   ├── CommunityCTA.tsx
│   ├── FeaturedGuide.tsx
│   ├── FeaturedGuideStats.tsx
│   ├── Terminal.tsx
│   ├── TopicCard.tsx
│   └── ValueProp.tsx
├── docs/               ← documentation UI
│   ├── DocsSidebar.tsx
│   ├── SearchDialog.tsx
│   ├── MaturityBadge.tsx
│   ├── MaturityFilter.tsx
│   ├── MaturityProvider.tsx
│   ├── SuggestGuideButton.tsx
│   └── …
├── nav/                ← global navigation
│   └── Nav.tsx
├── shared/             ← cross-feature primitives
│   ├── Footer.tsx
│   ├── LogoMark.tsx
│   ├── ScrollReveal.tsx
│   └── logo.tsx
└── ui/                 ← shadcn/ui primitives (do not modify directly)

lib/
├── hooks/              ← extracted custom hooks
│   ├── use-hero-animation.ts
│   └── use-terminal-animation.ts
├── constants.ts        ← shared URLs and string literals
├── maturity.ts         ← guide maturity level system
├── weekly-pick.ts      ← deterministic featured guide selection
├── reading-time.ts     ← word-count based reading time
└── …

content/
└── docs/               ← MDX guides, organised by topic
    ├── git/
    ├── pull-requests/
    ├── testing/
    ├── releases/
    └── best-practices/
```

### Why screaming architecture

`components/` is organised by **feature domain**, not by file type. Opening the folder tells you immediately that this project has a landing page (`home/`), a documentation UI (`docs/`), a navigation bar (`nav/`), and shared primitives (`shared/`). You don't need to read any file to understand the shape of the codebase.

The alternative — a flat `components/` with `Hero.tsx`, `Nav.tsx`, `SearchDialog.tsx`, `Footer.tsx` all at the same level — scales poorly. At 20 components it becomes a scroll, at 40 it becomes a search problem. Grouping by domain keeps related files together, makes deletions safe (remove a feature → remove its folder), and gives new contributors a map before they open a single file.

No barrel `index.ts` files are used. Next.js App Router can have server/client boundary issues when barrel files mix component types, and explicit imports (`@/components/home/Hero`) are easier to trace in errors and refactors.

## Content

Guides live in `content/docs/` as MDX files. Each guide has a Spanish version (`.mdx`) and an English version (`.en.mdx`). Frontmatter fields:

```yaml
---
title: Guide title
description: One-sentence summary shown in cards and SEO.
icon: IconName # Lucide icon name
maturity: stable # stable | rfc | experimental | deprecated
authors:
  - Name Surname
---
```

Maturity levels signal how settled the guidance is — `stable` means the approach is proven and unlikely to change, `rfc` means it's a working proposal open to revision, `experimental` is early and opinionated.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide — how to run the project locally, write a new guide, open a PR, and what the review process looks like.
