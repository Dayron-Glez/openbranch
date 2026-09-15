import type { ReactNode } from "react"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import { IconFlask } from "@/icons"
import type { ProfileDict } from "@/lib/dictionaries/profile"
import { SectionLabel } from "@/shared/SectionLabel"
import { EmptySection } from "./EmptySection"

export type ActivityItem = {
  readonly challengeSlug: string
  /** Resolved from MDX by the page — challenge titles do not live in the database. */
  readonly title: string
  readonly trackLabel: string
  readonly track: TrackColorToken | null
  readonly relativeDate: string
  readonly points: number
}

export const ActivityFeed = ({
  items,
  dict,
}: {
  readonly items: readonly ActivityItem[]
  readonly dict: ProfileDict
}): ReactNode => (
  <section>
    <SectionLabel>{dict.activityHeading}</SectionLabel>
    {items.length === 0 ? (
      <EmptySection
        icon={<IconFlask />}
        title={dict.activityEmptyTitle}
        body={dict.activityEmptyBody}
      />
    ) : (
      <div className="border-line divide-line bg-bg-card divide-y overflow-hidden rounded-(--r-12) border">
        {items.map((item) => (
          <div
            key={item.challengeSlug}
            data-track={item.track ?? undefined}
            className="flex items-center gap-3 px-[18px] py-3.5"
          >
            <span
              className={`size-[7px] shrink-0 rounded-full ${
                item.track === null ? "bg-fg-faint" : "bg-(--track)"
              }`}
            />
            <span className="text-13 min-w-0 flex-1 truncate">
              <span className="text-fg font-medium">{item.title}</span>
              <span className="text-fg-muted"> · {item.trackLabel}</span>
            </span>
            <span className="text-fg-muted text-2xs shrink-0 font-mono">{item.relativeDate}</span>
            <span className="text-fg-2 text-2xs shrink-0 font-mono tabular-nums">
              {dict.activityPoints(item.points)}
            </span>
          </div>
        ))}
        <p className="text-fg-muted bg-bg-elev text-2xs px-[18px] py-2.5 font-mono">
          {items.length === 1 ? dict.activityFirst : dict.activityCaption(items.length)}
        </p>
      </div>
    )}
  </section>
)
