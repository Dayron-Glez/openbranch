# Maturity Badges — SPR-01-A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `maturity` field to MDX frontmatter and render a `<MaturityBadge>` in the sidebar (xs), meta-bar (md), and topic-index filter chips (lg).

**Architecture:** Schema extension in `source.config.ts` makes Zod validate at build time; pure type/class map in `lib/maturity.ts` is safe for both server and client imports; sidebar uses fumadocs v16 `sidebar.components.Item` API with a server component that caches a URL→maturity map; the topic-index filter is a client component that receives serialisable page data from the server.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 · fumadocs-ui 16.8 · Zod (via fumadocs-core) · React `cache()`

---

## File map

| Action | Path                                   | Responsibility                                              |
| ------ | -------------------------------------- | ----------------------------------------------------------- |
| Create | `lib/maturity.ts`                      | Types, zod schema, label/class maps — **no server imports** |
| Create | `components/MaturityBadge.tsx`         | Server component, renders dot + label + aria-label          |
| Create | `components/DocsSidebar.tsx`           | Custom fumadocs sidebar `Item` (server RSC)                 |
| Create | `components/MaturityFilter.tsx`        | Client filter chips + page list                             |
| Modify | `source.config.ts`                     | Extend `pageSchema` with `maturity` field                   |
| Modify | `app/[lang]/docs/[[...slug]]/page.tsx` | Meta-bar badge + section-index filter                       |
| Modify | `app/[lang]/docs/layout.tsx`           | Wire `sidebar.components.Item`                              |
| Modify | 3 MDX fixtures + EN variants           | Add `maturity:` to frontmatter                              |

---

## Task 1 — Foundation: `lib/maturity.ts` + `source.config.ts`

These two files are committed together because the schema extension depends on the types, and `npm run types:check` only passes when both exist.

**Files:**

- Create: `lib/maturity.ts`
- Modify: `source.config.ts`

- [ ] **Step 1: Create `lib/maturity.ts`**

```ts
// lib/maturity.ts
import { z } from "zod"

export const MATURITY_VALUES = [
  "draft",
  "rfc",
  "field-tested",
  "battle-tested",
  "archived",
] as const

export type Maturity = (typeof MATURITY_VALUES)[number]

export const maturitySchema = z.enum(MATURITY_VALUES).default("draft")

export const MATURITY_LABEL: Record<Maturity, string> = {
  draft: "draft",
  rfc: "rfc",
  "field-tested": "field-tested",
  "battle-tested": "battle-tested",
  archived: "archived",
}

// Tailwind utility classes per state.
// All tokens (fg-muted, info, warn, ob-accent, etc.) come from global.css @theme.
export const MATURITY_CLASSES: Record<Maturity, string> = {
  draft: "text-fg-muted border-line bg-transparent",
  rfc: "text-info border-info/30 bg-info/8",
  "field-tested": "text-warn border-warn/30 bg-warn/8",
  "battle-tested": "text-ob-accent border-ob-accent/30 bg-accent-soft",
  archived: "text-fg-faint border-line bg-transparent line-through decoration-fg-faint",
}

export const MATURITY_SIZE_CLASSES: Record<"xs" | "md" | "lg", string> = {
  xs: "px-1.5 py-0.5 text-[9.5px]",
  md: "px-2.5 py-1 text-[10.5px]",
  lg: "px-3 py-1.5 text-[11.5px]",
}
```

- [ ] **Step 2: Extend `source.config.ts`**

Replace the entire file content:

```ts
// source.config.ts
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { maturitySchema } from "./lib/maturity"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({ maturity: maturitySchema }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  mdxOptions: {},
})
```

- [ ] **Step 3: Regenerate types and verify**

```bash
npm run types:check
```

Expected: exits 0. This also runs `fumadocs-mdx` which regenerates `.source/` types so that `page.data.maturity` is now typed as `Maturity`.

If it fails with "Cannot find module './lib/maturity'", verify the path is correct relative to the project root (same level as `source.config.ts`).

