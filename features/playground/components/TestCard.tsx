import type React from "react"

export type TestStatus = "idle" | "running" | "pass" | "fail"

export type TestResult = {
  readonly name: string
  readonly status: TestStatus
  readonly error?: {
    readonly expected: string
    readonly received: string
  }
}

export type TestRunState = {
  readonly status: TestStatus
  readonly tests: readonly TestResult[]
  readonly passCount: number
  readonly totalCount: number
  readonly compileError: string | null
}

export const INITIAL_TEST_STATE: TestRunState = {
  status: "idle",
  tests: [],
  passCount: 0,
  totalCount: 0,
  compileError: null,
}

type TestCardProps = {
  readonly test: TestResult
  readonly index: number
}

export const TestCard = ({ test, index }: TestCardProps): React.ReactElement => {
  let statusDot: React.ReactElement
  if (test.status === "pass") {
    statusDot = (
      <span className="text-ob-accent bg-ob-accent/10 mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full font-mono text-[11px]">
        ✓
      </span>
    )
  } else if (test.status === "fail") {
    statusDot = (
      <span className="text-danger bg-danger/10 mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full font-mono text-[11px]">
        ✕
      </span>
    )
  } else if (test.status === "running") {
    statusDot = (
      <span className="border-fg-faint mt-0.5 size-4.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
    )
  } else {
    statusDot = <span className="border-fg-faint mt-0.5 size-4.5 shrink-0 rounded-full border-2" />
  }

  let nameClass = "text-fg-muted"
  if (test.status === "pass") nameClass = "text-fg-2"
  else if (test.status === "fail") nameClass = "text-fg"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2.5">
        {statusDot}
        <span className={`font-mono text-[11.5px] leading-[1.5] ${nameClass}`}>
          {index + 1}. {test.name}
        </span>
      </div>
      {test.status === "fail" && test.error !== undefined && (
        <div className="border-line bg-danger/4 ml-6.5 rounded-(--r-8) border px-3 py-2">
          <div className="mb-1 flex gap-3 font-mono text-[11px]">
            <span className="text-fg-muted w-16 shrink-0 tracking-wide uppercase">Expected</span>
            <span className="text-ob-accent truncate">{test.error.expected}</span>
          </div>
          <div className="flex gap-3 font-mono text-[11px]">
            <span className="text-fg-muted w-16 shrink-0 tracking-wide uppercase">Received</span>
            <span className="text-danger truncate">{test.error.received}</span>
          </div>
        </div>
      )}
    </div>
  )
}
