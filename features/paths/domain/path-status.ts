import type { PathStep } from "./paths"

/** Nothing produces "locked" today — it is reserved for a future gated model. */
export type StepStatus = "available" | "current" | "completed" | "locked"

/**
 * One object rather than two nullable sets, so `null` means signed out and
 * nothing else. Two nullable parameters would make that representable four ways.
 */
export type PathProgress = {
  readonly completedChallengeSlugs: ReadonlySet<string>
  readonly readDocSlugs: ReadonlySet<string>
}

export const isStepDone = (step: PathStep, progress: PathProgress): boolean =>
  step.type === "doc"
    ? progress.readDocSlugs.has(step.slug)
    : progress.completedChallengeSlugs.has(step.slug)

/** `progress === null` is signed out: every step "available", no pointer. */
export const computeStepStatuses = (
  steps: readonly PathStep[],
  progress: PathProgress | null
): readonly StepStatus[] => {
  if (progress === null) return steps.map(() => "available")

  let currentAssigned = false
  return steps.map((step) => {
    if (isStepDone(step, progress)) return "completed"
    if (currentAssigned) return "available"
    currentAssigned = true
    return "current"
  })
}
