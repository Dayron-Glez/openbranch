"use client"

import type { DocsCriterion } from "@/lib/playground/docs-types"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {dict.active.docsChecklistHeading}
        </p>
        <span className="text-fg-muted font-mono text-[11.5px] tabular-nums">
          {passedCount}/{criteria.length}
        </span>
      </div>

      <div className="border-line bg-bg-elev flex flex-col gap-3 rounded-[var(--r-8)] border p-3">
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

      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending}
        className="bg-ob-accent text-accent-ink flex h-10 w-full items-center justify-center gap-2 rounded-[var(--r-8)] font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
      >
        {isPending ? (
          <>
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {dict.active.submitting}
          </>
        ) : (
          dict.active.docsSubmitButton
        )}
      </button>
    </div>
  )
}
