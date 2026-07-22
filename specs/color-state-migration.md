# Spec: State Token Migration + Docs Callouts (Color System — Surface 3 of 4)

**Status:** Ready to implement
**Date:** 2026-07-22
**Parent brief:** `specs/color-system.md`
**Prior surfaces:** tokens+badge (#129), pill/filter/card (#131), card glow-hover (#135), filter bar shell/slide (#139)

## What ships

Layer A from the original brief: **rationalize, don't invent.** Ad-hoc Tailwind-palette classes (`amber-*`, `red-*`, `rose-*`) that signal in-progress/error/removed state get migrated onto the existing `--color-warn`/`--color-danger` tokens (already in `@theme` since before this initiative; `-soft`/`-ring`/`-ink` variants added in #129). Docs callouts get the same tokens via a small Fumadocs bridge — no MDX changes required.

## Precedent already in the codebase

`DiffViewer.tsx`, `PrPreviewCard.tsx`, and part of `BugFixChallengeView.tsx` **already** use `text-danger`, `bg-danger/[0.07]`, `text-warn` correctly — proof that Tailwind v4's opacity modifier (`/N`) works on any custom `@theme` color, not just the built-in palette. The migration below follows that exact pattern: swap the utility name, **keep the existing opacity modifier as-is** (e.g. `red-500/[0.03]` → `danger/[0.03]`), so visual weight is preserved exactly — this is a rename, not a redesign.

## File-by-file mapping

| File                                                                                          | Ad-hoc classes                                                                                         | → Token                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `app/[lang]/playground/[slug]/page.tsx` (in-progress status badge)                            | `text-amber-400`, `bg-amber-400`                                                                       | `text-warn`, `bg-warn`                                                        |
| `features/playground/components/ChallengeCard.tsx` (`statusTextClass`/`statusDotClass`)       | `text-amber-400`, `bg-amber-400`                                                                       | `text-warn`, `bg-warn`                                                        |
| `features/playground/components/PlaygroundBreadcrumb.tsx`                                     | `text-amber-400`, `bg-amber-400`                                                                       | `text-warn`, `bg-warn`                                                        |
| `features/playground/components/BugFixChallengeView.tsx` (solution reveal border/badge)       | `border-amber-500/40`, `border-amber-500/30 bg-amber-500/[0.04]`, `bg-amber-500/15 ... text-amber-400` | `border-warn/40`, `border-warn/30 bg-warn/[0.04]`, `bg-warn/15 ... text-warn` |
| `features/playground/components/BugFixChallengeView.tsx` (removed-line label + failure panel) | `text-red-400`, `bg-red-400`, `border-red-500/20 bg-red-500/[0.03]`                                    | `text-danger`, `bg-danger`, `border-danger/20 bg-danger/[0.03]`               |
| `features/playground/components/DiffView.tsx` (removed row/marker/content)                    | `bg-red-500/[0.08]`, `text-red-400`, `text-red-300/80`                                                 | `bg-danger/[0.08]`, `text-danger`, `text-danger/80`                           |
| `features/playground/components/git/GitFooterBar.tsx` (error dot/value)                       | `bg-red-400`, `text-red-400`                                                                           | `bg-danger`, `text-danger`                                                    |
| `features/playground/components/git/MergeEditorPane.tsx` (solution border)                    | `border-amber-500/40`                                                                                  | `border-warn/40`                                                              |
| `features/playground/components/git/MergeEditorToolbar.tsx` (solution border/badge)           | `border-amber-500/30 bg-amber-500/[0.04]`, `bg-amber-500/15 ... text-amber-400`                        | `border-warn/30 bg-warn/[0.04]`, `bg-warn/15 ... text-warn`                   |
| `features/playground/components/testing/EditorPane.tsx` (solution border)                     | `border-amber-500/40`                                                                                  | `border-warn/40`                                                              |
| `features/playground/components/testing/EditorToolbar.tsx` (solution border/badge)            | `border-amber-500/30 bg-amber-500/[0.04]`, `bg-amber-500/15 ... text-amber-400`                        | `border-warn/30 bg-warn/[0.04]`, `bg-warn/15 ... text-warn`                   |
| `features/playground/components/testing/StatusBanners.tsx` (need-more-tests banner)           | `border-amber-500/20 bg-amber-500/[0.04]`, `text-amber-400`                                            | `border-warn/20 bg-warn/[0.04]`, `text-warn`                                  |
| `features/playground/components/TestCard.tsx` (failure marker background)                     | `bg-red-500/10`, `bg-red-500/4`                                                                        | `bg-danger/10`, `bg-danger/4`                                                 |
| `features/playground/components/testing/TestsPanel.tsx` (failure summary panel)               | `border-red-500/20 bg-red-500/[0.03]`                                                                  | `border-danger/20 bg-danger/[0.03]`                                           |

## Explicitly out of scope

- **`shared/Nav.tsx` and `features/playground/components/PlaygroundNav.tsx`** — `fill-amber-400 stroke-amber-400` on the GitHub star icon. This is decorative (matching GitHub's own star color), not a semantic state signal — not part of this migration.
- **`features/playground/components/git/ThreeWayMergeEditor.tsx`** — per the original brief, this runs its own self-contained `sky/amber/emerald/rose/zinc` IDE theme. Its amber/rose usages are woven into that bespoke look; forcing them onto `warn`/`danger` would fight the sub-theme's own internal consistency for no real gain. Left untouched, as the brief anticipated.
- **`ConfettiEffect.tsx`** — decorative celebration colors, explicitly exempted by the original brief.

## Docs callouts — a bridge, not a rewrite

Fumadocs' `<Callout>` (from `fumadocs-ui/mdx`, used as-is via `getMDXComponents()` — no wrapper in this repo) resolves its icon/accent color from `var(--color-fd-${type}, var(--color-fd-muted))`, where `type` is `info | warning | error | success` (aliases: `warn` → `warning`, `tip` → `info`). Those four variables are declared in Fumadocs' own `@theme static` block (`default-colors.css`) with Fumadocs' default palette — unrelated to openbranch's tokens.

Since Tailwind v4 merges `@theme` blocks in file order and our own blocks in `app/global.css` come after the imported Fumadocs preset, redeclaring the same four variable names bridges them to our tokens with **zero MDX or component changes** — every existing and future `<Callout type="...">` across all docs pages picks it up automatically:

```css
@theme {
  --color-fd-info: var(--color-info);
  --color-fd-warning: var(--color-warn);
  --color-fd-error: var(--color-danger);
  --color-fd-success: var(--color-ob-accent);
}
```

(`--color-fd-success` bridged to our green for the same "one source of truth" reason, even though Fumadocs' default success green already sits almost exactly on our hue — 149.58° vs our 148°.)

## Acceptance criteria

- Every file in the mapping table above uses `warn`/`danger` token utilities with the same opacity modifiers the ad-hoc classes had — no visual weight change, just the correct source of truth.
- `ThreeWayMergeEditor.tsx`, the two star icons, and `ConfettiEffect.tsx` are untouched.
- A docs page with an `info`, `warning`/`warn`, and `error` callout (e.g. via a quick MDX test block, or an existing page that already has one) renders with openbranch's tokens, not Fumadocs' defaults.
- No new ad-hoc hex or Tailwind-palette color introduced anywhere in the diff.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): trigger an in-progress challenge (amber status), a failing test (red), a bug-fix "show solution" reveal (amber), and view a docs page with callouts.

## Action plan (single PR, grouped by area)

1. Issue `feat(playground): migrate ad-hoc state colors to warn/danger tokens + docs callouts (color system, surface 3/4)` + branch `<N>-color-state-migration`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: challenge status badges (`ChallengeCard.tsx`, `[slug]/page.tsx`, `PlaygroundBreadcrumb.tsx`).
4. Commit 3 — `feat(playground)`: bug-fix challenge view + diff view (`BugFixChallengeView.tsx`, `DiffView.tsx`).
5. Commit 4 — `feat(playground)`: git panel (`GitFooterBar.tsx`, `MergeEditorPane.tsx`, `MergeEditorToolbar.tsx`).
6. Commit 5 — `feat(playground)`: testing panel (`EditorPane.tsx`, `EditorToolbar.tsx`, `StatusBanners.tsx`, `TestCard.tsx`, `TestsPanel.tsx`).
7. Commit 6 — `feat(docs)`: Fumadocs callout token bridge in `app/global.css`.
8. Checks + full SonarCloud report; owner verifies visually on localhost.
9. Merge (merge commit).
