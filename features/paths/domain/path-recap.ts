import { flattenSteps, type LearningPath, type PathStep } from "./paths"

/**
 * `justCompleted` is the step the user landed on this result page from —
 * worth setting apart from steps completed in earlier sessions.
 */
export type RecapStepStatus = "done" | "justCompleted" | "upcoming"

export type RecapStep = {
  readonly type: PathStep["type"]
  readonly slug: string
  readonly status: RecapStepStatus
}

export type PathRecapModel = {
  readonly steps: readonly RecapStep[]
  readonly completedChallengeCount: number
  readonly totalChallengeSteps: number
  /** Index into `steps`, or `null` when there is nothing left to do. */
  readonly nextStepIndex: number | null
}

/**
 * Doc steps carry no completion signal — reading is not tracked — so they are
 * judged by position: anything before the step just completed has been passed
 * through. Challenge steps use the real set. This mirrors `computeStepStatuses`,
 * where a doc step is never "completed" either.
 */
const statusOf = (
  step: PathStep,
  index: number,
  justCompletedIndex: number,
  completedChallengeSlugs: ReadonlySet<string>
): RecapStepStatus => {
  if (step.type === "challenge") {
    if (index === justCompletedIndex) return "justCompleted"
    return completedChallengeSlugs.has(step.slug) ? "done" : "upcoming"
  }
  return index < justCompletedIndex ? "done" : "upcoming"
}

/**
 * The first step worth pointing at after finishing one. Normally that is
 * simply the next in reading order; if the completed step was last but
 * challenges remain (nothing forces in-order completion), it falls back to
 * the earliest unfinished challenge.
 */
const findNextStepIndex = (
  steps: readonly RecapStep[],
  justCompletedIndex: number
): number | null => {
  const following = justCompletedIndex + 1
  if (following < steps.length) return following

  const unfinished = steps.findIndex(
    (step) => step.type === "challenge" && step.status === "upcoming"
  )
  return unfinished === -1 ? null : unfinished
}

export const buildPathRecap = (
  path: LearningPath,
  justCompletedSlug: string,
  completedChallengeSlugs: ReadonlySet<string>
): PathRecapModel => {
  const flat = flattenSteps(path)
  const justCompletedIndex = flat.findIndex(
    (step) => step.type === "challenge" && step.slug === justCompletedSlug
  )

  const steps: readonly RecapStep[] = flat.map((step, index) => ({
    type: step.type,
    slug: step.slug,
    status: statusOf(step, index, justCompletedIndex, completedChallengeSlugs),
  }))

  const challengeSteps = steps.filter((step) => step.type === "challenge")
  const completedChallengeCount = challengeSteps.filter((step) => step.status !== "upcoming").length

  const everyChallengeDone =
    challengeSteps.length > 0 && completedChallengeCount === challengeSteps.length

  return {
    steps,
    completedChallengeCount,
    totalChallengeSteps: challengeSteps.length,
    nextStepIndex: everyChallengeDone ? null : findNextStepIndex(steps, justCompletedIndex),
  }
}
