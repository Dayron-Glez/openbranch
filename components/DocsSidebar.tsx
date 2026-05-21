"use client"

import { usePathname } from "fumadocs-core/framework"
import { SidebarItem } from "fumadocs-ui/components/sidebar/base"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

// Mirrors the itemVariants "link" variant from fumadocs-ui docs/slots/sidebar — the
// base SidebarItem is an unstyled Link; we must replicate the layout ourselves.
const itemCls = [
  "relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start",
  "text-fd-muted-foreground transition-colors",
  "hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
  "data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

export function DocsSidebarItem({ item }: { item: PageTreeItem }) {
  const pathname = usePathname()
  const active = item.url === pathname

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarItem href={item.url} icon={item.icon} active={active} className={itemCls}>
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
        </SidebarItem>
      </TooltipTrigger>
      <TooltipContent side="right">{item.name}</TooltipContent>
    </Tooltip>
  )
}
