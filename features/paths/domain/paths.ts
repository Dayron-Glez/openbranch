import type { TrackColorToken } from "@/features/playground/domain/manifest"

export type PathStep =
  | { readonly type: "doc"; readonly docSlug: string }
  | { readonly type: "challenge"; readonly challengeSlug: string }

export type LearningPath = {
  readonly slug: string
  readonly track: TrackColorToken
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

/** Paths that reference a given doc slug — powers the docs sidebar chip + in-content block. */
export const pathsForDoc = (docSlug: string): readonly LearningPath[] =>
  LEARNING_PATHS.filter((p) => p.steps.some((s) => s.type === "doc" && s.docSlug === docSlug))

/** The path a given challenge slug belongs to, if any — powers the result-page recap. */
export const pathForChallenge = (challengeSlug: string): LearningPath | null =>
  LEARNING_PATHS.find((p) =>
    p.steps.some((s) => s.type === "challenge" && s.challengeSlug === challengeSlug)
  ) ?? null
