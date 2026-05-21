"use client"

import { usePathname } from "fumadocs-core/framework"
import { SidebarItem, useFolderDepth } from "fumadocs-ui/components/sidebar/base"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

// Base classes — matches fumadocs itemVariants "link" variant
const baseCls = [
  "relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start",
  "text-fd-muted-foreground transition-colors",
  "hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
  "data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

// Left accent bar on active child items — fumadocs "highlight" variant
const highlightCls = [
  "data-[active=true]:before:content-['']",
  "data-[active=true]:before:bg-fd-primary",
  "data-[active=true]:before:absolute",
  "data-[active=true]:before:w-px",
  "data-[active=true]:before:inset-y-2.5",
  "data-[active=true]:before:inset-s-2.5",
].join(" ")

// Matches fumadocs getItemOffset: depth 0 → 8px, depth 1 → 20px, depth 2 → 32px…
function getItemOffset(depth: number): string {
  return `calc(${2 + 3 * depth} * var(--spacing))`
}

export function DocsSidebarItem({ item }: { item: PageTreeItem }) {
  const pathname = usePathname()
  const depth = useFolderDepth()
  const active = item.url === pathname

  return (
    <SidebarItem
      href={item.url}
      active={active}
      className={depth >= 1 ? `${baseCls} ${highlightCls}` : baseCls}
      style={{ paddingInlineStart: getItemOffset(depth) }}
    >
      <span className="min-w-0 flex-1">{item.name}</span>
    </SidebarItem>
  )
}
