import type React from "react"
import Link from "next/link"
import { LogoMark } from "@/components/shared/LogoMark"

type PlaygroundNavProps = {
  readonly homeHref: string
}

export const PlaygroundNav = ({ homeHref }: PlaygroundNavProps): React.ReactElement => (
  <header className="border-line bg-bg/80 z-10 flex h-12 shrink-0 items-center border-b px-6 backdrop-blur-xl max-[520px]:px-4">
    <Link
      href={homeHref}
      className="text-fg-muted hover:text-fg-2 flex items-center gap-2 no-underline transition-colors duration-(--d-fast) ease-(--ease)"
      aria-label="Back to openbranch home"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 3L5 8l5 5" />
      </svg>
      <LogoMark size={18} />
      <span className="font-mono text-[12px]">
        <span className="font-light">open</span>
        <span className="font-semibold">branch</span>
      </span>
    </Link>
  </header>
)
