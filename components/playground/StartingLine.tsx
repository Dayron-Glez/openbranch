import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowRight, IconClock } from "@/icons"

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
    <div className="border-line bg-bg-card mb-9 grid grid-cols-[1fr_auto] items-center gap-7 rounded-[var(--r-12)] border p-6 max-[640px]:grid-cols-1">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-ob-accent mb-2.5 font-mono text-[11px] tracking-[0.1em] uppercase">
            {eyebrow}
          </p>
          <h2 className="m-0 mb-2 text-[20px] leading-snug font-semibold tracking-[-0.015em]">
            {heading}
          </h2>
          <p className="text-fg-2 m-0 max-w-[52ch] text-sm leading-[1.6]">{body}</p>
        </div>
        <div className="flex items-center gap-3.5">
          <span className="border-line bg-bg-elev text-fg-2 inline-grid size-9 shrink-0 place-items-center rounded-[var(--r-8)] border [&_svg]:size-[17px]">
            {challengeIcon}
          </span>
          <div>
            <p className="m-0 mb-1 text-[15px] leading-snug font-medium">{challengeTitle}</p>
            <div className="flex items-center gap-3">
              <span className="border-line bg-bg-elev text-fg-muted rounded-[var(--r-6)] border px-2 py-0.5 font-mono text-[11px] tracking-[0.04em]">
                {challengeCategoryLabel}
              </span>
              <span className="text-fg-muted inline-flex items-center gap-1 font-mono text-[11px]">
                <IconClock className="size-3 shrink-0" />
                {challengeMinutes} {minutesLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-[640px]:self-start">
        <Link
          href={href}
          className="group bg-ob-accent text-accent-ink inline-flex items-center gap-2 rounded-[var(--r-8)] px-5 py-2.5 text-sm font-medium no-underline transition-opacity duration-[var(--d-fast)] ease-[var(--ease)] hover:opacity-90"
        >
          {cta}
          <IconArrowRight className="size-4 transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-0.75" />
        </Link>
      </div>
    </div>
  )
}
