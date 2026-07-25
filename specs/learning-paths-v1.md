# Spec: Learning Paths v1 — Implementation

**Status:** Ready to implement
**Date:** 2026-07-23
**Parent brief:** `specs/learning-paths.md` (design session settled Q1–Q5, mocked every surface — `Learning Paths.html` in the `openbranch` Claude Design project)

## What ships

Three linear, two-step learning paths connecting a docs guide to the playground challenge that puts it into practice — the first structural link between the two domains. Settled by the design session, restated here as the implementation contract:

- **Q1 — data, not content.** `features/paths/domain/paths.ts`, a hand-authored `as const` array shaped like `CHALLENGE_TRACKS`. No new `source.config.ts` collection.
- **Q2 — linear, soft-ordered, never hard-locked.** Steps render in authored order; a `current` pointer suggests the next step, but every step stays openable. A guide's `ref` can appear in more than one path.
- **Q3 — challenge-only progress.** Doc steps always render `available`, never `completed` — no read-tracking exists or is being built. Progress = completed challenge steps ÷ total challenge steps in the path.
- **Q4 — no dedicated hub.** Discovery is inline: a 3-card band on the playground hub, a sidebar chip + in-content block on docs, a recap on the result page. No `/[lang]/paths` index route.
- **Q5 — the three paths.** `git`, `code-review`, `testing`. `documentation` and `bug-fix` ship without a path (accepted gap, see `specs/learning-paths.md` §07).

## Data model

`features/paths/domain/paths.ts` — sibling to `features/playground/` and `features/docs/`, not nested under either, because a path crosses both domains:

```ts
export type PathStep =
  | { readonly type: "doc"; readonly docSlug: string }
  | { readonly type: "challenge"; readonly challengeSlug: string }

export type LearningPath = {
  readonly slug: string
  readonly track: TrackColorToken // reuses features/playground/domain/manifest.ts
  readonly title: { readonly es: string; readonly en: string }
  readonly lead: { readonly es: string; readonly en: string }
  readonly steps: readonly PathStep[]
}

export const LEARNING_PATHS: readonly LearningPath[] = [
  {
    slug: "master-git-workflows",
    track: "git",
    title: { es: "Domina los flujos de Git", en: "Master Git workflows" },
    lead: {
      es: "Lee cómo los equipos eligen un modelo de branching de verdad — luego resuelve un conflicto de merge de tres vías donde ningún lado tiene simplemente razón.",
      en: "Read how teams actually choose a branching model — then resolve a real three-way merge conflict where neither side is simply right.",
    },
    steps: [
      { type: "doc", docSlug: "git/branching-strategies" },
      { type: "challenge", challengeSlug: "git-merge-conflict" },
    ],
  },
  {
    slug: "review-like-a-maintainer",
    track: "review",
    title: { es: "Revisa como un maintainer", en: "Review like a maintainer" },
    lead: {
      es: "Aprende cultura de revisión — luego triáge un pull request ruidoso de 380 líneas.",
      en: "Learn review culture, then triage a noisy 380-line pull request.",
    },
    steps: [
      { type: "doc", docSlug: "pull-requests/review-culture" },
      { type: "challenge", challengeSlug: "code-review-noisy-pr" },
    ],
  },
  {
    slug: "test-with-confidence",
    track: "test",
    title: { es: "Testea con confianza", en: "Test with confidence" },
    lead: {
      es: "Elimina el CI inestable — luego escribe los tests que blindan un fix real.",
      en: "Kill flaky CI, then write the tests that lock a fix in place.",
    },
    steps: [
      { type: "doc", docSlug: "testing/killing-flaky-ci" },
      { type: "challenge", challengeSlug: "testing-fetchupstream" },
    ],
  },
] as const

export const PATH_BY_SLUG: ReadonlyMap<string, LearningPath> = new Map(
  LEARNING_PATHS.map((p) => [p.slug, p])
)

/** Paths that reference a given doc or challenge slug — powers both entry-point surfaces. */
export const pathsForDoc = (docSlug: string): readonly LearningPath[] =>
  LEARNING_PATHS.filter((p) => p.steps.some((s) => s.type === "doc" && s.docSlug === docSlug))

export const pathForChallenge = (challengeSlug: string): LearningPath | null =>
  LEARNING_PATHS.find((p) =>
    p.steps.some((s) => s.type === "challenge" && s.challengeSlug === challengeSlug)
  ) ?? null
```

