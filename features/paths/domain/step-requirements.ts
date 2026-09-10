import type { PathStep } from "./paths"

/**
 * Orthogonal to `StepStatus`: a step can be `completed` and still need a wide
 * viewport — finished on a laptop, now browsed on a phone.
 */
export type StepRequirement = "none" | "wide-viewport"

export const requirementForStep = (step: PathStep): StepRequirement =>
  step.type === "challenge" ? "wide-viewport" : "none"
