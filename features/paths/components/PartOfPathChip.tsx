import type { ReactNode } from "react"
import Link from "next/link"
import { IconRoute } from "@/icons"
import type { LearningPath } from "@/features/paths/domain/paths"

type PartOfPathChipProps = {
  readonly path: LearningPath
  readonly href: string
  readonly locale: "es" | "en"
  readonly label: string
  readonly stepOf: (n: number, total: number) => string
  readonly stepIndex: number
}

export const PartOfPathChip = ({
  path,
  href,
  locale,
  label,
  stepOf,
  stepIndex,
}: PartOfPathChipProps): ReactNode => (
  <Link
    href={href}
    data-track={path.track}
    className="inline-flex w-fit items-center gap-1.5 rounded-full border border-(--track-ring) bg-(--track-soft) px-2.5 py-[3px] font-mono text-[11px] text-(color:--track) no-underline"
  >
    <IconRoute className="size-3 shrink-0" />
    {label} · {path.title[locale]} · {stepOf(stepIndex + 1, path.steps.length)}
  </Link>
)
