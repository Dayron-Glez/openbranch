import type { TrackColorToken } from "@/features/playground/domain/manifest"
import type { PathStepType } from "@/lib/paths-schema"

/**
 * `doc` slugs are `section/page` paths into `content/docs`, `challenge` slugs
 * are flat names in `content/playground`. Resolved at render time; the
 * build-time validator guarantees every reference resolves.
 */
export type PathStep = {
  readonly type: PathStepType
  readonly slug: string
}

export type PathSection = {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly steps: readonly PathStep[]
}

/**
 * One locale's path, copy already resolved — each locale is its own MDX file,
 * so there is no `{es, en}` to index into. The prose body stays on the source
 * page; this type is the queryable part.
 */
export type LearningPath = {
  readonly slug: string
  readonly track: TrackColorToken
  readonly title: string
  readonly lead: string
  readonly sections: readonly PathSection[]
}

/** Status is a property of the sequence, not the grouping — hence the flat list. */
export const flattenSteps = (path: LearningPath): readonly PathStep[] =>
  path.sections.flatMap((section) => section.steps)

export type StepLocation = {
  readonly sectionIndex: number
  readonly stepIndex: number
  /** Index into `flattenSteps`, i.e. the one that lines up with step statuses. */
  readonly flatIndex: number
}

/** Where a step sits in both coordinate systems — grouped and flat. */
export const locateStep = (
  path: LearningPath,
  predicate: (step: PathStep) => boolean
): StepLocation | null => {
  let flatIndex = 0
  for (const [sectionIndex, section] of path.sections.entries()) {
    for (const [stepIndex, step] of section.steps.entries()) {
      if (predicate(step)) return { sectionIndex, stepIndex, flatIndex }
      flatIndex += 1
    }
  }
  return null
}

export const challengeSlugsOf = (path: LearningPath): readonly string[] =>
  flattenSteps(path)
    .filter((step) => step.type === "challenge")
    .map((step) => step.slug)

export const hasDocStep = (path: LearningPath, docSlug: string): boolean =>
  flattenSteps(path).some((step) => step.type === "doc" && step.slug === docSlug)

export const hasChallengeStep = (path: LearningPath, challengeSlug: string): boolean =>
  flattenSteps(path).some((step) => step.type === "challenge" && step.slug === challengeSlug)
