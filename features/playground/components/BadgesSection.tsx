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
import { TRACK_BY_BADGE_KEY } from "@/features/playground/domain/manifest"

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

// Badges backed by a server action that awards them on challenge completion.
const AWARDED_BADGE_KEYS = [
  "first-merge",
  "review-corps",
  "coverage-hero",
  "ship-it",
  "doc-writer",
  "streak-7",
  "all-tracks",
] as const

// Badges planned for future tracks/features — displayed as locked teasers, not yet awardable.
const PLANNED_BADGE_KEYS = [] as const

const BADGE_KEYS = [...AWARDED_BADGE_KEYS, ...PLANNED_BADGE_KEYS] as const

/** Denominator for a "N of TOTAL" caption, derived so it cannot drift. */
export const TOTAL_BADGE_COUNT: number = BADGE_KEYS.length

type BadgeKey = (typeof BADGE_KEYS)[number]

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
                className={`inline-grid size-9 place-items-center rounded-(--r-10) border [&_svg]:size-4.25 ${tileClassName}`}
              >
                {BADGE_ICONS[key]}
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
