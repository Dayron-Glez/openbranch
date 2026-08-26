# Mini-spec: community contribution — re-scoped

**Status:** Implementing
**Date:** 2026-08-26
**Owner:** @Dayron-Glez
**Parent:** issue #203. Replaces module 4 ("community contribution") of the post-color-system roadmap — a design session for a contribution and challenge-authoring flow. This spec records why that module is not being built as planned, what replaces it, and what would have to change for it to come back.

## Why module 4 is not viable as planned

Module 4 was the largest item on the roadmap: a flow for proposing guides and authoring challenges through GitHub PRs, "the product practicing what it preaches". It is technically buildable. The playground's registry pattern exists, the MDX pipeline exists, `scripts/sync-challenges.ts` exists. That is not the problem.

The problem is that module 4's entire value is a multiplier on contributor throughput, and that throughput has already been measured:

- The repository has been public since 2026-05-16. Today: **6 stars, 0 forks, 0 watchers, 0 external contributors.**
- Five issues labelled `good first issue` have been open since 2026-06-25 (#67–#71). **None has been picked up.** That is not a forecast; it is a completed experiment.
- 691 commits and 104 merged pull requests, all from one person. Two accounts exist in production.

Zero multiplied by any amount of contribution machinery is still zero.

### The pattern this fits

The three shipped modules each built the platform ahead of the catalogue it serves:

| Machinery                                                                                                                                               | Content it serves                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Five challenge engines (`code-review`, `bug-fix`, `testing`, `git`, `documentation`), each with its own view, template shape and grading path           | **6 challenges** — 1.2 per engine |
| The learning-path system: `PathProgress`, `PathCard`, the stepper, read-tracking, the `doc_reads` table, the repo's first client island that reads data | **1 path**                        |
| Public profiles, OG cards, a share button, and a global all-time leaderboard                                                                            | **2 users**                       |

Roughly 22k lines of application code currently present six guides, six challenges and one path. Module 4 is more machinery of exactly this kind, and it is the first one whose payoff depends on people who are not in the room.

## The finding that makes part 1 urgent

Investigating module 4 turned up something that is not a roadmap question but a live defect: **the contribution ramp that already exists documents a mechanism the code does not have.**

| What the docs say                                                                        | What the code does                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The runnable sandbox lives in `content/playground/templates/<slug>/` (`CONTRIBUTING.md`) | The folders exist with 16 files. No runtime code reads any of them. What ships to the browser is string literals in `features/playground/challenges/`                                                               |
| `sandbox_template` links a brief to its template folder                                  | Declared in `source.config.ts`, present in all 12 challenge MDX files, **zero consumers**. `app/[lang]/playground/[slug]/active/page.tsx` resolves by `slug` against hand-written registries the docs never mention |
| `validation` is "how the sandbox is graded"                                              | It is a label rendered on the detail page. Nothing dispatches on it. The real engine selector is `category`                                                                                                         |
| —                                                                                        | `checklist` is declared in the schema, filled in for `code-review-noisy-pr`, and read nowhere                                                                                                                       |
| The PR template asks for `npm run build`                                                 | The project uses bun. Its "Area affected" list also has no playground entry                                                                                                                                         |

A contributor following `CONTRIBUTING.md` today writes files nothing reads, never learns they must add a registry entry, and gets `notFound()` when they open their own challenge.

Nothing caught this because the dead directory is ignored three times over — `.prettierignore`, `eslint.config.mjs` and `tsconfig.json` all skip it. Every tool that could have flagged it was told not to look.

Fumadocs was not told. It globs those folders' `package.json` and `tsconfig.json` into the `playground` collection **as meta files** — five entries in `.source/server.ts`. They validate silently because every field in `metaSchema` is optional. Dead content has been quietly entering the content pipeline this whole time.

### The real anatomy

Verified against all six existing challenges:

```
content/playground/<slug>.es.mdx                          ← brief (Spanish)
content/playground/<slug>.en.mdx                          ← brief (English)
features/playground/challenges/<category>/…/<slug>.ts     ← the engine template
features/playground/challenges/<category>/…-registry.ts   ← plus its registry entry
bun run db:sync-challenges → supabase db push             ← maintainer-only step
```

Even the registry filenames are non-uniform — `diff-registry.ts`, `sandpack-registry.ts`, `docs-registry.ts`, `git-registry.ts`, `testing-registry.ts` — so the rewritten guide names each one in a table rather than implying a pattern that does not exist.

And the part the old documentation obscured most: there is no single challenge contract. There are five, and they are structurally incompatible.

| Engine          | What the author must produce                                                                 |
| --------------- | -------------------------------------------------------------------------------------------- |
| `code-review`   | A hand-built `DiffFile[]` — the only engine with no hints and no reference solution          |
| `bug-fix`       | `files`, `editableFile`, `testFile`, `solutionCode`, `bugLine`, hints in both languages      |
| `testing`       | The above plus `mutants[]` — mutations the learner's tests have to kill                      |
| `git`           | `versions{base,ours,theirs}`, `extraModules`, `hiddenTests`, `conflictCount`, `solutionCode` |
| `documentation` | `criteria[]` whose `check` entries are JavaScript predicates running in the client           |

Three of the five require writing executable code that ships in the bundle; two require writing the grading logic as functions. **Authoring a challenge is programming against an engine, not contributing content**, and the rewritten documentation says so instead of implying otherwise.

## Part 1 — the contract fix (ships with this spec)

1. **Delete the orphaned tree** at `content/playground/templates/` and the three ignore entries that concealed it (`.prettierignore`, `eslint.config.mjs`, `tsconfig.json`).
2. **Remove the dead schema fields** `sandbox_template` and `checklist` from `source.config.ts` and from the MDX files. `sandbox_template` is a required field, so the schema and the twelve briefs have to change together or the build breaks.
3. **Keep `validation`.** It tells a reader how a challenge is graded, which is real information; only its description was wrong.
4. **Rewrite** the "Adding a playground challenge" section of `CONTRIBUTING.md` around the real anatomy and the five engine contracts, including the maintainer-only database sync. Fix the field list in `README.md`, the _New Challenge_ issue template, and the PR template.

## Part 2 — the five stalled guides

Six published guides is a demo, not a product. Issues #67–#71 are already written, scoped and labelled; they are the guides a first-time visitor would read before deciding whether the site is worth returning to. Writing them is content work with no platform component, and it is the highest-value thing available right now.

## Part 3 — "Your first open source contribution"

Instead of building a flow for the community to author challenges, invert the direction: make contributing to open source the learning path.

`content/docs/contributing/` is the emptiest section on the site — an index still marked `draft` plus a single guide — and it is the product's own thesis. A path that walks a reader from reading an issue to opening a real pull request against this repository composes docs, challenges and the path system that are **already built**, needs exactly one author, and delivers the dogfooding story module 4 was chasing without building any platform for it.

This is a direction, not a design. It gets its own issue and, if it warrants one, its own brief.

## What we are explicitly not building

- A unified challenge contract across the five engines. This is the expensive half of module 4, and it is a refactor of the playground core, not a feature.
- A scaffolding CLI, a preview environment for contributed challenges, or contribution moderation.
- Server-side grading (#81). `completeTrackChallenge` awards points, badges and leaderboard position with no proof of solution — validation runs entirely in the browser. With two trusted users this is theoretical debt. It becomes a prerequisite the moment strangers compete on a public leaderboard, and not before.

## Trigger conditions to revisit

Written down so the decision is re-made on evidence rather than on mood:

- A first unsolicited external pull request, content or code; **or**
- Three or more forks, or sustained traffic to the site; **or**
- Authoring challenge number twelve or fifteen becomes tedious enough that standardising the engines pays for itself in the maintainer's own time.

The third is the realistic one, and it is worth being honest about: unifying the engine contracts has value even if no external contributor ever arrives, because the principal user of that ramp is the person maintaining the project.

## Follow-up, not in this PR

Automating `db:sync-challenges` in CI. It is a manual maintainer step today. The `coalesce(challenge_points, 10)` fallback in `apply_completion_to_stats` stops an unsynced challenge from failing, so nothing breaks — a new challenge is simply mispriced at beginner points until someone remembers to run it.

## Files

- `specs/community-contribution-rescope.md` — this file.
- `content/playground/templates/` — deleted.
- `source.config.ts` — `sandbox_template` and `checklist` removed from the playground schema.
- `content/playground/*.{es,en}.mdx` — twelve briefs lose `sandbox_template`; `code-review-noisy-pr` also loses its `checklist` block.
- `CONTRIBUTING.md` — the challenge section rewritten.
- `README.md`, `.github/ISSUE_TEMPLATE/new-challenge.md`, `.github/PULL_REQUEST_TEMPLATE.md`.
- `.prettierignore`, `eslint.config.mjs`, `tsconfig.json` — ignore entries for the deleted tree removed.

## Verification

- `bun run types:check`, `bun run lint`, `bun run format:check` and `bun run build` all green.
- `grep -c "playground/templates" .source/server.ts` returns 0 after a regenerated `.source` — direct proof that the dead tree has stopped entering the content pipeline.
- For each of the six challenges, the files it actually has match the anatomy documented in `CONTRIBUTING.md`. This is the real acceptance test for the rewrite: the previous version failed it.
- The challenge detail page still renders the `validation` label.
- Manual, one challenge per engine, both locales: `/playground/<slug>` and `/playground/<slug>/active` still load and still grade.