- [ ] **Step 4: Pause — let user review before committing**

Show the diff, wait for approval.

- [ ] **Step 5: Commit**

```bash
git add lib/maturity.ts source.config.ts .source/
git commit -m "feat(maturity): add schema, types, and class maps"
```

---

## Task 2 — `components/MaturityBadge.tsx`

**Files:**

- Create: `components/MaturityBadge.tsx`

- [ ] **Step 1: Create the component**

```tsx
// components/MaturityBadge.tsx
import { MATURITY_CLASSES, MATURITY_LABEL, MATURITY_SIZE_CLASSES } from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"

type MaturityBadgeProps = Readonly<{
  maturity: Maturity
  size?: "xs" | "md" | "lg"
}>

export function MaturityBadge({ maturity, size = "md" }: MaturityBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES[size],
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </span>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npm run types:check
```

Expected: exits 0.

- [ ] **Step 3: Pause — let user review before committing**

- [ ] **Step 4: Commit**

```bash
git add components/MaturityBadge.tsx
git commit -m "feat(maturity): add MaturityBadge server component"
```

---

## Task 3 — MDX fixtures

Add `maturity:` to 3 existing files (+ their EN variants). Values reflect the actual state of each file's content.

**Files to modify:**

- `content/docs/contributing/ci-guardrails.mdx` → `battle-tested`
- `content/docs/contributing/ci-guardrails.en.mdx` → `battle-tested`
- `content/docs/git/index.mdx` → `rfc`
- `content/docs/git/index.en.mdx` → `rfc`
- `content/docs/contributing/index.mdx` → `draft`
- `content/docs/contributing/index.en.mdx` → `draft`

- [ ] **Step 1: Edit `content/docs/contributing/ci-guardrails.mdx`**

Add `maturity: battle-tested` to frontmatter:

```mdx
---
title: Guardarraíles de contribución
description: Cómo un proyecto público basado en forks enseña a los contribuidores...
icon: Shield
maturity: battle-tested
---
```

- [ ] **Step 2: Edit `content/docs/contributing/ci-guardrails.en.mdx`**

```mdx
---
title: Contribution Guardrails
description: ...
icon: Shield
maturity: battle-tested
---
```

(Keep existing title and description, just add the `maturity` line.)

- [ ] **Step 3: Edit `content/docs/git/index.mdx`**

```mdx
---
title: Git y flujos de trabajo
description: Commits atómicos, estrategias de ramas...
maturity: rfc
---
```

- [ ] **Step 4: Edit `content/docs/git/index.en.mdx`**

```mdx
---
title: Git & Workflows
description: Atomic commits, branching strategies...
maturity: rfc
---
```

- [ ] **Step 5: Edit `content/docs/contributing/index.mdx`**

```mdx
---
title: Contribuir al código abierto
description: ...
maturity: draft
---
```

- [ ] **Step 6: Edit `content/docs/contributing/index.en.mdx`**

```mdx
---
title: Contributing to Open Source
description: ...
maturity: draft
---
```

- [ ] **Step 7: Verify build parses correctly**

```bash
npm run types:check
```

Expected: exits 0. If you add an invalid value (e.g. `maturity: banana`), the command should fail — confirm this works as a quick sanity check, then revert.

- [ ] **Step 8: Pause — let user review before committing**

- [ ] **Step 9: Commit**

```bash
git add content/docs/contributing/ci-guardrails.mdx content/docs/contributing/ci-guardrails.en.mdx content/docs/git/index.mdx content/docs/git/index.en.mdx content/docs/contributing/index.mdx content/docs/contributing/index.en.mdx
git commit -m "feat(maturity): add maturity field to 3 fixture MDX files"
```

---

## Task 4 — Meta-bar badge in docs page

Wire `MaturityBadge` (size `md`) into the existing meta-bar row in `app/[lang]/docs/[[...slug]]/page.tsx`.

**Files:**

- Modify: `app/[lang]/docs/[[...slug]]/page.tsx`

