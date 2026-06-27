import type { PlaygroundDict } from "@/lib/playground-dictionary"

type GateRowProps = {
  label: string
  value: string
  passed: boolean
  index: number
}

const GateRow = ({ label, value, passed, index }: Readonly<GateRowProps>) => (
  <div
    className="ob-rise flex items-center justify-between"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <span className="text-fg-muted font-mono text-[11.5px]">{label}</span>
    <span
      className={`font-mono text-[11.5px] font-medium tabular-nums transition-colors ${
        passed ? "text-ob-accent" : "text-fg-muted"
      }`}
    >
      {value}
    </span>
  </div>
)

type MergeGatesPanelProps = {
  conflictsResolved: number
  totalConflicts: number
  hasTypeErrors: boolean
  hiddenTestsPassed: number
  totalHiddenTests: number
  isRunning: boolean
  dict: PlaygroundDict
}

export const MergeGatesPanel = ({
  conflictsResolved,
  totalConflicts,
  hasTypeErrors,
  hiddenTestsPassed,
  totalHiddenTests,
  isRunning,
  dict,
}: Readonly<MergeGatesPanelProps>) => {
  const conflictsDone = conflictsResolved === totalConflicts
  const typeOk = !hasTypeErrors
  const branchesDone = totalHiddenTests > 0 && hiddenTestsPassed === totalHiddenTests

  const branchValue = isRunning
    ? dict.active.running
    : dict.active.conflictsResolved
        .replace("{k}", String(hiddenTestsPassed))
        .replace("{n}", String(totalHiddenTests))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
        {dict.detail.metaValidation}
      </p>
      <div className="border-line bg-bg-elev flex flex-col gap-2.5 rounded-(--r-8) border p-3">
        <GateRow
          label={dict.active.conflictsLabel}
          value={dict.active.conflictsResolved
            .replace("{k}", String(conflictsResolved))
            .replace("{n}", String(totalConflicts))}
          passed={conflictsDone}
          index={0}
        />
        <GateRow
          label={dict.active.typeChecksLabel}
          value={typeOk ? "✓" : "✗"}
          passed={typeOk}
          index={1}
        />
        <GateRow
          label={dict.active.branchesPreservedLabel}
          value={branchValue}
          passed={branchesDone}
          index={2}
        />
      </div>
    </div>
  )
}
