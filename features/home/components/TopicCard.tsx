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
}: Readonly<TopicCardProps>) {
  return (
    <Link
      href={href}
      className="group border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover max-narrow:gap-2 max-narrow:px-4 max-narrow:pt-5 max-narrow:pb-4 flex flex-col gap-3 overflow-hidden rounded-(--r-12) border px-7 pt-7 pb-6 text-inherit no-underline transition-[background,border-color] duration-(--d-base) ease-(--ease)"
    >
      <span className="border-line bg-bg-elev text-ob-accent max-narrow:size-8 max-narrow:[&_svg]:size-4 mb-1.5 inline-flex size-10 items-center justify-center rounded-(--r-8) border [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="max-narrow:text-sm text-lg font-medium tracking-[0]">{title}</h3>
      <p className="text-fg-muted max-narrow:hidden max-w-[36ch] text-sm leading-[1.55]">
        {description}
      </p>
      <div className="text-fg-muted max-narrow:mt-auto max-narrow:gap-1.5 text-2xs mt-2.5 flex items-center gap-3 font-mono tracking-[0.04em]">
        <span className="border-line bg-bg-elev text-fg-2 rounded-(--r-6) border px-[7px] py-0.5">
          {count}
        </span>
        {updated && <span className="max-narrow:hidden">{updated}</span>}
        <span className="group-hover:text-fg ml-auto transition-[transform,color] duration-(--d-fast) ease-(--ease) group-hover:translate-x-[3px] [&_svg]:size-3.5">
          <IconArrowRight />
        </span>
      </div>
    </Link>
  )
}
