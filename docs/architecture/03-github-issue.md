# GitHub Issue (ready to paste)

> Copy everything below the line into a new GitHub issue. Suggested title:
> **`refactor(architecture): adopt feature-first structure, unify challenge tracks & contracts`**
> Suggested labels: `architecture`, `refactor`, `tech-debt`, `epic`.

---

## Summary

The repository is organized by technical type (`components/`, `lib/`, `app/`) rather than by
domain. As a result the **Playground** — the most complex feature — is spread across six
top-level directories, and its five challenge tracks (code-review, bug-fix, testing, git,
documentation) were each added by copy-and-adapt. This produced five parallel registries, five
parallel server actions with duplicated badge logic, and category/icon/badge maps duplicated
across 4–5 files. Some domain contracts even live _inside_ React components that `lib/` then
imports back, inverting the dependency direction.

This epic introduces a **feature-first architecture** with a single source of truth per concern,
executed as small, non-breaking, incremental phases.

Full analysis: [`docs/architecture/01-assessment-report.md`](01-assessment-report.md).
Phased plan: [`docs/architecture/02-refactoring-roadmap.md`](02-refactoring-roadmap.md).

## Background / motivation

The code is clean at the file level (strict TS, arrow functions, low complexity), but the
_module architecture_ doesn't scale:

- **Add a challenge track today ≈ edits in ~8 files** across 4 directories, plus hand-synced
  category/icon/badge maps.
- **Consistency is maintained manually** and is already drifting (e.g., badge keys `streak-7` and
  `all-tracks` exist in the UI but no action awards them).
- **`lib/` imports from `components/`** (`DiffFile` from `DiffViewer`), a dependency inversion and
  circular-risk seam.
- **The structure screams "Next.js," not "openbranch."** Onboarding requires a mental join across
  `app/[lang]/playground`, `app/actions/playground.ts`, `components/playground`, `lib/playground`,
  `content/playground`, and `supabase/migrations`.

## Objectives

1. Reorganize toward a **feature-first** layout (`features/playground`, `features/docs`,
   `features/home`, `shared/`, `components/ui`).
2. Establish a **single challenge-track manifest** as the source of truth for category, icon,
   badge, and slug-prefix.
3. Collapse the **five registries** into one generic factory.
4. Consolidate the **five server actions** and duplicated **badge policy** into one service.
5. Create a discoverable **`domain/` contracts layer**; remove the `lib → components` inversion.
6. Introduce a **`ChallengeLayout` shell + `useChallengeSubmit` hook**.
7. De-duplicate shared UI (**Logo**, **ScrollReveal**) and adopt a **shadcn/ui-first** policy.
8. Fix config inconsistencies (`iconLibrary`, dead `@/hooks` alias) and add a lint guard on
   dependency direction.

## Scope

**In scope**

- Repository structure, folder organization, feature boundaries.
- Playground module redesign (registries, actions, manifest, view shell).
- TypeScript contracts strategy (`domain/` per feature).
- Reusable UI component strategy + shadcn-first policy.
- Dependency-direction documentation and enforcement.

**Out of scope (intentionally excluded)**

- No new product features or challenge tracks.
- No public route/URL changes.
- No Supabase schema/migration changes (except where a phase explicitly targets persistence and
  preserves data).
- No visual redesign — refactors must be behavior- and pixel-preserving.
- No dependency upgrades unrelated to the refactor.

## Acceptance criteria

- [ ] Repository structure reviewed and a target feature-first layout documented.
- [ ] `lib/** → components/**` dependency inversion removed (`DiffFile` moved to `domain/`).
- [ ] ESLint rule forbids `lib/** → components/**` (and `shared → features`) imports.
- [ ] Single **challenge-track manifest** is the only declaration of category↔icon↔badge↔prefix.
- [ ] `playground/page.tsx`, `playground/[slug]/page.tsx`, `challenge-icons.tsx`, and
      `BadgesSection.tsx` derive from the manifest (no duplicated maps).
- [ ] Five registries replaced by one generic `createChallengeRegistry`.
- [ ] Five server actions + badge logic consolidated into a session/badge service; the
      `app/actions/playground.ts` facade keeps stable signatures.
- [ ] `domain/` contracts layer exists per feature; per-track `types.ts`, snapshot DTOs, and
      template shapes consolidated (shared `TemplateFile` type extracted).
- [ ] `ChallengeLayout` shell + `useChallengeSubmit` hook adopted by all five views;
      `data-pg-main` preserved on every challenge `<main>`.
- [ ] Duplicate `Logo`/`LogoMark` merged; duplicate `ScrollReveal`/`DocsScrollReveal` merged.
- [ ] shadcn/ui-first component policy documented (`components/README.md`).
- [ ] `components.json` corrected (`iconLibrary`, `hooks` alias); dead badge keys resolved.
- [ ] Feature-first relocation completed (`features/*`, `shared/`, slim `lib/`).
- [ ] Migration roadmap completed; every phase left `main` green (`types:check`, `lint`, build).

## Deliverables

- `docs/architecture/01-assessment-report.md` — assessment (✅ produced).
- `docs/architecture/02-refactoring-roadmap.md` — phased plan (✅ produced).
- This issue (epic) + one tracking issue/PR per phase.
- `components/README.md` — component placement + shadcn-first policy (Phase 6).
- ESLint dependency-direction rule (Phase 0).

## Proposed phases (each = its own PR, non-breaking)

- [ ] **Phase 0** — Guardrails & quick wins: fix `components.json`, resolve dead badge keys, add
      dependency-direction lint rule.
- [ ] **Phase 1** — `domain/` contracts layer; move `DiffFile` out of the component; consolidate
      scattered types behind re-export shims.
- [ ] **Phase 2** — Challenge-track manifest; refactor category/icon/badge consumers to derive.
- [ ] **Phase 3** — Generic registry; delete the five registry files.
- [ ] **Phase 4** — Session/badge service; thin `app/actions/playground.ts` facade.
- [ ] **Phase 5** — `ChallengeLayout` shell + `useChallengeSubmit`; migrate all five views.
- [ ] **Phase 6** — Merge duplicate UI; shadcn-first audit & policy doc (parallelizable).
- [ ] **Phase 7** — Feature-first relocation (last; one PR per feature).

## Notes / implementation considerations

- Use TS path aliases + re-export shims so moves don't force mass import rewrites in a single PR.
- Keep exported server-action names/signatures identical through Phase 4 to protect the
  `"use server"` boundary.
- **Phase 4 is the highest-risk** (auth + persistence + redirects + badges) — add a per-track
  parity checklist and smoke-test one challenge per track before merge.
- Preserve `data-pg-main` on every challenge `<main>` (required by the GSAP page transition).

## Constraints

This epic is **architecture + planning + incremental refactor**. It must not change public
behavior, routes, schema, or visuals. Each phase ships independently and reversibly; no big-bang
PR. Every recommendation is justified in the assessment report with concrete file references.
