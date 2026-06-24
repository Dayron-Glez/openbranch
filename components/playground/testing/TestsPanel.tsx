import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { TestCard } from "@/components/playground/TestCard"
import type { TestRunState } from "@/components/playground/TestCard"

type TestsPanelProps = {
  readonly testState: TestRunState
  readonly hasRun: boolean
  readonly dict: PlaygroundDict
}

export const TestsPanel = ({ testState, hasRun, dict }: TestsPanelProps): React.ReactElement => {
  const baselineAllPass = testState.status === "pass"
  const isRunning = testState.status === "running"

  let countClass = "text-fg-muted"
  if (baselineAllPass) countClass = "text-ob-accent"
  else if (testState.status === "fail") countClass = "text-danger"

  const countLabel =
    testState.totalCount > 0
      ? `${testState.passCount}/${testState.totalCount} ${dict.active.passing}`
      : dict.active.waitingForEditor

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {dict.active.testsLabel}
        </p>
        <span
          className={`font-mono text-[11.5px] font-medium tabular-nums transition-colors ${countClass}`}
        >
          {testState.status === "running" ? (
            <span className="flex items-center gap-1.5">
              <span className="border-fg-faint size-3 animate-spin rounded-full border border-t-transparent" />
              {dict.active.running}
            </span>
          ) : (
            countLabel
          )}
        </span>
      </div>

      {testState.compileError !== null && (
        <div className="rounded-(--r-8) border border-red-500/20 bg-red-500/[0.03] p-3">
          <p className="text-danger mb-1 font-mono text-[10.5px] tracking-wide uppercase">
            {dict.active.syntaxError}
          </p>
          <p className="text-fg-muted font-mono text-[11px] leading-relaxed">
            {dict.active.fixSyntax}
          </p>
        </div>
      )}
      {testState.compileError === null && isRunning && testState.tests.length === 0 && (
        <div className="border-line bg-bg-elev flex items-center gap-2.5 rounded-(--r-8) border p-3">
          <span className="border-fg-faint size-3.5 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-fg-muted font-mono text-[11.5px]">{dict.active.running}</span>
        </div>
      )}
      {testState.compileError === null && !isRunning && !hasRun && (
        <p className="text-fg-muted font-mono text-[11.5px]">{dict.active.writeTestsToStart}</p>
      )}
      {testState.compileError === null && testState.tests.length > 0 && (
        <div
          className={`border-line bg-bg-elev flex flex-col gap-3 rounded-(--r-8) border p-3 transition-opacity duration-200 ${
            isRunning ? "animate-pulse opacity-50" : ""
          }`}
        >
          {testState.tests.map((test, index) => (
            <TestCard key={test.name} test={test} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
