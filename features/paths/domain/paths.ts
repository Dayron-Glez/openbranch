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

type PathInput = {
  readonly slug: string
  readonly track: TrackColorToken
  readonly titleEs: string
  readonly titleEn: string
  readonly leadEs: string
  readonly leadEn: string
  readonly docSlug: string
  readonly challengeSlug: string
}

/** Every v1 path is one doc step + one challenge step — see specs/learning-paths-v1.md. */
const definePath = (input: PathInput): LearningPath => ({
  slug: input.slug,
  track: input.track,
  title: { es: input.titleEs, en: input.titleEn },
  lead: { es: input.leadEs, en: input.leadEn },
  steps: [
    { type: "doc", docSlug: input.docSlug },
    { type: "challenge", challengeSlug: input.challengeSlug },
  ],
})

export const LEARNING_PATHS: readonly LearningPath[] = [
  definePath({
    slug: "master-git-workflows",
    track: "git",
    titleEs: "Domina los flujos de Git",
    titleEn: "Master Git workflows",
    leadEs:
      "Lee cómo los equipos eligen un modelo de branching de verdad — luego resuelve un conflicto de merge de tres vías donde ningún lado tiene simplemente razón.",
    leadEn:
      "Read how teams actually choose a branching model — then resolve a real three-way merge conflict where neither side is simply right.",
    docSlug: "git/branching-strategies",
    challengeSlug: "git-merge-conflict",
  }),
  definePath({
    slug: "review-like-a-maintainer",
    track: "review",
    titleEs: "Revisa como un maintainer",
    titleEn: "Review like a maintainer",
    leadEs: "Aprende cultura de revisión — luego triáge un pull request ruidoso de 380 líneas.",
    leadEn: "Learn review culture, then triage a noisy 380-line pull request.",
    docSlug: "pull-requests/review-culture",
    challengeSlug: "code-review-noisy-pr",
  }),
  definePath({
    slug: "test-with-confidence",
    track: "test",
    titleEs: "Testea con confianza",
    titleEn: "Test with confidence",
    leadEs: "Elimina el CI inestable — luego escribe los tests que blindan un fix real.",
    leadEn: "Kill flaky CI, then write the tests that lock a fix in place.",
    docSlug: "testing/killing-flaky-ci",
    challengeSlug: "testing-fetchupstream",
  }),
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
