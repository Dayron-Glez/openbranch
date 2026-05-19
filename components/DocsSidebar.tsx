import { cache } from "react"
import { SidebarItem } from "fumadocs-ui/components/sidebar/base"
import { MaturityBadge } from "@/components/MaturityBadge"
import { source } from "@/lib/source"
import { i18n } from "@/lib/i18n"
import type { Maturity } from "@/lib/maturity"
import type { Item as PageTreeItem } from "fumadocs-core/page-tree"

// One map per request, shared across all sidebar Item renders.
// source.getPages(lang) is synchronous — data lives in memory at startup.
const getMaturityMap = cache((): Map<string, Maturity> => {
  const map = new Map<string, Maturity>()
  for (const lang of i18n.languages) {
    for (const page of source.getPages(lang)) {
      map.set(page.url, page.data.maturity)
    }
  }
  return map
})

export function DocsSidebarItem({ item }: { item: PageTreeItem }) {
  const maturity = getMaturityMap().get(item.url)

  return (
    <SidebarItem href={item.url} icon={item.icon}>
      <span className="flex-1 truncate">{item.name}</span>
      {maturity && maturity !== "draft" && <MaturityBadge maturity={maturity} size="xs" />}
    </SidebarItem>
  )
}
