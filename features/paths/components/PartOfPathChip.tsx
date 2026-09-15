import type { ReactNode } from "react"
import Link from "next/link"
import { IconRoute } from "@/icons"
import { flattenSteps, type LearningPath } from "@/features/paths/domain/paths"

type PartOfPathChipProps = {
  readonly path: LearningPath
  readonly href: string
  readonly label: string
  readonly stepOf: (n: number, total: number) => string
  readonly stepIndex: number
}

export const PartOfPathChip = ({
  path,
  href,
  label,
  stepOf,
  stepIndex,
}: PartOfPathChipProps): ReactNode => (
  <Link
    href={href}
    data-track={path.track}
    className="text-2xs inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border border-(--track-ring) bg-(--track-soft) px-2.5 py-[3px] font-mono text-(color:--track) no-underline"
  >
    <IconRoute className="size-3 shrink-0" />
    <span className="shrink-0">{label}</span>
    <span className="shrink-0" aria-hidden="true">
      ·
    </span>
    <span className="min-w-0 truncate">{path.title}</span>
    <span className="max-narrow:hidden shrink-0" aria-hidden="true">
      ·
    </span>
    <span className="max-narrow:hidden shrink-0">
      {stepOf(stepIndex + 1, flattenSteps(path).length)}
    </span>
  </Link>
)
