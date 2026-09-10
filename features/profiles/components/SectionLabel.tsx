import type { ReactNode } from "react"

/** The heading `StatsStrip` and `BadgesSection` draw inline — kept in sync by hand. */
export const SectionLabel = ({
  children,
  note,
}: {
  readonly children: ReactNode
  readonly note?: string
}): ReactNode => (
  <div className="text-fg-muted border-line mb-4 flex items-center gap-2.5 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
    {children}
    {note !== undefined && (
      <span className="text-fg-faint font-normal tracking-[0.04em]">{note}</span>
    )}
  </div>
)
