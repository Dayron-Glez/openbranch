"use client"

import type React from "react"
import type { ReviewDecision } from "@/lib/playground/review-types"

type ReviewPanelDict = {
  readonly submitButton: string
  readonly decisionLabel: string
  readonly decisionApprove: string
  readonly decisionComment: string
  readonly decisionRequestChanges: string
  readonly commentSingular: string
  readonly commentPlural: string
  readonly noComments: string
  readonly submitRequirements: string
}

type DecisionOption = {
  readonly value: "approve" | "comment" | "request-changes"
  readonly label: string
}

type ReviewPanelProps = {
  readonly commentsCount: number
  readonly decision: ReviewDecision
  readonly onDecisionChange: (d: ReviewDecision) => void
  readonly onSubmit: () => void
  readonly isPending: boolean
  readonly dict: ReviewPanelDict
}

export const ReviewPanel = ({
  commentsCount,
  decision,
  onDecisionChange,
  onSubmit,
  isPending,
  dict,
}: ReviewPanelProps): React.ReactElement => {
  const canSubmit = commentsCount > 0 && decision !== null

  const decisions: DecisionOption[] = [
    { value: "approve", label: dict.decisionApprove },
    { value: "comment", label: dict.decisionComment },
    { value: "request-changes", label: dict.decisionRequestChanges },
  ]

  const getDecisionClasses = (value: DecisionOption["value"]): string => {
    const isSelected = decision === value
    if (!isSelected) {
      return "border-line hover:border-line-2 text-fg-2 hover:text-fg"
    }
    if (value === "approve") return "border-ob-accent/50 bg-ob-accent/10 text-ob-accent"
    if (value === "request-changes") return "border-danger/50 bg-danger/10 text-danger"
    return "border-line-2 bg-bg-elev text-fg"
  }

  const countLabel = commentsCount === 1 ? dict.commentSingular : dict.commentPlural
  const commentsText = commentsCount === 0 ? dict.noComments : `${commentsCount} ${countLabel}`

  return (
    <div className="flex flex-col gap-5">
      {/* decision selector */}
      <div>
        <p className="text-fg-muted mb-2.5 font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {dict.decisionLabel}
        </p>
        <div className="flex flex-col gap-1.5">
          {decisions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onDecisionChange(decision === value ? null : value)}
              className={`flex h-[38px] w-full items-center rounded-[var(--r-8)] border px-3 font-mono text-[12.5px] transition-colors duration-(--d-fast) ease-(--ease) ${getDecisionClasses(value)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* comment count indicator */}
      <div className="bg-bg-elev border-line flex items-center justify-between rounded-[var(--r-8)] border px-3 py-2.5">
        <span className="text-fg-muted font-mono text-[11.5px]">Inline comments</span>
        <span
          className={`font-mono text-[13px] font-medium tabular-nums ${commentsCount > 0 ? "text-ob-accent" : "text-fg-muted"}`}
        >
          {commentsText}
        </span>
      </div>

      {/* submit */}
      <div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isPending}
          className="bg-ob-accent text-accent-ink h-10 w-full rounded-[var(--r-8)] font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
        >
          {dict.submitButton}
        </button>
        {!canSubmit && (
          <p className="text-fg-muted mt-2 text-center font-mono text-[11px] leading-[1.5]">
            {dict.submitRequirements}
          </p>
        )}
      </div>
    </div>
  )
}
