import type React from "react"
import Link from "next/link"

type PlaygroundBreadcrumbProps = {
  readonly playgroundPath: string
  readonly challengePath: string
  readonly title: string
  readonly inProgressLabel: string
}

export const PlaygroundBreadcrumb = ({
  playgroundPath,
  challengePath,
  title,
  inProgressLabel,
}: PlaygroundBreadcrumbProps): React.ReactElement => (
  <nav className="mb-[22px] shrink-0" aria-label="Breadcrumb">
    <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
      <li>
        <Link href={playgroundPath} className="hover:text-fg-2 transition-colors">
          Playground
        </Link>
      </li>
      <li className="text-fg-faint" aria-hidden="true">
        /
      </li>
      <li>
        <Link href={challengePath} className="hover:text-fg-2 transition-colors">
          {title}
        </Link>
      </li>
      <li className="text-fg-faint" aria-hidden="true">
        /
      </li>
      <li>
        <span className="inline-flex items-center gap-1.5 text-amber-400">
          <span className="size-[6px] rounded-full bg-amber-400" />
          {inProgressLabel}
        </span>
      </li>
    </ol>
  </nav>
)