Title/lead are inline per-locale objects, not routed through the dictionary — this is path _content_ (the design session's own prose), analogous to docs having separate `.es.mdx`/`.en.mdx` files rather than a shared string table. `docSlug` is the fumadocs slug relative to `content/docs/` (e.g. `git/branching-strategies`, matching `page.slugs`/URL segments minus the section root); validate it resolves via `source.getPage()` at render time — no compile-time check exists across two independent MDX collections, so a broken `docSlug` fails at render, not at `types:check`. `challengeSlug` reuses the same slugs `CHALLENGE_TRACKS`/`challenge_sessions` already use.

## Dictionary — chrome copy only

`lib/dictionaries/paths.ts`, matching `docs.ts`'s `{ es: {...}, en: {...} } as const` shape (chosen over `playground-dictionary.ts`'s per-key-indexed pattern — paths chrome has no need for the `tx()`/flat-translation-table machinery that pattern exists for, since there's no dynamic per-item key lookup happening in the dictionary itself, only in `paths.ts` above):

```ts
export const pathsDictionary = {
  es: {
    sectionHeading: "Rutas de aprendizaje",
    sectionSub: "Lee la guía, luego practícala — tres recorridos curados",
    breadcrumbPaths: "Rutas",
    partOfPath: "Parte de una ruta",
    stepOf: (n: number, total: number) => `Paso ${n} de ${total}`,
    startWithGuide: "Empieza con la guía",
    startThePath: "Empezar la ruta",
    openGuide: "Abrir guía",
    openChallenge: "Abrir reto",
    startChallenge: "Empezar reto",
    youAreHere: "Estás aquí",
    available: "Disponible",
    completed: "Completado",
    practiced: (done: number, total: number) =>
      `${done} de ${total} practicado${total === 1 ? "" : "s"}`,
    nextInPath: "Siguiente en esta ruta",
    pathComplete: "Ruta completada",
    youFinishedThePath: "Completaste la ruta.",
    explorePaths: "Explorar otra ruta",
    guestReading: "Leyendo como invitado.",
    guestSignInPrompt:
      "Inicia sesión para trackear qué retos completaste y seguir donde lo dejaste.",
    noPathHeading: "Aún no hay ruta aquí",
    noPathBody:
      "Los retos de esta categoría son autosuficientes. Una ruta guiada llega cuando haya una guía con la que emparejarlos.",
  },
  en: {
    sectionHeading: "Learning paths",
    sectionSub: "Read the guide, then practice it — three curated journeys",
    breadcrumbPaths: "Paths",
    partOfPath: "Part of a path",
    stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
    startWithGuide: "Start with the guide",
    startThePath: "Start the path",
    openGuide: "Open guide",
    openChallenge: "Open challenge",
    startChallenge: "Start challenge",
    youAreHere: "You're here",
    available: "Available",
    completed: "Completed",
    practiced: (done: number, total: number) => `${done} of ${total} practiced`,
    nextInPath: "Next in this path",
    pathComplete: "Path complete",
    youFinishedThePath: "You finished the path.",
    explorePaths: "Explore another path",
    guestReading: "Reading as a guest.",
    guestSignInPrompt:
      "Sign in to track which challenges you've completed and pick up where you left off.",
    noPathHeading: "No path here yet",
    noPathBody:
      "This track's challenges stand on their own. A guided path arrives when there's a guide worth pairing them with.",
  },
} as const

export type PathsLocale = keyof typeof pathsDictionary
export type PathsDictionary = (typeof pathsDictionary)[PathsLocale]
```

## Progress computation

A single server-side helper, `features/paths/server/path-progress.ts`, mirrors the shape of `stats-service.ts`'s `firstCompletionBySlug` derivation rather than adding a new table:

```ts
export const getPathProgress = async (
  supabase: SupabaseServerClient,
  userId: string,
  path: LearningPath
): Promise<{ readonly completedChallengeSlugs: ReadonlySet<string> }> => {
  const challengeSlugs = path.steps
    .filter((s) => s.type === "challenge")
    .map((s) => s.challengeSlug)
  const { data } = await supabase
    .from("challenge_sessions")
    .select("challenge_slug")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("challenge_slug", challengeSlugs)
  return { completedChallengeSlugs: new Set((data ?? []).map((r) => r.challenge_slug as string)) }
}
```

No new DB objects. Signed-out: skip the call entirely, render every step `available` with no progress bar — matches the design session's degraded state (§10).

## Surfaces and where they mount

| #   | Surface                   | New / extend | Location                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Path page                 | New          | `app/[lang]/paths/[slug]/page.tsx` — sibling to `docs/`, `playground/`. `<main data-pg-main>`; mount `PlaygroundTransition` the same way `playground/[slug]/page.tsx` does (confirm the mount site — research found it's likely a shared `playground/layout.tsx`; for `/paths/` it needs its own explicit mount since it isn't under that layout).                                                                            |
| 2   | Path step card            | New          | `features/paths/components/PathStepper.tsx` — new component; fumadocs' `Card`/`Cards` (`SectionCards.tsx`'s pattern) has no locked/current/completed slots, so this is a bespoke component inspired by `ChallengeCard.tsx`'s state duality, not a wrapper around fumadocs' `Card`.                                                                                                                                            |
| 3   | Hub band                  | Extend       | `app/[lang]/playground/page.tsx`, inserted after the existing `BadgesSection` block (after its closing `</div>` around line 312, before `</main>`), same `mt-14` wrapper and the same `activeCategory === undefined && activeSort === "recommended"` guard so it doesn't show under filtered views.                                                                                                                           |
| 4a  | Docs sidebar chip         | Extend       | **Not** `DocsSidebar.tsx` (that component only renders tree nav items, no access to the current page's data). Insert in `app/[lang]/docs/[[...slug]]/page.tsx`, near the existing reading-time badge, conditional on `pathsForDoc(currentDocSlug).length > 0`.                                                                                                                                                                |
| 4b  | "Next in this path"       | Extend       | `app/[lang]/docs/[[...slug]]/page.tsx`, inside `<DocsBody>`, immediately after the existing `<SectionCards pages={sectionChildren} />` call (~line 82) — a new `<PathNextStep>` component, conditional on the same lookup.                                                                                                                                                                                                    |
| 5   | Result-page recap         | Extend       | `features/playground/components/RewardMoment.tsx`, new optional prop (e.g. `pathRecap: PathRecapData                                                                                                                                                                                                                                                                                                                          | null`), rendered as an additional block after the existing rich-completion block (lines ~89–123) — not a parallel component, so the result page keeps one reward surface. Computed in `app/[lang]/playground/[slug]/active/result/page.tsx`next to the existing`buildsOnChallenge`/`newTrackChallenge`derivations, using`pathForChallenge(slug)`+`getPathProgress`. |
| 6   | Track-without-a-path note | New (small)  | `features/paths/components/NoPathNote.tsx` — opt-in only, per the design session (§07): never rendered automatically, only where a caller explicitly decides a surface would otherwise look conspicuously empty (e.g. a future track-filtered hub view). **Not wired into any surface in this v1** — no such empty-looking surface exists yet; the component ships so surface owners can reach for it later without a new PR. |

No `pathsRoute` constant — playground's routes have no equivalent to `docsRoute` (which exists only because of docs' markdown-proxy negotiation), so `/paths/...` stays a string literal via the existing `localizedHref(lang, path)` helper, consistent with how playground routes already work.

