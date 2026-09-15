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
  <div className="flex flex-col items-start gap-2">
    <h1 className="text-fg text-xl leading-[1.2] font-medium tracking-[-0.02em]">{title}</h1>
    <Link
      href={challengePath}
      className="text-fg-muted hover:text-fg-2 text-2xs inline-flex items-center gap-1.5 font-mono transition-colors duration-(--d-fast) ease-(--ease)"
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
