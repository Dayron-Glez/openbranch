import { useState, useEffect, useRef, useCallback } from "react"
import type { WorkerResultMessage } from "./useMergeEditor"

const MIN_RUNNING_MS = 500

type HiddenTestResult = { readonly name: string; readonly passed: boolean }

type MergeRunnerState = {
  readonly status: "idle" | "running" | "done"
  readonly results: readonly HiddenTestResult[]
}

type UseMergeRunnerReturn = {
  readonly runnerState: MergeRunnerState
  readonly runHiddenTests: (mergedCode: string) => void
}

type UseMergeRunnerArgs = {
  readonly hiddenTests: string
  readonly extraModules: readonly string[]
}

const IDLE_STATE: MergeRunnerState = { status: "idle", results: [] }

const applyWorkerResult = (
  msg: WorkerResultMessage,
  setRunnerState: (state: MergeRunnerState) => void
): void => {
  if (msg.type === "error") {
    setRunnerState({ status: "done", results: [] })
    return
  }
  const results: HiddenTestResult[] = msg.results.map((result) => ({
    name: result.name,
    passed: result.status === "pass",
  }))
  setRunnerState({ status: "done", results })
}

export const useMergeRunner = ({
  hiddenTests,
  extraModules,
}: UseMergeRunnerArgs): UseMergeRunnerReturn => {
  const [runnerState, setRunnerState] = useState<MergeRunnerState>(IDLE_STATE)
  const workerRef = useRef<Worker | null>(null)
  const runStartRef = useRef<number>(0)

  useEffect(() => {
    const worker = new Worker(
      new URL("../../../lib/playground/test-runner.worker.ts", import.meta.url)
    )
    worker.onmessage = (event: MessageEvent<WorkerResultMessage>): void => {
      const msg = event.data
      if (msg.type !== "result" && msg.type !== "error") return

      const remaining = MIN_RUNNING_MS - (Date.now() - runStartRef.current)
      if (remaining > 0) setTimeout(() => applyWorkerResult(msg, setRunnerState), remaining)
      else applyWorkerResult(msg, setRunnerState)
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [])

  const runHiddenTests = useCallback(
    (mergedCode: string): void => {
      const worker = workerRef.current
      if (worker === null) return
      runStartRef.current = Date.now()
      setRunnerState({ status: "running", results: [] })
      worker.postMessage({
        type: "run",
        userCode: mergedCode,
        testCode: hiddenTests,
        extraModules,
      })
    },
    [hiddenTests, extraModules]
  )

  return { runnerState, runHiddenTests }
}
