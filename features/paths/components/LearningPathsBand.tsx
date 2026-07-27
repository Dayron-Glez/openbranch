import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowRight } from "@/icons"
import { PathCard, PATH_CARD_GRID, type PathCardDict, type PathCardItem } from "./PathCard"

type LearningPathsBandProps = {
  readonly items: readonly PathCardItem[]
  readonly heading: string
  readonly sub: string
  /** The index route — the band is a teaser for it, not the full catalogue. */
  readonly allHref: string
  readonly allLabel: string
  readonly cardDict: PathCardDict
}

export const LearningPathsBand = ({
  items,
  heading,
  sub,
  allHref,
  allLabel,
  cardDict,
}: LearningPathsBandProps): ReactNode => {
  if (items.length === 0) return null

  return (
    <div>
      <div className="text-fg-muted border-line mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5 border-b pb-2.5">
        <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
          {heading}
        </span>
        <span className="text-fg-muted hidden font-mono text-[11.5px] sm:inline">{sub}</span>
        <Link
          href={allHref}
          className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 font-mono text-[11.5px] no-underline transition-colors"
        >
          {allLabel}
          <IconArrowRight className="size-3" />
        </Link>
      </div>
      <div className={PATH_CARD_GRID}>
        {items.map((item) => (
          <PathCard key={item.href} item={item} dict={cardDict} />
        ))}
      </div>
    </div>
  )
}
