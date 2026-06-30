"use client"

import type { DocsCriterion } from "@/features/playground/domain/docs-types"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { ChallengeSubmitButton } from "@/features/playground/components/ChallengeSubmitButton"

type DocsChecklistProps = {
  readonly criteria: readonly DocsCriterion[]
  readonly content: string
  readonly isPending: boolean
  readonly dict: PlaygroundDict
  readonly onSubmit: () => void
}

export const DocsChecklist = ({
  criteria,
  content,
  isPending,
  dict,
  onSubmit,
}: DocsChecklistProps) => {
  const results = criteria.map((criterion) => ({
    criterion,
    passed: criterion.check(content) === "pass",
  }))

  const passedCount = results.filter((r) => r.passed).length
  const allPassed = passedCount === criteria.length
  const canSubmit = allPassed && !isPending

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {dict.active.docsChecklistHeading}
        </p>
        <span
          className={`font-mono text-[11.5px] tabular-nums ${allPassed ? "text-ob-accent" : "text-fg-muted"}`}
        >
          {passedCount}/{criteria.length}
        </span>
      </div>

      <div className="border-line bg-bg-elev flex flex-col gap-3 rounded-(--r-8) border p-3">
        {results.map(({ criterion, passed }) => (
          <div key={criterion.id} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 shrink-0 font-mono text-[12px] ${passed ? "text-ob-accent" : "text-fg-faint"}`}
              aria-hidden="true"
            >
              {passed ? "✓" : "○"}
            </span>
            <span
              className={`font-mono text-[12px] leading-snug ${passed ? "text-fg" : "text-fg-muted"}`}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>

      {allPassed && (
        <div className="border-accent-ring bg-accent-soft rounded-(--r-8) border px-3 py-2.5">
          <p className="text-ob-accent font-mono text-[12px]">{dict.active.docsAllCriteriaMet}</p>
        </div>
      )}

      <ChallengeSubmitButton
        label={dict.active.docsSubmitButton}
        submittingLabel={dict.active.submitting}
        disabled={!canSubmit}
        isPending={isPending}
        onClick={onSubmit}
      />
    </div>
  )
}
