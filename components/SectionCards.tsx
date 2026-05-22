import { Card, Cards } from "fumadocs-ui/components/card"
import type { source } from "@/lib/source"

type Page = (typeof source)["$inferPage"]

export function SectionCards({ pages }: { readonly pages: Page[] }) {
  if (pages.length === 0) return null

  return (
    <Cards>
      {pages.map((page) => (
        <Card
          key={page.url}
          href={page.url}
          title={page.data.title}
          description={page.data.description}
        />
      ))}
    </Cards>
  )
}
