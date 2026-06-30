# Architecture Proposal — Validation Report & Gap Analysis

> Status: Draft · Type: Independent Architecture Review · Date: 2026-06-30
> Reviews: [`01-assessment-report.md`](01-assessment-report.md), [`02-refactoring-roadmap.md`](02-refactoring-roadmap.md), [`03-github-issue.md`](03-github-issue.md), [`04-phase7-plan.md`](04-phase7-plan.md)
> **Analysis only — no production code or prior document was modified by this review.**

This is an independent senior-architect review of the existing architecture proposal,
evaluating whether it satisfies its own requirements and the stated architectural principles.

## Method & caveats

- **"Original specification":** not a tracked file — it was the prompt that generated report 01.
  Its requirements are reconstructed from the deliverable set and the issue's acceptance criteria.
- **"Evaluate only documentation":** the review stays on the documents. Where real execution
  (phases 0–7a, merged) exposes a _documentation_ gap, it is cited as _corroborating evidence_,
  not as a code critique — because it reveals an omission in the document, which is in scope.

---

## 1. Executive summary

The proposal is **high quality**: a precise diagnosis with file/line references, sound application
of principles, and a logical-before-physical sequencing that is exactly the right order for a
low-risk structural refactor. The central artifact — the _challenge-track manifest_ as the single
source of truth — is the correct design decision and the best idea in the set.

An independent review nevertheless finds **four real weaknesses the documents do not acknowledge**:

1. **No automated safety net.** The whole refactor — including Phase 4, which the document itself
   marks highest-risk (auth + persistence + badges + redirects) — relies on `tsc` + `lint` +
   _manual smoke test_. Test coverage is zero by design (`sonar.coverage.exclusions=**/*`).
   Refactoring persistence logic without characterization tests is the biggest gap.
2. **The premise "tsc catches every broken path" is false** for non-import references
   (e.g. `new URL("…worker.ts", import.meta.url)`, resolved by Turbopack at build time). Phase 7
   repeats this as its primary guarantee. _Corroborating evidence: PR #100's Vercel build broke on
   exactly this, with `tsc` green._
3. **The real quality gate (SonarCloud) is absent from the Definition of Done.** The DoD lists
   `types:check`, `lint`, build — but the repo also enforces the SonarCloud gate, which blocks
   merges. _Corroborating evidence: PR #100 was blocked by new-code duplication, not by the DoD._
4. **Internal inconsistencies** about the manifest's contents, the residual feature smear, and a
   Phase 0→1→2 cross-reference error.

