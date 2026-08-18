"use client"

import { useState } from "react"
import {
  IconGitMerge,
  IconPR,
  IconFlask,
  IconRocket,
  IconFlame,
  IconAward,
  IconBook,
} from "@/icons"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import {
  BADGE_KEYS,
  TRACK_BY_BADGE_KEY,
  type BadgeKey,
} from "@/features/playground/domain/manifest"
import { BadgeUnlockIcon } from "./badges/BadgeUnlockIcon"

type BadgesSectionProps = {
  readonly dict: PlaygroundDict["badges"]
  readonly earnedBadges: ReadonlySet<string>
  /**
   * "Complete challenges to unlock badges" is an instruction to the person
   * looking, which only makes sense when they are the person who would earn
   * them. A public profile suppresses it rather than telling a stranger to go
   * work on someone else's collection. Defaults to showing it, so the hub is
   * unchanged.
   */
  readonly showLockMessage?: boolean
  /** Muted note beside the heading, e.g. "5 of 7". */
  readonly headingNote?: string
}

const BADGE_ICONS: Record<BadgeKey, React.ReactNode> = {
  "first-merge": <IconGitMerge />,
  "review-corps": <IconPR />,
  "coverage-hero": <IconFlask />,
  "ship-it": <IconRocket />,
  "doc-writer": <IconBook />,
  "streak-7": <IconFlame />,
  "all-tracks": <IconAward />,
}

const getTileClassName = (earned: boolean, hasTrack: boolean): string => {
  if (!earned) return "border-line bg-bg-elev text-fg-faint"
  if (hasTrack) return "border-(--track-ring) bg-(--track-soft) text-(color:--track)"
  return "border-accent-ring bg-accent-soft text-ob-accent"
}

export const BadgesSection = ({
  dict,
  earnedBadges,
  showLockMessage = true,
  headingNote,
}: BadgesSectionProps) => {
  const hasLocked = BADGE_KEYS.some((key) => !earnedBadges.has(key))

  // Hovering an earned tile replays its unlock choreography — playKey bumps
  // on every mouse-enter so re-hovering the same tile retriggers it.
  const [hoveredKey, setHoveredKey] = useState<BadgeKey | null>(null)
  const [playKey, setPlayKey] = useState<number>(0)

  const handleEnter = (key: BadgeKey): void => {
    setHoveredKey(key)
    setPlayKey((prev) => prev + 1)
  }
  const handleLeave = (): void => setHoveredKey(null)

  return (
    <div>
      <div className="text-fg-muted border-line mb-4 flex items-center gap-2.5 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
        {dict.heading}
        {headingNote !== undefined && (
          <span className="text-fg-faint font-normal tracking-[0.04em]">{headingNote}</span>
        )}
      </div>
      <div className="mb-3 grid grid-cols-7 gap-3 max-[980px]:grid-cols-4 max-[520px]:grid-cols-2">
        {BADGE_KEYS.map((key) => {
          const earned = earnedBadges.has(key)
          const track = TRACK_BY_BADGE_KEY.get(key)
          const tileClassName = getTileClassName(earned, track !== undefined)
          return (
            <div
              key={key}
              className={`border-line bg-bg-card flex flex-col items-center gap-2.5 rounded-(--r-10) border p-4 text-center transition-opacity ${earned ? "text-fg" : "text-fg-muted opacity-50"}`}
            >
              <span
                data-track={earned ? track?.colorToken : undefined}
                onMouseEnter={earned ? () => handleEnter(key) : undefined}
                onMouseLeave={earned ? handleLeave : undefined}
                className={`inline-grid size-9 place-items-center rounded-(--r-10) border [&_svg]:size-4.25 ${tileClassName}`}
              >
                {earned && hoveredKey === key ? (
                  <BadgeUnlockIcon badgeKey={key} playKey={playKey} />
                ) : (
                  BADGE_ICONS[key]
                )}
              </span>
              <span className="font-mono text-[11px]">{dict[key].name}</span>
            </div>
          )
        })}
      </div>
      {hasLocked && showLockMessage && (
        <p className="text-fg-muted m-0 font-mono text-[12px]">{dict.lockMessage}</p>
      )}
    </div>
  )
}
