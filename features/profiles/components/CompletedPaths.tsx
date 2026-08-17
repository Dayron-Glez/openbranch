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

/**
 * Only finished paths appear, so every card renders `PathCard`'s completed
 * state — the two-node collapsed stepper from specs/path-card-completed-state.md.
 * Nothing here special-cases that: the cards are handed a progress object where
 * every step is done, and the component already knows what to draw.
 */
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
