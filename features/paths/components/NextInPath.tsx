import type { ReactNode } from "react"
import Link from "next/link"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import { Eyebrow } from "@/shared/Eyebrow"

type NextInPathProps = {
  readonly track: TrackColorToken
  readonly href: string
  readonly title: string
  readonly meta: string
  readonly icon: ReactNode
  readonly label: string
  readonly cta: string
}

export const NextInPath = ({
  track,
  href,
  title,
  meta,
  icon,
  label,
  cta,
}: NextInPathProps): ReactNode => (
  <Link
    href={href}
    data-track={track}
    className="mt-6 flex items-center gap-4 rounded-(--r-12) border border-(--track-ring) bg-(--track-soft) p-5 text-inherit no-underline max-sm:flex-col max-sm:items-start"
  >
    <span className="bg-bg-card inline-grid size-11 shrink-0 place-items-center rounded-(--r-10) border border-(--track-ring) text-(color:--track) [&_svg]:size-[22px]">
      {icon}
    </span>
    <div className="flex-1">
      <Eyebrow tone="track" size="xs" as="div">
        {label}
      </Eyebrow>
      <div className="text-fg text-15 font-medium">{title}</div>
      <div className="text-fg-muted mt-0.5 font-mono text-xs">{meta}</div>
    </div>
    <span className="text-13 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-(--r-8) bg-(--track) px-4 font-semibold text-(color:--track-ink) max-sm:w-full">
      {cta}
    </span>
  </Link>
)
