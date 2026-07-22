import type { ReactNode } from "react"

const DIFFICULTY_LEVEL: Record<string, number> = { beginner: 1, moderate: 2, demanding: 3 }

type DiffBarsProps = { readonly difficulty: string }

export const DiffBars = ({ difficulty }: DiffBarsProps): ReactNode => {
  const level = DIFFICULTY_LEVEL[difficulty] ?? 1
  return (
    <span className="inline-flex h-3 shrink-0 items-end gap-[3px]">
      <i
        className={`block h-[5px] w-[3px] rounded-[1px] not-italic ${level >= 1 ? "bg-fg-2" : "bg-fg-faint"}`}
      />
      <i
        className={`block h-2 w-[3px] rounded-[1px] not-italic ${level >= 2 ? "bg-fg-2" : "bg-fg-faint"}`}
      />
      <i
        className={`block h-3 w-[3px] rounded-[1px] not-italic ${level >= 3 ? "bg-fg-2" : "bg-fg-faint"}`}
      />
    </span>
  )
}
