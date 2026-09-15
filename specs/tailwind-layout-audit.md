# Audit: Tailwind layout and spacing

**Status:** H8 shipped (#229 / PR #230) — H1–H6 open
**Date:** 2026-09-15
**Owner:** @Dayron-Glez
**Reference:** a 7-app Nuxt monorepo (565 `.vue` files) with strict container/spacing review, audited alongside this repo (148 `.tsx` files in `app/`, `features/`, `shared/`, `components/`).

## Why this exists

The reference codebase is not prettier by taste — it is prettier by four mechanical rules. This audit names them, measures how far this repo sits from each, and orders the work by payoff. Each finding is meant to become its own issue.

The infrastructure is already in place here: `cn()` in `lib/utils.ts`, `tailwind-merge` 3.6, `class-variance-authority`, tokens in `@theme`, `prettier-plugin-tailwindcss`. The problem is not tooling. It is that this project's own design language does not go through it.

## The four rules worth copying

### R1. Horizontal gutters have exactly one owner

The spine is identical across all seven reference apps:

```
MainLayout > main (sidebar offset)
           > div.container            ← the ONLY place with horizontal padding
             > pages/index.vue: .py-4 ← the ONLY place with page-level vertical rhythm
               > NuxtPage > Card
```

No page defines its own `px-*` or `max-w-*`. Changing the product's gutter is a one-line edit. Margins come out tidy not because someone polices them, but because there is only one place to get them wrong.

### R2. `cn()` on every shared component, so consumer classes _merge_

All 60+ components follow one mould, without exception:

```vue
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
<div :class="cn('rounded-xl border bg-card text-card-foreground', props.class)">
```

With `twMerge(clsx(...))`, passing `class="p-4"` to a `Card` that ships `p-6` _wins_, instead of producing a collision that depends on CSS order. Nobody has to restage the base recipe to change one detail.

### R3. Variants via `cva`, never conditional strings

The button declares 11 `variant` and 7 `size` values in one table. Call sites write `variant="outline" size="icon"`. Sizes are a closed contract (`h-9 px-4 py-2`, `h-8 px-3`, `size-9`), so two buttons in two apps _cannot_ end up different heights.

### R4. `gap` on the parent, not margins on the children

See H8. This is the rule with the highest day-to-day payoff and the one this repo had drifted furthest from.

## Findings

### H1 — Every page reinvents the shell

21 `mx-auto` sites, each with its own width and gutter. **13 distinct page widths, 4 distinct gutter pairs.**

| File                                   | max-width                            | gutter                      |
| -------------------------------------- | ------------------------------------ | --------------------------- |
| `(home)/page.tsx:96`                   | `max-w-275` (1100px)                 | `px-8` / `max-[520px]:px-5` |
| `paths/page.tsx:44`                    | `max-w-[1000px]`                     | `px-7` / `max-[520px]:px-5` |
| `paths/[slug]/page.tsx:211`            | `max-w-[760px]`                      | `px-7` / `max-[520px]:px-5` |
| `playground/page.tsx:186`              | `max-w-275` (1100px)                 | `px-8` / `max-[520px]:px-5` |
| `playground/leaderboard/page.tsx:47`   | `max-w-275` + nested `max-w-[980px]` | `px-8` / `max-[520px]:px-5` |
| `playground/[slug]/page.tsx:135`       | `max-w-[1320px]`                     | `px-7` / `max-[520px]:px-5` |
| `playground/[slug]/active/page.tsx:86` | `max-w-[520px]`                      | `px-5`                      |
| `.../active/result/page.tsx:350`       | `max-w-[900px]`                      | `px-7` / `max-[520px]:px-5` |
| `u/[username]/page.tsx:159`            | `max-w-215` (860px)                  | `px-7` / `max-[520px]:px-5` |
| `shared/Footer.tsx:26`                 | `max-w-300` (1200px)                 | `px-8` / `max-[520px]:px-5` |
| `shared/Nav.tsx:66`                    | `max-w-350` (1400px)                 | `px-4` / `max-[520px]:px-3` |
| `features/auth/.../AuthShell.tsx:20`   | `max-w-[1440px]`                     | —                           |

The visible consequence: `Nav` (1400px, `px-4`) and `Footer` (1200px, `px-8`) do not align with the home `main` (1100px, `px-8`). Three different vertical columns on one screen.

Two spellings also exist for the same value: `max-w-275` = `max-w-[1100px]`, and `max-w-330` = `max-w-[1320px]`.

**Fix:** one `<PageShell>` with two or three named widths (`prose` 760, `default` 1100, `wide` 1320) as the only place in the repo carrying `mx-auto`, `max-w-*` and `px-*`. Everything else becomes `w-full`. The section-level margins left out of H8 belong here too.

### H2 — Own components replace classes instead of merging them

`features/playground/components/ChallengeLayout.tsx:19-27` uses default parameters, so passing the prop wipes the whole recipe:

```tsx
mainClassName = DEFAULT_MAIN_CLASS,
containerClassName = DEFAULT_CONTAINER_CLASS,
```

The consequence is already in the tree. `TestingChallengeView.tsx:89` passes a `containerClassName` that is byte-for-byte the default except `max-w-330` instead of `max-w-[1320px]` — **the same 1320px**. It is an override that changes nothing, written because there was no way to add a class without retyping the chain. `gridClassName` has the same shape: the full string is retyped to add `grid-rows-1`.

**Fix:** `className={cn(DEFAULT_CONTAINER_CLASS, containerClassName)}`. `TestingChallengeView` then drops to `gridClassName="grid-rows-1 max-[900px]:grid-rows-none"`, and the dead `containerClassName` override goes away.

### H3 — Type does not use a scale

**387 arbitrary font sizes against 62 named ones — 86%.** 31 distinct sizes, with half-pixel steps:

```
text-[11px] ×65   text-[12px] ×48   text-[11.5px] ×46   text-[13px] ×34
text-[10.5px] ×28 text-[13.5px] ×25 text-[12.5px] ×25   text-[14px] ×24
text-[10px] ×17   text-[15px] ×9    text-[14.5px] ×7    text-[9.5px] ×1
```

`10 / 10.5 / 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 14.5 / 15 / 15.5` is not a scale — it is twelve independent decisions nobody can reproduce or recall.

**Fix:** declare the real scale in `@theme` (`--text-micro`, `--text-meta`, `--text-body`…) and substitute. Display sizes (`text-[42px]`, `text-[52px]`) can stay arbitrary: they are one-offs, not vocabulary.

### H4 — 214 arbitrary breakpoints, and the repo ignores its own convention

```
max-[520px]: ×81   max-[900px]: ×31   max-[640px]: ×31   max-[980px]: ×24
min-[901px]: ×17   max-[760px]: ×14   max-[1100px]: ×6   max-[420px]: ×4
min-[641px]: ×3    max-[600px]: ×1    min-[640px]: ×1    min-[520px]: ×1
```

Against 26 named variants (`sm:` ×22, `lg:` ×2, `max-workspace:` ×2).

1. **The repo already knows how and does not apply it.** `app/global.css` declares `--breakpoint-workspace: 900px`, yet `max-[900px]:` appears **31 times** and `max-workspace:` only twice.
2. **There are latent off-by-one bugs.** `max-[640px]:` coexists with `min-[640px]:` — at exactly 640px _both_ apply. Same for `max-[900px]` / `min-[901px]`.

**Fix:** name the four real breakpoints in `@theme` (`--breakpoint-narrow: 520px`, `--breakpoint-compact: 640px`, `--breakpoint-workspace: 900px`, `--breakpoint-wide: 980px`) and migrate. Clears the off-by-one on the way.

### H5 — The card and the eyebrow are copied recipes, not components

`border-line bg-bg-card rounded-(--r-12) border` appears ~15 times, each with its own padding: `p-5`, `p-6`, `p-3.5`, `p-[18px]`, `px-7 pt-7 pb-6`, `px-[22px] py-5`, `px-[18px] py-4`, `px-5 py-4`. The reference has exactly one `Card` with one `p-6`.

The eyebrow (small `font-mono uppercase`) is reimplemented in ~20 places with **5 different `tracking` values** (0.04 / 0.06 / 0.08 / 0.1 / 0.12em) and **5 sizes** (`10px`, `10.5px`, `11px`, `11.5px`, `text-xs`).

**Fix, revised once the sites were read one by one:** `<Eyebrow>` in `shared/`, with `cva` for tone and size. Shipped in #238 (the identical strings) and #240 (the variants), which also collapsed eight tracking values onto one and extracted `AuthPanel` from three near-identical auth cards.

**`<Surface>` was dropped, and the claim above is where this audit was wrong.** "~15 copies with 8 paddings" came from grepping `bg-bg-card`. Reading the matches individually, they are not one component: cards, chips, toolbar buttons, dialogs, icon tiles and padding-less containers, sharing only a background colour. Forcing them behind one component with padding and radius variants would be a leaky abstraction — worse than the duplication it replaces. The owner agreed to drop it (2026-09-15).

The lesson generalises: a grep counts strings, not roles. Before extracting a component from a repeated class string, read the call sites and check they are the same thing.

### H6 — Two token systems in parallel, one not theme-aware

`app/global.css` maintains both the fumadocs HSL bridge (`--color-background`, `--color-card`…) with `:root` **and** `.dark` blocks, and the landing's own tokens (`--color-bg`, `--color-bg-card`, `--color-fg`, `--color-line`…) as fixed hex with no light variant.

The site is dark-only, so the light `:root` block is dead weight that misleads: a new component using `bg-card` will not match one using `bg-bg-card`, with nothing to warn you. `--r-6/8/10/12/16` also duplicate Tailwind's `rounded-*`.

**Fix:** pick one canonical system and map the other onto it. Not urgent, but every new component grows the problem.

### H7 — Checked and dismissed

Raw hex values that duplicate tokens (`#eceef1`, `#b7bcc4`, `#14171b`…) live **only** in `app/og/u/[username]/route.tsx` (Satori does not resolve `var()`), `ConfettiEffect.tsx` (canvas) and `DiffView.tsx` (Monaco theme). These are JS consumers, not CSS — literals are correct there. The only real risk is drifting from the token, which a pointing comment covers.

### H8 — Spacing came from the children, not the container — **shipped in PR #230**

The rule: **a stack is spaced with `gap` on the container; no child carries a margin.**

|                       | reference (565 files) | openbranch, before (148 files) |
| --------------------- | --------------------- | ------------------------------ |
| `gap-*` / `space-*`   | 1,836                 | 352                            |
| margins               | 529                   | 243                            |
| **`gap` share**       | **77.6%**             | **59%**                        |
| `m-0` / `mt-0` resets | **5**                 | **70**                         |

**The resets were dead code, and the first diagnosis of why was wrong.** The initial guess was that the fumadocs preset added margins that each component then cancelled. It does not. Tailwind v4 preflight already applies `* { margin: 0 }` (`node_modules/tailwindcss/preflight.css:7-16`), and the typography plugin emits every selector as `:where(.prose <sel>):not(:where([class~="not-prose"], …))` — scoped to `.prose`, excluded under `not-prose`, and specificity 0. The only two `.tsx` components rendered inside MDX (`CopyTemplate`, `MaturityFilter`) are already wrapped in `not-prose`.

So the fix was deletion, not a `global.css` override. 63 classes removed; 7 kept where they genuinely override a component's own classes.

The anti-pattern the rule replaces, from `result/page.tsx`:

```tsx
<div>
  <p className="text-fg-muted mb-1 …">{label}</p>
  <p className="text-fg mb-0.5 …">{name}</p>
  <p className="text-fg-2 …">{description}</p> ← the last one carries none
</div>
```

Three hand-tuned values plus an implicit, fragile rule ("the last child gets no `mb`") that breaks the moment someone reorders, wraps a child in a conditional, or appends a fourth. With `gap` it is one decision per container, conditionals stop producing double or missing gaps, and margin collapsing disappears (`gap` does not collapse; sibling `mb` in normal flow does).

**Still open from H8:** section-level margins (`mb-8`/`mb-10`/`mb-14`/`mb-16`). Spacing between those siblings is uneven too — `playground/page.tsx` alone has `mb-4.5`, `mb-10`, `mb-10` — so a single `gap` on `<main>` will not reproduce it. It is a design decision, and it belongs with H1.

**Agreed `gap` scale:** `gap-1` within text · `gap-4` within a card · `gap-8` between blocks · `gap-25` between sections.

## Order of work

| #   | Work                                                     | Payoff                                    | Risk                           |
| --- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------ |
| ✅  | Remove dead resets + migrate text stacks (H8)            | done — PR #230                            | —                              |
| 1   | One `<PageShell>`, align Nav/Footer/main (H1)            | High — this is the "tidy margins" outcome | Low, visual and verifiable     |
| 2   | `cn()` in `ChallengeLayout`, drop the dead override (H2) | High — unblocks the rest                  | Very low                       |
| 3   | Name the four breakpoints and migrate (H4)               | High, mechanical                          | Low; fixes the off-by-one      |
| ✅  | `<Eyebrow>` with `cva` (H5) — `<Surface>` dropped        | done — #239, #240                         | —                              |
| 5   | Type scale in `@theme` (H3)                              | High but the largest                      | Medium-high, 387 substitutions |
| 6   | Unify the two token systems (H6)                         | Medium, preventive                        | Medium                         |

## What not to copy from the reference

- `h-[calc(100vh - Npx)]` with a magic N — ~60 distinct variants there (150, 200, 240, 245, 280, 300, 315, 320, 380, 390…). That is the symptom of not distributing height with flex/grid, and it is debt, not a pattern.
- Tailwind v3's `theme.container`. In v4 the natural unit is a `<PageShell>` component, not config.
- Pug class chains (`.flex.flex-row.items-center`) — not applicable in JSX, and they would defeat `prettier-plugin-tailwindcss`, which this repo already runs.

## Counting caveat

`grep '\bmb-0\b'` also matches `mb-0.5` — the `\b` falls between `0` and `.`. An early count of 82 resets was really 70. Use `grep -P` with `(?![.0-9])`.
