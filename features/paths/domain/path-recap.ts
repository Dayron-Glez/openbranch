import { flattenSteps, type LearningPath, type PathStep } from "./paths"
import { isStepDone, type PathProgress } from "./path-status"

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
  /** Counts guides read as well as challenges completed. */
  readonly doneCount: number
  readonly totalSteps: number
  /** Index into `steps`, or `null` when there is nothing left to do. */
  readonly nextStepIndex: number | null
}

/**
 * Both step types have a real signal now that reading is tracked. Guides used
 * to be judged by position — anything before the step just completed counted
 * as passed through — because nothing recorded a read.
 */
const statusOf = (
  step: PathStep,
  index: number,
  justCompletedIndex: number,
  progress: PathProgress
): RecapStepStatus => {
  if (step.type === "challenge" && index === justCompletedIndex) return "justCompleted"
  return isStepDone(step, progress) ? "done" : "upcoming"
}

/**
 * The first step worth pointing at after finishing one. Normally that is
 * simply the next in reading order; if the completed step was last but work
 * remains (nothing forces in-order completion), it falls back to the earliest
 * unfinished step — a guide counts, now that an unread one is real work.
 */
const findNextStepIndex = (
  steps: readonly RecapStep[],
  justCompletedIndex: number
): number | null => {
  const following = justCompletedIndex + 1
  if (following < steps.length) return following

  const unfinished = steps.findIndex((step) => step.status === "upcoming")
  return unfinished === -1 ? null : unfinished
}

export const buildPathRecap = (
  path: LearningPath,
  justCompletedSlug: string,
  progress: PathProgress
): PathRecapModel => {
  const flat = flattenSteps(path)
  const justCompletedIndex = flat.findIndex(
    (step) => step.type === "challenge" && step.slug === justCompletedSlug
  )

  const steps: readonly RecapStep[] = flat.map((step, index) => ({
    type: step.type,
    slug: step.slug,
    status: statusOf(step, index, justCompletedIndex, progress),
  }))

  const doneCount = steps.filter((step) => step.status !== "upcoming").length
  const everyStepDone = steps.length > 0 && doneCount === steps.length

  return {
    steps,
    doneCount,
    totalSteps: steps.length,
    nextStepIndex: everyStepDone ? null : findNextStepIndex(steps, justCompletedIndex),
  }
}