**Most severe corroboration (discovered during this review):** Phase 7a's merge left **23
duplicate dead files in `lib/playground/`** because the `git mv` _deletes_ never entered the
commit. Both `lib/playground/` and `features/playground/` shipped to `main` with identical code.
This is precisely the failure modes #2 and #3 predicted: `tsc`/build stayed green (dead code still
resolves), and the SonarCloud duplication signal that _would_ have caught it was masked by
exclusions added during 7a. Fixed in [#101](https://github.com/Dayron-Glez/openbranch/pull/101)
(−1825 lines; SonarCloud returned to 0.0% duplication with zero exclusions, confirming the
duplication was the orphan, not move noise).

None of these is fatal. Phases 0–7a are merged with `main` green — strong empirical evidence the
plan is feasible. **Verdict: Ready with minor revisions** (§8), revisions concentrated on the
remaining phases (7b, 7c) and durable debt (tests, dependency rules, manifest split).

---

## 2. Compliance matrix — spec evaluation criteria

| #   | Criterion                 | Verdict                       | Note                                                                                                                                                                           |
| --- | ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Specification compliance  | **Fully**                     | All 4 deliverables exist; issue adds 14 traceable acceptance criteria. Report 04 (Phase 7 execution plan) is an extra.                                                         |
| 2   | Architecture principles   | **Partially**                 | Screaming/feature-first/SOLID well served; but `content/` and `supabase/` stay outside the feature (D1 only partly solved) and inter-feature dependency rules are unspecified. |
| 3   | Internal consistency      | **Partially**                 | 4 inconsistencies (§4).                                                                                                                                                        |
| 4   | Completeness              | **Partially**                 | Missing: test strategy, Sonar gate in DoD, non-import references, manifest server/client split, shim-cleanup plan.                                                             |
| 5   | Feasibility               | **Fully (with reservations)** | Order correct; phases 0–7a executed green prove it. Reservation: Phase 7 guarantees overstated.                                                                                |
| 6   | Risk assessment           | **Partially**                 | Good debt register; underweights risks _introduced by the proposal itself_ (manifest hub, permanent shims, no tests in the critical phase).                                    |
| 7   | Alternatives              | **Missing**                   | No alternatives considered (decentralized manifest, skipping the physical move, tests-before-Phase-4).                                                                         |
| 8   | Final verdict / readiness | **Fully**                     | Roadmap defines per-phase DoD and a dependency graph; enough to decide.                                                                                                        |

---

## 3. Strengths (confirmed, independent)

- **Verifiable diagnosis.** Every smell carries `file:line` — auditable.
- **Logical→physical sequencing.** Doing the physical move (Phase 7) _last_ turns the mass rename
  into a near-mechanical step. The best process decision.
- **Manifest as single source.** Derives page-maps, badge policy, routing and registry from one
  record — correct OCP/anti-drift attack on D4.
- **Honest about risk.** Flags Phase 4 as most dangerous, asks for a per-track parity checklist.
- **No big-bang.** "One phase = one/few small PRs, `main` always green" — held in practice.

## 4. Weaknesses (findings)

**W1 — No testing strategy (CRITICAL).** Only functional verification is manual smoke test.
Insufficient for Phase 4 (badge policy + persistence + auth); a change to award rules or
`slugPrefix→badge` inference can mis-award badges with `tsc`/`lint` green.

**W2 — Phase 7 guarantee overstated.** "Rely on `tsc` to catch every broken path" is false for
`new URL(...,import.meta.url)` Workers, dynamic string paths, config paths, assets. _Materialized
in PR #100._

**W3 — DoD incomplete vs real CI.** DoD omits the SonarCloud quality gate (a required check).
_Materialized: PR #100 blocked on duplication._

**W4 — Internal inconsistencies:**

- **Manifest contents.** North-star prose says it names `registry` and `view` (component refs);
  the illustrative type holds data only (`icon: IconKey`, `snapshot`, …). Two manifests with
  opposite architectural consequences (see R1).
- **D1 "six directories" vs four-dir solution.** §4.1 counts six homes (incl. `content/playground`,
  `supabase/migrations`); the target leaves `content/` and `supabase/` outside the feature. The
  residual smear is not acknowledged.
- **Phase 0/1/2 cross-ref.** Phase 0's risk note says the `DiffFile` fix "lands in Phase 2"; the
  move is actually in Phase 1.
- **`src/` yes/no.** North-star draws `src/` and says "(or keep root)"; never decided
  (implementation kept root).

**W5 — Under-specified dependency rules.** The guard covers `lib → components` and
`shared → features` but not the central feature-first risk: **`features/A → features/B`**.

**W6 — Manifest RSC/Client boundary unaddressed.** If `badge-policy` (server) imports the manifest
and the manifest pulls JSX icons or a client `view`, a server→client import can break `"use server"`
or bloat the bundle. The data-only reading (`icon: IconKey` + separate resolver) avoids it but is
not fixed in the docs (tied to W4).

**W7 — Shims as potentially permanent debt.** Phases 1/3/7 rely on re-export shims; no phase or
criterion guarantees their removal.

## 5. Risks introduced by the proposal

| Risk                                                              | Sev.     | Prob.                     | Mitigation                                                                |
| ----------------------------------------------------------------- | -------- | ------------------------- | ------------------------------------------------------------------------- |
| R1 — Manifest becomes a coupling hub / drags client into server   | Med      | Med                       | Fix data-only; resolve `view`/`registry`/icon-node via separate lookup    |
| R2 — Persistence/badge refactor without tests → silent regression | High     | Med                       | Characterization + E2E before touching actions                            |
| R3 — "tsc catches everything" fails on string references          | Med      | High (occurred)           | String grep + real build in the move gate                                 |
| R4 — DoD without Sonar → blocked merges                           | Low      | High (occurred)           | Add Sonar to DoD                                                          |
| R5 — `feature→feature` coupling unguarded                         | Med      | Med                       | `import/no-restricted-paths` by zones                                     |
| R6 — Shims/temporary exclusions become permanent                  | Low      | High                      | Retirement criterion per phase                                            |
| R7 — Over-abstraction for a 5-track, ~259-file app                | Low      | Low                       | Justified by current 8-files/track cost; watch indirection                |
| R8 — Churn / merge contention in the physical move                | Low      | High (absorbed)           | One PR per feature; quiet window                                          |
| **R9 — git mv deletes silently dropped → duplicate dead code**    | **High** | **High (occurred, #100)** | **Verify source removal: `git ls-files <old>` must be 0 after a move PR** |

> R9 is the lesson from PR #100/#101: a "move" PR must explicitly assert the _origin no longer
> exists in git_, not just that the destination compiles.

---

## 6. Gap analysis

| Requirement                        | Status            | Evidence                                              | Recommendation                                          |
| ---------------------------------- | ----------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| 4 deliverables produced            | ✅ Fully          | docs 01–04                                            | —                                                       |
| Screaming Architecture             | 🟡 Partial        | `content/`+`supabase/` outside feature                | Acknowledge residual smear or move challenge content in |
| Feature-first w/o cross-coupling   | 🟡 Partial        | guard covers only `lib→components`, `shared→features` | Add `features/A ↮ features/B` rule                      |
| Explicit dependency direction      | 🟡 Partial        | `DiffFile` fix good; edge matrix incomplete           | Document full allowed/forbidden edge graph              |
| Single source of truth (manifest)  | 🟡 Partial        | data-only vs data+view ambiguity                      | Fix manifest data-only; view/registry via lookup        |
| SOLID/OCP, SoC, composition, reuse | ✅ Fully (design) | Phases 3/4/5                                          | Reinforce with tests                                    |
| Long-term scalability              | ✅ Fully (design) | manifest+registry derive                              | Dry-run "add track N+1"                                 |
| Refactor verifiability             | 🔴 Missing        | DoD = tsc+lint+smoke; coverage 0                      | Characterization tests before Phase 4                   |
| Path verification in physical move | 🔴 Missing        | "tsc catches every broken path"                       | String grep + real build; assert origin removed (R9)    |
| Real quality gate in DoD           | 🔴 Missing        | DoD without SonarCloud                                | Add gate + duplication note                             |
| Alternatives / trade-offs          | 🔴 Missing        | none                                                  | Add brief comparison                                    |
| Shim / temp-exclusion cleanup      | 🔴 Missing        | shims in 1/3/7                                        | Retirement criterion per phase                          |

Legend: ✅ Fully · 🟡 Partial · 🔴 Missing.

---

## 7. Improvement recommendations (by priority)

| Pri | Recommendation                                                                                                       | Impact   | Effort |
| --- | -------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| P1  | Add a test net before any persistence/badge work (characterization of the 5 actions + 1 E2E per track)               | High     | M      |
| P2  | Fix the Phase 7 verification premise (string grep + real build; **assert `git ls-files <old>` == 0**, the R9 lesson) | High     | XS     |
| P3  | Align the DoD with real CI (add SonarCloud gate + duplication-during-moves note)                                     | High     | XS     |
| P4  | Pin the manifest as data-only; document the server/client boundary                                                   | High     | S      |
| P5  | Specify inter-feature dependency rules (`import/no-restricted-paths` by zone)                                        | Med-High | S      |
| P6  | Acknowledge/plan the residual smear (`content/`, `supabase/`)                                                        | Med      | XS doc |
| P7  | Plan retirement of shims & temporary Sonar exclusions                                                                | Med      | XS     |
| P8  | Add a short alternatives section; decide `src/`                                                                      | Low-Med  | XS     |

---

## 8. Readiness assessment

**Classification: Ready with minor revisions.**

The proposal is architecturally sound and ~90% executed with `main` green (phases 0–6, 7a, plus
the #101 orphan cleanup). Feasibility is empirically answered: yes.

- **Ready to proceed with 7b/7c — yes**, provided P2 and P3 are added to their checklists (string
  grep + real build + Sonar gate + the R9 origin-removal assertion). Without this, 7b/7c will
  repeat the 7a failures.
- **In 7c, also apply P5 and P7** (inter-feature guard + shim/exclusion cleanup) — 7c already
  touches `eslint.config` and slims `lib/`.
- **Before any future Phase-4-like work** (new actions, new track, badge-policy change), apply
  **P1 (tests)**. The verification debt is tolerable while remaining work is pure relocation; it
  stops being tolerable the moment behavior changes again.

**Does not require** a new architectural assessment: the diagnosis is correct and the corrections
are incremental on a valid base.
