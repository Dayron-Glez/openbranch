export type MutationResult = {
  readonly id: string
  readonly label: string
  readonly killed: boolean
}

export type LocalizedMutant = {
  readonly id: string
  readonly label: string
  readonly code: string
}

export type WorkerTestingMessage =
  | {
      readonly type: "testing-result"
      readonly baseline: ReadonlyArray<{
        readonly name: string
        readonly status: "pass" | "fail"
        readonly error?: { readonly expected: string; readonly received: string }
      }>
      readonly mutations: readonly MutationResult[]
    }
  | { readonly type: "error"; readonly message: string }