- [ ] **Step 1: Add import**

At the top of the file, add:

```ts
import { MaturityBadge } from "@/components/MaturityBadge"
```

- [ ] **Step 2: Render badge in the meta-bar**

The existing meta-bar div is:

```tsx
<div className="flex flex-row items-center gap-2 border-b pb-6">
  <MarkdownCopyButton markdownUrl={markdownUrl} />
  <ViewOptionsPopover ... />
</div>
```

Replace with:

```tsx
<div className="flex flex-row items-center gap-2 border-b pb-6">
  <MaturityBadge maturity={page.data.maturity} size="md" />
  <MarkdownCopyButton markdownUrl={markdownUrl} />
  <ViewOptionsPopover
    markdownUrl={markdownUrl}
    githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
  />
</div>
```

- [ ] **Step 3: Type-check**

```bash
npm run types:check
```

Expected: exits 0. `page.data.maturity` is now typed as `Maturity` from the schema extension.

- [ ] **Step 4: Pause — let user review before committing**

- [ ] **Step 5: Commit**

```bash
git add app/[lang]/docs/\[\[...slug\]\]/page.tsx
git commit -m "feat(maturity): render MaturityBadge md in docs meta-bar"
```

---

## Task 5 — Sidebar badge via custom `Item`

fumadocs v16 exposes `sidebar.components.Item: FC<{ item: PageTree.Item }>` in `DocsLayout`. We create a server component that builds a URL→maturity map (memoised per request with React `cache()`) and renders `SidebarItem` with an optional `xs` badge.

**Files:**

- Create: `components/DocsSidebar.tsx`
- Modify: `app/[lang]/docs/layout.tsx`

- [ ] **Step 1: Create `components/DocsSidebar.tsx`**

```tsx
// components/DocsSidebar.tsx
import { cache } from "react"
import { SidebarItem } from "fumadocs-ui/components/sidebar/base"
import { MaturityBadge } from "@/components/MaturityBadge"
import { source } from "@/lib/source"
import { i18n } from "@/lib/i18n"
import type { Maturity } from "@/lib/maturity"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

// One map per request, shared across all sidebar Item renders.
// source.getPages(lang) is synchronous — data is in-memory at startup.
const getMaturityMap = cache((): Map<string, Maturity> => {
  const map = new Map<string, Maturity>()
  for (const lang of i18n.languages) {
    for (const page of source.getPages(lang)) {
      map.set(page.url, page.data.maturity)
    }
  }
  return map
})

export function DocsSidebarItem({ item }: { item: PageTreeItem }) {
  const maturity = getMaturityMap().get(item.url)

  return (
    <SidebarItem href={item.url} icon={item.icon}>
      <span className="flex-1 truncate">{item.name}</span>
      {maturity && maturity !== "draft" && <MaturityBadge maturity={maturity} size="xs" />}
    </SidebarItem>
  )
}
```

**Why `maturity !== "draft"`:** draft is the default and adds no information to the reader; showing it on every new page would create visual noise. All other states (rfc, field-tested, battle-tested, archived) carry signal worth surfacing.

- [ ] **Step 2: Modify `app/[lang]/docs/layout.tsx`**

Add the import and wire `sidebar.components`:

```tsx
// app/[lang]/docs/layout.tsx
import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/logo"
import { DocsPageTransition } from "@/components/DocsPageTransition"
import { DocsSidebarItem } from "@/components/DocsSidebar"

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()
  return (
    <DocsLayout
      tree={source.pageTree[lang]}
      {...base}
      nav={{ ...base.nav, title: <Logo /> }}
      containerProps={{ style: { "--fd-sidebar-width": "268px" } as React.CSSProperties }}
      sidebar={{ components: { Item: DocsSidebarItem } }}
    >
      <DocsPageTransition>{children}</DocsPageTransition>
    </DocsLayout>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npm run types:check
```

Expected: exits 0.

If TypeScript complains about `DocsSidebarItem` not matching `FC<{ item: PageTreeItem }>` due to the RSC function shape, add an explicit type annotation to the function:

