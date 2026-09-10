import type { ReactNode } from "react"

export const EmptySection = ({
  icon,
  title,
  body,
}: {
  readonly icon: ReactNode
  readonly title: string
  readonly body: string
}): ReactNode => (
  <div className="border-line-2 bg-bg-elev flex items-center gap-3.5 rounded-(--r-12) border border-dashed px-5 py-[22px]">
    <span className="border-line bg-bg-card text-fg-muted grid size-[38px] shrink-0 place-items-center rounded-(--r-10) border [&_svg]:size-[18px]">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-fg-2 m-0 text-[13.5px] font-medium">{title}</p>
      <p className="text-fg-muted m-0 mt-1 text-[12.5px] leading-[1.5]">{body}</p>
    </div>
  </div>
)
