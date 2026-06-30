# Next Steps — Handoff for the Feature-First Refactor

> Status: Living doc · Date: 2026-06-30
> Companion to the validation review [`05-validation-report.md`](05-validation-report.md).
> Purpose: let a fresh session pick up the refactor with zero re-derivation.

## Where we are (as of 2026-06-30)

The feature-first refactor (issue [#97](https://github.com/Dayron-Glez/openbranch/issues/97)) is
~90% done. `main` is green (`types:check`, `lint`, production build, SonarCloud 0.0% duplication).

**Merged:**

- Phases 0–6 (PR #96 series) — guardrails, domain layer, manifest, generic registry, server/badge
  service, challenge-view shell, shared-UI dedup.
- Phase 7a (PR #100) — relocate playground code into `features/playground/`.
- Orphan cleanup (PR #101) — removed 23 duplicate dead files the 7a `git mv` left in
  `lib/playground/`; reverted the masking SonarCloud exclusions. **Lesson logged as R9 in the
  validation report.**

**Current structure on main:**

```
features/playground/   ← domain, challenges, registry, server, components, hooks (single source)
components/            ← ui/, nav/, docs/, home/, shared/   (docs/home/shared/nav not yet moved)
lib/                   ← cross-cutting infra + lib/playground-source.ts, lib/playground-dictionary.ts
                         (lib/playground/ directory is GONE)
```

## Remaining work (recommended order)

### 1. Harden the Phase 7 checklist (P2 + P3) — do this first, it's ~5 min

Before 7b/7c, add to the plan's per-PR checklist so we don't repeat the 7a failures:

- [ ] `git ls-files <old-path>` returns **0** after the move (asserts origin actually deleted — the R9 lesson).
- [ ] `grep`/`rg` for **string** references to old paths (Worker `new URL(...)`, assets, config) — `tsc` does NOT catch these.
- [ ] `bun run build` (real production build, not just `types:check`).
- [ ] SonarCloud quality gate green (it's a required check; not in the original DoD).

### 2. Phase 7b — `features/docs/` + `features/home/` (one PR)

```bash
git mv components/docs features/docs/components
git mv components/home features/home/components
git mv lib/hooks features/home/hooks
```

- Update imports: `app/[lang]/docs/*`, `app/[lang]/(home)/*`, `lib/layout.shared.tsx`.
- Watch for: string references (P2), and `lib/hooks` consumers.

### 3. Phase 7c — `shared/` + slim `lib/` + guards (one PR)

```bash
git mv components/shared shared
# decide: components/nav → shared/nav or features/nav (currently undecided)
```

- Add ESLint `no-restricted-imports` for old paths (`@/components/{docs,home,shared}/**`, `@/lib/playground/**`).
- **P5:** add an inter-feature guard (`features/A ↮ features/B`) via `import/no-restricted-paths` zones.
- **P7:** confirm no re-export shims remain; remove any temporary exclusions.

### 4. Tests (P1) — separate epic, before any behavior change

Not blocking for 7b/7c (pure relocation). Required before touching server actions / badge policy
/ adding a track again. Suggested: characterization tests for the 5 server actions + 1 Playwright
E2E per track. Coverage is currently 0 by design.

## Durable improvements from the review (apply opportunistically)

- **P4** — pin the manifest as _data-only_; document the server/client boundary (avoids the
  manifest becoming a coupling hub that drags client code into server bundles).
- **P6** — decide whether `content/playground` and `supabase/migrations` join the feature or stay
  out (and document why). The "feature smeared across 6 dirs" problem is only partly solved.
- **P8** — record the `src/` decision (kept root) and a short alternatives note.

## House rules (do not violate)

- No `Co-Authored-By` in commits.
- Show generated content before committing — always, even small changes.
- Atomic commits; merge commits (not squash) when integrating PRs.
- Branch first; never commit straight to `main`.
- GitHub (issues/PRs/comments) in English; conversation in Spanish.
- Preserve `data-pg-main` on every challenge `<main>` (GSAP page transition).
- Review the full SonarCloud report on every PR, not just the green check.
