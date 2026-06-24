import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { INITIAL_TEST_STATE } from "@/components/playground/TestCard"
import type { TestResult, TestRunState } from "@/components/playground/TestCard"
import type { LocalizedMutant, MutationResult, WorkerTestingMessage } from "./types"

// The worker finishes almost instantly; hold the "running" state for a short
// floor so the loading animation is perceptible instead of flashing.
const MIN_RUNNING_MS = 500

type UseTestingRunnerArgs = {
  readonly correctSource: string
  readonly mutants: readonly LocalizedMutant[]
  readonly showSolutionRef: React.RefObject<boolean>
}

type TestingRunner = {
  readonly testState: TestRunState
  readonly mutations: readonly MutationResult[]
  readonly runTests: (testCode: string) => void
}

// Owns the test-runner Web Worker: spawns it, translates "testing-result"
// messages into baseline + mutation state, and exposes runTests().
export const useTestingRunner = ({
  correctSource,
  mutants,
  showSolutionRef,
}: UseTestingRunnerArgs): TestingRunner => {
  const [testState, setTestState] = useState<TestRunState>(INITIAL_TEST_STATE)
  const [mutations, setMutations] = useState<readonly MutationResult[]>([])
  const workerRef = useRef<Worker | null>(null)
  const runStartRef = useRef<number>(0)

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../lib/playground/test-runner.worker.ts", import.meta.url)
    )
    worker.onmessage = (event: MessageEvent<WorkerTestingMessage>): void => {
      const msg = event.data
      if (msg.type !== "error" && msg.type !== "testing-result") return
      if (showSolutionRef.current) return

      const apply = (): void => {
        if (msg.type === "error") {
          setTestState((prev) => ({
            ...prev,
            status: "fail" as const,
            tests: [],
            compileError: msg.message,
          }))
          setMutations([])
          return
        }
        const results: TestResult[] = msg.baseline.map((result) => ({
          name: result.name,
          status: result.status,
          error: result.error,
        }))
        const passCount = results.filter((result) => result.status === "pass").length
        const allPass = passCount === results.length && results.length > 0
        setTestState({
          status: allPass ? "pass" : "fail",
          tests: results,
          passCount,
          totalCount: results.length,
          compileError: null,
        })
        setMutations(msg.mutations)
      }

      const remaining = MIN_RUNNING_MS - (Date.now() - runStartRef.current)
      if (remaining > 0) setTimeout(apply, remaining)
      else apply()
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [showSolutionRef])

  const runTests = useCallback(
    (testCode: string): void => {
      const worker = workerRef.current
      if (worker === null) return
      runStartRef.current = Date.now()
      setTestState((prev) => ({ ...prev, status: "running", compileError: null }))
      worker.postMessage({ type: "run-testing", testCode, correctSource, mutants })
    },
    [correctSource, mutants]
  )

  return { testState, mutations, runTests }
}
