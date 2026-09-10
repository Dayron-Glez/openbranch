import { flattenSteps, type LearningPath, type PathStep } from "./paths"
import { isStepDone, type PathProgress } from "./path-status"

/** `justCompleted` is the step this result page was reached from. */
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
 * Normally the next step in reading order. Nothing forces in-order completion,
 * so when the completed step was the last one but work remains, this falls back
 * to the earliest unfinished step.
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
