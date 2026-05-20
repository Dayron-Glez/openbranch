"use client"

import { buildPrUrl } from "@/lib/pr-templates/new-guide"
import type { Wanted } from "@/lib/wanted"

export function WantedSidebarItem({ wanted }: Readonly<{ wanted: Wanted }>) {
  const prUrl = buildPrUrl(wanted)

  return (
    <a
      href={prUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start",
        "border-line text-fd-muted-foreground border border-dashed",
        "hover:border-ob-accent hover:bg-ob-accent/8 hover:text-ob-accent transition-colors",
        "focus-visible:border-ob-accent focus-visible:bg-ob-accent/8 focus-visible:text-ob-accent",
        "outline-none",
      ].join(" ")}
      aria-label={`Open PR to create: ${wanted.title}`}
    >
      <span className="shrink-0 text-sm" aria-hidden="true">
        +
      </span>
      <span className="min-w-0 flex-1 truncate text-sm">{wanted.title}</span>
      <span
        className="text-ob-accent shrink-0 font-mono text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        PR →
      </span>
    </a>
  )
}
