# Phase 7 — Feature-first physical relocation: implementation plan

> Issue: [#97](https://github.com/Dayron-Glez/openbranch/issues/97)  
> Branch: `97-refactor-feature-first-relocation`  
> Depends on: Phases 1–6 (PR #96, merged)

Translates the roadmap Phase 7 section into executable steps.
Each sub-phase maps to one PR; each PR must pass `bun run types:check && bun run lint` before merge.

---

## Pre-conditions (already met)

- Domain layer in `lib/playground/domain/` ✅
- Manifest (`CHALLENGE_TRACKS`) ✅
- Registry factory (`createChallengeRegistry`) ✅
- Session service (`lib/playground/session-service.ts`) ✅
- `ChallengeLayout` + `useChallengeSubmit` in `components/playground/` ✅
- ESLint dependency-direction guard (`lib → components` = error) ✅

---

## Sub-phase 7a — `features/playground/` (PR A)

**Goal:** all playground-specific code lives under one root.

### Target tree

```
features/playground/
  domain/                 ← lib/playground/domain/
  challenges/
    code-review/
      diff-registry.ts    ← lib/playground/diff-registry.ts
      diffs/              ← lib/playground/diffs/
    bug-fix/
      sandpack-registry.ts   ← lib/playground/sandpack-registry.ts
      sandpack-templates/    ← lib/playground/sandpack-templates/
    testing/
      testing-registry.ts    ← lib/playground/testing-registry.ts
      test-runner.worker.ts  ← lib/playground/test-runner.worker.ts
    git/
      git-registry.ts     ← lib/playground/git-registry.ts
      git-templates/      ← lib/playground/git-templates/
      diff3.ts            ← lib/playground/diff3.ts
    documentation/
      docs-registry.ts    ← lib/playground/docs-registry.ts
      docs-templates/     ← lib/playground/docs-templates/
  registry/
    create-registry.ts    ← lib/playground/create-registry.ts
  server/
    session-service.ts    ← lib/playground/session-service.ts
  components/             ← components/playground/
  hooks/
    useChallengeSubmit.ts ← components/playground/useChallengeSubmit.ts (extracted)
  domain/ (types)
    review-types.ts       ← lib/playground/review-types.ts
    docs-types.ts         ← lib/playground/docs-types.ts
    challenge-icons.tsx   ← lib/playground/challenge-icons.tsx
```

### Files that stay in `lib/`

- `lib/playground/playground-source.ts` — used by multiple routes, stays in `lib/`
- `lib/playground/monacoTheme.ts` — moves with `components/playground/`
- `lib/playground/formatTypeScript.ts` — moves with `components/playground/`

### Import updates required

| Consumer                                       | Old import                         | New import                                     |
| ---------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| `app/[lang]/playground/page.tsx`               | `@/lib/playground/...`             | `@/features/playground/...`                    |
| `app/[lang]/playground/[slug]/page.tsx`        | `@/lib/playground/...`             | `@/features/playground/...`                    |
| `app/[lang]/playground/[slug]/active/page.tsx` | `@/lib/playground/...`             | `@/features/playground/...`                    |
| `app/actions/playground.ts`                    | `@/lib/playground/session-service` | `@/features/playground/server/session-service` |
| `components/playground/**`                     | `@/lib/playground/...`             | `@/features/playground/...`                    |

### Steps

```bash
# 1. Create target directories
mkdir -p features/playground/{domain,challenges/{code-review/diffs,bug-fix/sandpack-templates,testing,git/git-templates,documentation/docs-templates},registry,server,hooks}

# 2. Move domain layer
git mv lib/playground/domain features/playground/domain

# 3. Move domain types
git mv lib/playground/review-types.ts features/playground/domain/
git mv lib/playground/docs-types.ts features/playground/domain/
git mv lib/playground/challenge-icons.tsx features/playground/domain/

# 4. Move challenge assets — registries + templates
git mv lib/playground/diff-registry.ts features/playground/challenges/code-review/
git mv lib/playground/diffs features/playground/challenges/code-review/
git mv lib/playground/sandpack-registry.ts features/playground/challenges/bug-fix/
git mv lib/playground/sandpack-templates features/playground/challenges/bug-fix/
git mv lib/playground/testing-registry.ts features/playground/challenges/testing/
git mv lib/playground/test-runner.worker.ts features/playground/challenges/testing/
git mv lib/playground/git-registry.ts features/playground/challenges/git/
git mv lib/playground/git-templates features/playground/challenges/git/
git mv lib/playground/diff3.ts features/playground/challenges/git/
git mv lib/playground/docs-registry.ts features/playground/challenges/documentation/
git mv lib/playground/docs-templates features/playground/challenges/documentation/

# 5. Move registry factory + server service
git mv lib/playground/create-registry.ts features/playground/registry/
git mv lib/playground/session-service.ts features/playground/server/

# 6. Move components (replaces components/playground/)
git mv components/playground features/playground/components

# 7. Extract hook out of components into hooks/
git mv features/playground/components/useChallengeSubmit.ts features/playground/hooks/

# 8. Batch-replace all imports
#    @/lib/playground/  →  @/features/playground/
#    @/components/playground/  →  @/features/playground/components/
#    (IDE find-replace or script)

# 9. Verify
bun run types:check && bun run lint
```

---

## Sub-phase 7b — `features/docs/` + `features/home/` (PR B)

### Moves

```bash
git mv components/docs features/docs/components
git mv components/home features/home/components
git mv lib/hooks features/home/hooks
```

### Import updates

- `app/[lang]/docs/layout.tsx` → `@/features/docs/components/...`
- `app/[lang]/docs/[[...slug]]/page.tsx` → `@/features/docs/components/...`
- `app/[lang]/(home)/page.tsx` → `@/features/home/components/...`
- `lib/layout.shared.tsx` → update docs/nav component imports

---

## Sub-phase 7c — `shared/` + slim `lib/` (PR C)

### Moves

```bash
git mv components/shared shared
# components/nav: move to shared/nav or features/nav (decide at execution time)
```

### `lib/` after cleanup (only cross-cutting infra remains)

```
lib/
  supabase/
  constants.ts
  github-stars.ts
  i18n.ts
  i18n.ui.ts
  landing-dictionary.ts
  layout.shared.tsx
  maturity.ts
  playground-dictionary.ts
  playground-source.ts
  reading-time.ts
  section-stats.ts
  shared.ts
  source.ts
  suggest-url.ts
  utils.ts
  weekly-pick.ts
```

### ESLint guard update (add in this PR)

```js
// eslint.config.mjs
"no-restricted-imports": ["error", {
  patterns: [
    { group: ["@/lib/playground/**"], message: "Use @/features/playground/..." },
    { group: ["@/components/playground/**"], message: "Use @/features/playground/components/..." },
    { group: ["@/components/docs/**"], message: "Use @/features/docs/components/..." },
    { group: ["@/components/home/**"], message: "Use @/features/home/components/..." },
    { group: ["@/components/shared/**"], message: "Use @/shared/..." },
  ]
}]
```

---

## Risk register

| Risk                                                                 | Mitigation                                                             |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 60+ files renamed, large diff                                        | One PR per sub-phase; `tsc` catches every broken path                  |
| Windows case-insensitive FS                                          | Use `git mv` exclusively; two-step renames for case-only changes       |
| Merge conflicts from concurrent feature work                         | Execute in a quiet window; no parallel feature PRs                     |
| `app/actions/playground.ts` stays in `app/`                          | Server action boundary must remain in `app/` — only service moves      |
| `monacoTheme.ts` / `formatTypeScript.ts` in `components/playground/` | Move with `components/playground/` → `features/playground/components/` |

---

## Checklist (per PR)

- [ ] `bun run types:check` passes
- [ ] `bun run lint` passes (0 warnings)
- [ ] SonarCloud quality gate green before merge
- [ ] Manual smoke test: one challenge per affected track on localhost:3000
- [ ] No old import paths remain in the codebase (grep to confirm)
