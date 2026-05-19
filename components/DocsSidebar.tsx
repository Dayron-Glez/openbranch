"use client"

import { SidebarItem } from "fumadocs-ui/components/sidebar/base"
import { useMaturityMap } from "@/components/MaturityProvider"
import { MATURITY_CLASSES, MATURITY_LABEL, MATURITY_SIZE_CLASSES } from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

export function DocsSidebarItem({ item }: { item: PageTreeItem }) {
  const maturity = useMaturityMap().get(item.url)

  return (
    <SidebarItem href={item.url} icon={item.icon}>
      <span className="flex-1 truncate">{item.name}</span>
      {maturity && maturity !== "draft" && <BadgeXs maturity={maturity} />}
    </SidebarItem>
  )
}

// Duplicates MaturityBadge markup — client components cannot import server components.
function BadgeXs({ maturity }: { maturity: Maturity }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES.xs,
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </span>
  )
}
