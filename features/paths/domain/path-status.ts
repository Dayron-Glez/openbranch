import type { PathStep } from "./paths"

/**
 * "locked" is reserved for a future gated model (a challenge behind an
 * earlier challenge) — see specs/learning-paths-v1.md Q2. Nothing produces it
 * today; no step is ever hard-locked.
 */
export type StepStatus = "available" | "current" | "completed" | "locked"

/**
 * One object rather than two nullable sets: `null` means signed out, and that
 * has a single meaning. Two independently-nullable parameters would make it
 * representable four ways.
 */
export type PathProgress = {
  readonly completedChallengeSlugs: ReadonlySet<string>
  readonly readDocSlugs: ReadonlySet<string>
}

export const isStepDone = (step: PathStep, progress: PathProgress): boolean =>
  step.type === "doc"
    ? progress.readDocSlugs.has(step.slug)
    : progress.completedChallengeSlugs.has(step.slug)

/**
 * Both step types are completable now that reading is tracked, so this is a
 * plain "first not-done step is current" sweep with no branch on type. Before
 * read-tracking a doc step could never be `completed` or `current` (Q3), which
 * meant the pointer skipped guides entirely.
 *
 * `progress === null` means signed out: every step renders "available", no
 * pointer.
 */
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
