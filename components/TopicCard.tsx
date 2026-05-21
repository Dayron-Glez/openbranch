import type { ReactNode } from "react"
import Link from "next/link"
import { IconArrowRight } from "@/icons"

type TopicCardProps = {
  href?: string
  icon: ReactNode
  title: string
  description: string
  count: string
  updated: string
}

export function TopicCard({
  href = "#",
  icon,
  title,
  description,
  count,
  updated,
}: TopicCardProps) {
  return (
    <Link
      href={href}
      className="group border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover flex flex-col gap-3 overflow-hidden rounded-[var(--r-12)] border px-7 pt-7 pb-6 text-inherit no-underline transition-[background,border-color] duration-[var(--d-base)] ease-[var(--ease)]"
    >
      <span className="border-line bg-bg-elev text-ob-accent mb-1.5 inline-flex size-10 items-center justify-center rounded-[var(--r-8)] border [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="m-0 text-lg font-medium tracking-[0]">{title}</h3>
      <p className="text-fg-muted m-0 max-w-[36ch] text-[13.5px] leading-[1.55]">{description}</p>
      <div className="text-fg-muted mt-2.5 flex items-center gap-3 font-mono text-[11px] tracking-[0.04em]">
        <span className="border-line bg-bg-elev text-fg-2 rounded-[var(--r-6)] border px-[7px] py-0.5">
          {count}
        </span>
        {updated && <span>{updated}</span>}
        <span className="group-hover:text-fg ml-auto transition-[transform,color] duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px] [&_svg]:size-3.5">
          <IconArrowRight />
        </span>
      </div>
    </Link>
  )
}
