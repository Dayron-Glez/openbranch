import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { MutationResult } from "./types"

type MutationRowProps = {
  readonly mutation: MutationResult
}

const MutationRow = ({ mutation }: MutationRowProps): React.ReactElement => {
  const dot = mutation.killed ? (
    <span className="text-ob-accent mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-green-500/10 font-mono text-[11px]">
      ✓
    </span>
  ) : (
    <span className="border-fg-faint mt-0.5 size-4.5 shrink-0 rounded-full border-2" />
  )
  const nameClass = mutation.killed ? "text-fg-2" : "text-fg-muted"
  return (
    <div className="flex items-start gap-2.5">
      {dot}
      <span className={`font-mono text-[11.5px] leading-[1.5] ${nameClass}`}>{mutation.label}</span>
    </div>
  )
}

type RegressionsPanelProps = {
  readonly mutations: readonly MutationResult[]
  readonly killedCount: number
  readonly allMutantsKilled: boolean
  readonly running: boolean
  readonly dict: PlaygroundDict
}

export const RegressionsPanel = ({
  mutations,
  killedCount,
  allMutantsKilled,
  running,
  dict,
}: RegressionsPanelProps): React.ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
        {dict.active.regressionsLabel}
      </p>
      <span
        className={`font-mono text-[11.5px] font-medium tabular-nums transition-colors ${
          allMutantsKilled ? "text-ob-accent" : "text-fg-muted"
        }`}
      >
        {killedCount}/{mutations.length} {dict.active.caught}
      </span>
    </div>
    <div
      className={`border-line bg-bg-elev flex flex-col gap-2.5 rounded-(--r-8) border p-3 transition-opacity duration-200 ${
        running ? "animate-pulse opacity-50" : ""
      }`}
    >
      {mutations.map((mutation) => (
        <MutationRow key={mutation.id} mutation={mutation} />
      ))}
    </div>
  </div>
)
