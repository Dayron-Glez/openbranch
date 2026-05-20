"use client"

import { usePathname } from "fumadocs-core/framework"
import { SidebarItem } from "fumadocs-ui/components/sidebar/base"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useMaturityMap } from "@/components/MaturityProvider"
import { SuggestGuideButton } from "@/components/SuggestGuideButton"
import { MATURITY_CLASSES, MATURITY_SHORT_LABEL, MATURITY_SIZE_CLASSES } from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

const SUGGEST_PREFIX = "/_suggest/"

// Mirrors the itemVariants "link" variant from fumadocs-ui docs/slots/sidebar — the
// base SidebarItem is an unstyled Link; we must replicate the layout ourselves.
const itemCls = [
  "relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start",
  "text-fd-muted-foreground transition-colors",
  "hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
  "data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary",
  "[&_svg]:size-4 [&_svg]:shrink-0",
].join(" ")

export function DocsSidebarItem({ item }: Readonly<{ item: PageTreeItem }>) {
  const pathname = usePathname()
  const maturityMap = useMaturityMap()

  if (item.url.startsWith(SUGGEST_PREFIX)) {
    const sectionName = decodeURIComponent(item.url.slice(SUGGEST_PREFIX.length))
    return <SuggestGuideButton sectionName={sectionName} />
  }

  const maturity = maturityMap.get(item.url)
  const active = item.url === pathname

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <SidebarItem href={item.url} icon={item.icon} active={active} className={itemCls}>
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
          {maturity && maturity !== "draft" && <BadgeXs maturity={maturity} />}
        </SidebarItem>
      </TooltipTrigger>
      <TooltipContent side="right">{item.name}</TooltipContent>
    </Tooltip>
  )
}

// Duplicates MaturityBadge markup — client components cannot import server components.
function BadgeXs({ maturity }: Readonly<{ maturity: Maturity }>) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES.xs,
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      {MATURITY_SHORT_LABEL[maturity]}
    </span>
  )
}
