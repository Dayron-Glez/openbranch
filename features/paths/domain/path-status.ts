import type { PathStep } from "./paths"

/**
 * "locked" is reserved for a future gated model (a challenge behind an
 * earlier challenge) — see specs/learning-paths-v1.md Q2. Today's 2-step
 * paths never produce it; nothing hard-locks a step in v1.
 */
export type StepStatus = "available" | "current" | "completed" | "locked"

/**
 * Doc steps are always "available" — reading isn't tracked, so a doc step
 * can never be "completed" or "current" (Q3). The first not-yet-completed
 * challenge step becomes "current"; later ones stay "available".
 * `completedChallengeSlugs === null` means signed-out: every challenge step
 * renders "available", no progress pointer.
 */
export const computeStepStatuses = (
  steps: readonly PathStep[],
  completedChallengeSlugs: ReadonlySet<string> | null
): readonly StepStatus[] => {
  let currentAssigned = false
  return steps.map((step) => {
    if (step.type === "doc") return "available"
    if (completedChallengeSlugs === null) return "available"
    if (completedChallengeSlugs.has(step.challengeSlug)) return "completed"
    if (currentAssigned) return "available"
    currentAssigned = true
    return "current"
  })
}
