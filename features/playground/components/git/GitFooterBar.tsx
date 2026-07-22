"use client"

import { useState } from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { HintPanel } from "@/features/playground/components/HintPanel"

type GitFooterBarProps = {
  hints: readonly string[]
  conflictsResolved: number
  totalConflicts: number
  hasTypeErrors: boolean | null
  hiddenTestsPassed: number
  totalHiddenTests: number
  isRunning: boolean
  canSubmit: boolean
  isPending: boolean
  dict: PlaygroundDict
  onSubmit: () => void
  onReset: () => void
}

type GateChipProps = {
  label: string
  value: string
  passed: boolean
  isError?: boolean
}

const GateChip = ({ label, value, passed, isError }: Readonly<GateChipProps>) => {
  const dotColorIfNotPassed = isError ? "bg-danger" : "bg-fg-faint"
  const dotColor = passed ? "bg-ob-accent" : dotColorIfNotPassed
  const valueColorIfNotPassed = isError ? "text-danger" : "text-fg-muted"
  const valueColor = passed ? "text-ob-accent" : valueColorIfNotPassed

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${dotColor}`} />
      <span className="text-fg-muted">{label}</span>
      <span className={`font-medium tabular-nums transition-colors ${valueColor}`}>{value}</span>
    </div>
  )
}

export const GitFooterBar = ({
  hints,
  conflictsResolved,
  totalConflicts,
  hasTypeErrors,
  hiddenTestsPassed,
  totalHiddenTests,
  isRunning,
  canSubmit,
  isPending,
  dict,
  onSubmit,
  onReset,
}: Readonly<GitFooterBarProps>) => {
  const [hintsOpen, setHintsOpen] = useState<boolean>(false)

  const conflictsDone = conflictsResolved === totalConflicts
  const typeOk = hasTypeErrors === false
  const typeError = hasTypeErrors === true
  const branchesDone = totalHiddenTests > 0 && hiddenTestsPassed === totalHiddenTests

  const conflictValue = `${conflictsResolved}/${totalConflicts}`
  const branchValue = isRunning ? dict.active.running : `${hiddenTestsPassed}/${totalHiddenTests}`

  const toggleHints = (): void => setHintsOpen((prev) => !prev)

  return (
    <div className="relative shrink-0">
      {hintsOpen && (
        <div className="pg-left-scroll border-line bg-bg-card absolute right-0 bottom-full left-0 z-10 max-h-72 overflow-y-auto border-t px-7 py-5 shadow-lg">
          <HintPanel
            hints={hints}
            revealLabel={dict.active.revealHint}
            hintsLabel={dict.active.hintsLabel}
          />
        </div>
      )}

      <div className="border-line bg-bg-elev flex h-[52px] items-center gap-5 border-t px-7">
        {/* ── Gates ── */}
        <div className="flex items-center gap-5">
          <GateChip
            label={dict.active.conflictsLabel}
            value={conflictValue}
            passed={conflictsDone}
          />
          <GateChip
            label={dict.active.typeChecksLabel}
            value={typeOk ? "✓" : "✗"}
            passed={typeOk}
            isError={typeError}
          />
          <GateChip
            label={dict.active.branchesPreservedLabel}
            value={branchValue}
            passed={branchesDone}
          />
        </div>

        {canSubmit && (
          <span className="ob-rise bg-accent-soft text-ob-accent rounded px-2 py-0.5 font-mono text-[10.5px]">
            {dict.active.mergeClean}
          </span>
        )}

        <div className="flex-1" />

        {/* ── Actions ── */}
        <button
          type="button"
          onClick={toggleHints}
          className={`flex items-center gap-1.5 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease) ${
            hintsOpen ? "text-fg-2" : "text-fg-muted hover:text-fg-2"
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            className="size-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3M8 10.5v.5" />
          </svg>
          {dict.active.hintsLabel}
          <span className="text-fg-faint">({hints.length})</span>
        </button>

        <div className="bg-line h-3.5 w-px" />

        <button
          type="button"
          onClick={onReset}
          className="text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
        >
          {dict.active.resetCode}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isPending}
          className="bg-ob-accent text-accent-ink flex h-8 items-center gap-2 rounded-(--r-8) px-4 font-mono text-[12px] font-medium transition-opacity disabled:opacity-40"
        >
          {isPending ? (
            <>
              <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {dict.active.submitting}
            </>
          ) : (
            dict.active.submitMerge
          )}
        </button>
      </div>
    </div>
  )
}
