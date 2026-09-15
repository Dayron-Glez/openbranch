import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowRight, IconClock } from "@/icons"
import { Eyebrow } from "@/shared/Eyebrow"

type StartingLineProps = {
  readonly href: string
  readonly challengeTitle: string
  readonly challengeIcon: ReactNode
  readonly challengeCategoryLabel: string
  readonly challengeMinutes: number
  readonly eyebrow: string
  readonly heading: string
  readonly body: string
  readonly cta: string
  readonly minutesLabel: string
}

export const StartingLine = ({
  href,
  challengeTitle,
  challengeIcon,
  challengeCategoryLabel,
  challengeMinutes,
  eyebrow,
  heading,
  body,
  cta,
  minutesLabel,
}: StartingLineProps) => {
  return (
    <div className="border-line bg-bg-card mb-9 grid grid-cols-[1fr_auto] items-center gap-7 rounded-(--r-12) border p-6 max-sm:grid-cols-1">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Eyebrow tone="accent">{eyebrow}</Eyebrow>
          <h2 className="text-xl leading-snug font-semibold tracking-[-0.015em]">{heading}</h2>
          <p className="text-fg-2 max-w-[52ch] text-sm leading-[1.6]">{body}</p>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="border-line bg-bg-elev text-fg-2 inline-grid size-9 shrink-0 place-items-center rounded-(--r-8) border [&_svg]:size-[17px]">
            {challengeIcon}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-15 leading-snug font-medium">{challengeTitle}</p>
            <div className="flex items-center gap-3">
              <span className="border-line bg-bg-elev text-fg-muted text-2xs rounded-(--r-6) border px-2 py-0.5 font-mono tracking-[0.04em]">
                {challengeCategoryLabel}
              </span>
              <span className="text-fg-muted text-2xs inline-flex items-center gap-1 font-mono">
                <IconClock className="size-3 shrink-0" />
                {challengeMinutes} {minutesLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-sm:self-start">
        <Link
          href={href}
          className="group bg-ob-accent text-accent-ink inline-flex items-center gap-2 rounded-(--r-8) px-5 py-2.5 text-sm font-medium no-underline transition-opacity duration-(--d-fast) ease-(--ease) hover:opacity-90"
        >
          {cta}
          <IconArrowRight className="size-4 transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
        </Link>
      </div>
    </div>
  )
}
