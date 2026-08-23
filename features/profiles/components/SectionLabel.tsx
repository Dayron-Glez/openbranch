import type { ReactNode } from "react"

/**
 * The rule-under-a-mono-caption heading that `StatsStrip` and `BadgesSection`
 * already draw inline. Repeated here for the two sections this feature adds so
 * all five read as one page; the note slot carries a count ("1", "5 of 7").
 */
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