## Acceptance criteria

- The 3 paths render correctly at `/[lang]/paths/[slug]` for git, code-review, and testing, both locales.
- Hub band appears only in the default (unfiltered, recommended-sort) view of `/[lang]/playground`, track-hued, 3 cards.
- A reader on `docs/git/branching-strategies` sees the "part of a path" chip and the "next in this path" block pointing at `git-merge-conflict`.
- Completing `git-merge-conflict` when it's the path's last unfinished step shows the path-complete recap in `RewardMoment`; completing it when the guide step isn't trackable (always true today) still recognizes 1-of-1 challenge progress correctly.
- Signed-out: path page renders fully, no progress bar, no locked steps, a single sign-in ribbon.
- `documentation` and `bug-fix` challenge/detail pages render with no path affordance at all (default = show nothing, per §07) — `NoPathNote` stays unused in this PR.
- Both locales, both themes, all breakpoints; `data-pg-main` present and GSAP transition confirmed working on `/paths/[slug]`.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): all 3 paths end-to-end (start from docs, start from hub, complete via result page), signed-out state, light mode.

## Action plan

Single PR, matching module 1's rhythm, atomic commits per the design session's own build order:

1. Issue `feat(paths): connect docs and playground via learning paths (module 2/4)` + branch.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(paths)`: `features/paths/domain/paths.ts` (data + lookups) + `lib/dictionaries/paths.ts`.
4. Commit 3 — `feat(paths)`: path page + `PathStepper` — `/[lang]/paths/[slug]`.
5. Commit 4 — `feat(playground)`: hub band on `/[lang]/playground`.
6. Commit 5 — `feat(docs)`: sidebar chip + "next in this path" on the docs guide page.
7. Commit 6 — `feat(playground)`: `RewardMoment` path recap + result-page wiring.
8. Commit 7 — `feat(paths)`: `NoPathNote` component (unwired, ships for later use per design session §07).
9. Checks + full SonarCloud report; owner verifies visually on localhost.
10. Merge (merge commit).
