export type MergeGateStatus = "idle" | "pass" | "fail"

export type MergeGates = {
  readonly conflictsResolved: number
  readonly totalConflicts: number
  readonly typeChecks: MergeGateStatus
  readonly hiddenTestResults: readonly { readonly name: string; readonly passed: boolean }[]
}
