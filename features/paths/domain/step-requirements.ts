import type { PathStep } from "./paths"

/**
 * Orthogonal to StepStatus (path-status.ts) — a step can be `completed` and
 * still need a wide viewport (finished on a laptop, now browsing on a
 * phone). Keeping this separate avoids an unrepresentable combined state.
 */
export type StepRequirement = "none" | "wide-viewport"

export const requirementForStep = (step: PathStep): StepRequirement =>
  step.type === "challenge" ? "wide-viewport" : "none"
