import Link from "next/link"

type ChallengeSidebarHeaderProps = {
  readonly title: string
  readonly challengePath: string
  readonly exitLabel: string
}

export const ChallengeSidebarHeader = ({
  title,
  challengePath,
  exitLabel,
}: ChallengeSidebarHeaderProps) => (
  <div>
    <h1 className="text-fg mb-2 text-[20px] leading-[1.2] font-medium tracking-[-0.02em]">
      {title}
    </h1>
    <Link
      href={challengePath}
      className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 3L5 8l5 5" />
      </svg>
      {exitLabel}
    </Link>
  </div>
)
