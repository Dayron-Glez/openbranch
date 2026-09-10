import type { ReactNode } from "react"
import {
  PathCard,
  PATH_CARD_GRID,
  type PathCardDict,
  type PathCardItem,
} from "@/features/paths/components/PathCard"
import { IconRoute } from "@/icons"
import type { ProfileDict } from "@/lib/dictionaries/profile"
import { SectionLabel } from "./SectionLabel"
import { EmptySection } from "./EmptySection"

export const CompletedPaths = ({
  items,
  cardDict,
  dict,
}: {
  readonly items: readonly PathCardItem[]
  readonly cardDict: PathCardDict
  readonly dict: ProfileDict
}): ReactNode => (
  <section>
    <SectionLabel note={items.length > 0 ? String(items.length) : undefined}>
      {dict.pathsHeading}
    </SectionLabel>
    {items.length === 0 ? (
      <EmptySection icon={<IconRoute />} title={dict.pathsEmptyTitle} body={dict.pathsEmptyBody} />
    ) : (
      <div className={PATH_CARD_GRID}>
        {items.map((item) => (
          <PathCard key={item.href} item={item} dict={cardDict} />
        ))}
      </div>
    )}
  </section>
)