```tsx
import type { FC } from "react"
// ...
export const DocsSidebarItem: FC<{ item: PageTreeItem }> = ({ item }) => {
```

- [ ] **Step 4: Pause — let user review before committing**

- [ ] **Step 5: Commit**

```bash
git add components/DocsSidebar.tsx "app/[lang]/docs/layout.tsx"
git commit -m "feat(maturity): render MaturityBadge xs in docs sidebar"
```

---

## Task 6 — Topic-index filter chips

Section-index pages (slug = `["git"]`, `["contributing"]`, etc.) show filter chips (lg) above a filterable list of their child pages.

**Files:**

- Create: `components/MaturityFilter.tsx`
- Modify: `app/[lang]/docs/[[...slug]]/page.tsx`

### Part A — `MaturityFilter` client component

- [ ] **Step 1: Create `components/MaturityFilter.tsx`**

```tsx
// components/MaturityFilter.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MATURITY_VALUES,
  MATURITY_LABEL,
  MATURITY_CLASSES,
  MATURITY_SIZE_CLASSES,
} from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"

export type FilterPage = {
  title: string
  url: string
  description?: string
  maturity: Maturity
}

type MaturityFilterProps = Readonly<{
  pages: FilterPage[]
}>

export function MaturityFilter({ pages }: MaturityFilterProps) {
  const [active, setActive] = useState<Set<Maturity>>(() => new Set(MATURITY_VALUES))

  const toggle = (m: Maturity) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  // Count pages per maturity across ALL pages (not filtered).
  const counts = Object.fromEntries(
    MATURITY_VALUES.map((m) => [m, pages.filter((p) => p.maturity === m).length])
  ) as Record<Maturity, number>

  const visible = pages.filter((p) => active.has(p.maturity))

  return (
    <div className="not-prose mb-8 flex flex-col gap-6">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by maturity">
        {MATURITY_VALUES.filter((m) => counts[m] > 0 || active.has(m)).map((m) => (
          <button
            key={m}
            role="checkbox"
            aria-pressed={active.has(m)}
            aria-label={`Maturity: ${MATURITY_LABEL[m]}, ${counts[m]} guide${counts[m] !== 1 ? "s" : ""}`}
            onClick={() => toggle(m)}
            className={[
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] transition-opacity",
              MATURITY_CLASSES[m],
              MATURITY_SIZE_CLASSES.lg,
              counts[m] === 0 ? "opacity-40" : "",
              !active.has(m) ? "opacity-40" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
            {counts[m]} {MATURITY_LABEL[m]}
          </button>
        ))}
      </div>

      {/* Filtered page list */}
      {visible.length === 0 ? (
        <p className="text-fg-muted font-mono text-sm">No guides match the selected filters.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((page) => (
            <li key={page.url}>
              <Link
                href={page.url}
                className="border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover flex flex-col gap-1 rounded-[var(--r-10)] border px-5 py-4 no-underline transition-[background,border-color] duration-[var(--d-base)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-fg font-medium">{page.title}</span>
                  <MaturityBadgeInline maturity={page.maturity} />
                </div>
                {page.description && (
                  <p className="text-fg-muted m-0 text-sm leading-relaxed">{page.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Inline badge used only inside this client component — avoids importing the server component.
function MaturityBadgeInline({ maturity }: { maturity: Maturity }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES.xs,
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </span>
  )
}
```

**Why `MaturityBadgeInline`:** `MaturityBadge.tsx` is a server component. Client components cannot import server components directly. The inline version duplicates ~8 lines and keeps the client bundle self-contained.

### Part B — Wire filter into the docs page

- [ ] **Step 2: Modify `app/[lang]/docs/[[...slug]]/page.tsx`**

Add these imports at the top:

```ts
import { MaturityFilter } from "@/components/MaturityFilter"
import type { FilterPage } from "@/components/MaturityFilter"
```

Then, inside the `Page` function, after the `page` lookup and before the `return`, add:

