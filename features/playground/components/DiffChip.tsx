import type { ReactNode } from "react"

/** Marks the editor as showing the solution diff rather than the user's work. */
export const DiffChip = (): ReactNode => (
  <span className="bg-warn/15 text-warn rounded px-1.5 py-0.5 font-mono text-[10px] tracking-widest uppercase">
    diff
  </span>
)