```ts
// Build child-pages list for section-index pages (slug has exactly one segment).
// Other layouts (leaf pages, root index) do not render the filter.
let sectionPages: FilterPage[] | null = null
if (slug && slug.length === 1) {
  const children = source.getPages(lang).filter((p) => p.slugs[0] === slug[0] && p.slugs.length > 1)
  if (children.length > 0) {
    sectionPages = children.map((p) => ({
      title: p.data.title,
      url: p.url,
      description: p.data.description,
      maturity: p.data.maturity,
    }))
  }
}
```

Then add the filter just before `<DocsBody>`:

```tsx
<DocsBody>
  {sectionPages && <MaturityFilter pages={sectionPages} />}
  <MDX
    components={getMDXComponents({
      a: createRelativeLink(source, page),
    })}
  />
</DocsBody>
```

Full updated function for reference:

```tsx
export default async function Page(props: PageProps<"/[lang]/docs/[[...slug]]">) {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MDX = page.data.body
  const markdownUrl = getPageMarkdownUrl(page).url

  let sectionPages: FilterPage[] | null = null
  if (slug && slug.length === 1) {
    const children = source
      .getPages(lang)
      .filter((p) => p.slugs[0] === slug[0] && p.slugs.length > 1)
    if (children.length > 0) {
      sectionPages = children.map((p) => ({
        title: p.data.title,
        url: p.url,
        description: p.data.description,
        maturity: p.data.maturity,
      }))
    }
  }

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ style: "clerk" }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MaturityBadge maturity={page.data.maturity} size="md" />
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        {sectionPages && <MaturityFilter pages={sectionPages} />}
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}
```

- [ ] **Step 3: Type-check**

```bash
npm run types:check
```

Expected: exits 0.

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: exits 0. This is the full acceptance test — an invalid MDX `maturity` value would fail here.

- [ ] **Step 5: Pause — let user review before committing**

- [ ] **Step 6: Commit**

```bash
git add components/MaturityFilter.tsx "app/[lang]/docs/[[...slug]]/page.tsx"
git commit -m "feat(maturity): add MaturityFilter to section-index pages"
```

---

## Self-review

**Spec coverage check:**

| Requirement                                     | Task                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| 5 values, zod schema, default draft             | Task 1                                         |
| Invalid value fails build                       | Task 1 Step 3 (verified), Task 6 Step 4        |
| `<MaturityBadge maturity size="xs/md/lg">`      | Task 2                                         |
| Visual tokens from globals.css                  | Task 1 (`MATURITY_CLASSES`)                    |
| Sizes xs · md · lg                              | Task 1 (`MATURITY_SIZE_CLASSES`)               |
| Leading dot currentColor                        | Task 2 (`.bg-current`)                         |
| `aria-label="Maturity: battle-tested"`          | Task 2, Task 6 `MaturityBadgeInline`           |
| 3 fixture MDX + EN mirrored                     | Task 3                                         |
| Sidebar xs badge                                | Task 5                                         |
| Meta-bar md badge                               | Task 4                                         |
| Topic-index filter chips lg                     | Task 6                                         |
| Filter chips `role="checkbox"` + `aria-pressed` | Task 6                                         |
| No new color tokens                             | All tasks — only existing `@theme` tokens used |
| No backend, no URL changes                      | All tasks — build-time only                    |

**Placeholder scan:** None found.

**Type consistency:** `Maturity`, `FilterPage`, `MATURITY_CLASSES`, `MATURITY_SIZE_CLASSES`, `MATURITY_LABEL` are defined once in `lib/maturity.ts` and imported everywhere. `DocsSidebar.tsx` and `MaturityFilter.tsx` both import from `@/lib/maturity`. The inline badge in `MaturityFilter.tsx` uses the same maps directly — no renamed symbols.

**One gap found and addressed:** The spec says `archived` should have `line-through`. The `MATURITY_CLASSES` entry for `archived` includes `line-through decoration-fg-faint`. ✓
