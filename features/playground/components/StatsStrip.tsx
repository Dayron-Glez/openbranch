import type React from "react"
import { IconFlame } from "@/icons"
import { Badge } from "@/components/ui/badge"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { EngagementStats } from "../server/stats-service"
import { SectionLabel } from "@/shared/SectionLabel"

type StatsStripProps = {
  readonly dict: PlaygroundDict["stats"]
  readonly categoryDict: PlaygroundDict["category"]
  readonly stats: EngagementStats
  readonly totalChallenges: number
  readonly lang: string
  /**
   * Replaces the "next up: {track}" nudge under the completed count — right on
   * your own dashboard, wrong on someone else's profile. Omitted on the hub.
   */
  readonly completedSub?: string
}

const formatStreakEndDate = (lastCompletedOn: string, lang: string): string =>
  new Intl.DateTimeFormat(lang === "en" ? "en" : "es", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${lastCompletedOn}T00:00:00Z`))

const CELL_CLASS = "bg-bg-card flex min-w-0 flex-col gap-2 px-6 py-5"
const LABEL_CLASS = "text-fg-muted font-mono text-2xs tracking-[0.08em] uppercase"
const VALUE_CLASS =
  "flex items-baseline gap-2 text-[30px] leading-[1.1] font-light tracking-[-0.02em] tabular-nums"
const UNIT_CLASS = "text-fg-muted text-sm font-normal"
const SUB_CLASS = "text-fg-muted text-13"

const getTracksSub = (stats: EngagementStats, dict: PlaygroundDict["stats"]): string | null => {
  if (stats.tracksStarted === 0) return null
  if (stats.tracksStarted === 1) return dict.acrossTracksSingular
  return dict.acrossTracksPlural.replace("{count}", String(stats.tracksStarted))
}

const getStreakSub = (
  stats: EngagementStats,
  dict: PlaygroundDict["stats"],
  lang: string
): string => {
  if (stats.streakState === "alive") return dict.streakAlive
  if (stats.streakState === "broken" && stats.lastCompletedOn !== null) {
    return dict.streakBroken.replace("{date}", formatStreakEndDate(stats.lastCompletedOn, lang))
  }
  return dict.streakFirst
}

export const StatsStrip = ({
  dict,
  categoryDict,
  stats,
  totalChallenges,
  lang,
  completedSub,
}: StatsStripProps): React.ReactElement => {
  const streakAlive = stats.streakState === "alive"
  const tracksSub = getTracksSub(stats, dict)
  const defaultCompletedSub =
    stats.nextTrack !== null
      ? dict.nextUp.replace("{track}", categoryDict[stats.nextTrack])
      : dict.allTracksStarted
  const completedSubLine = completedSub ?? defaultCompletedSub

  return (
    <div>
      <SectionLabel>{dict.eyebrow}</SectionLabel>
      <div className="border-line overflow-hidden rounded-(--r-12) border">
        <div className="bg-line max-wide:grid-cols-2 max-narrow:grid-cols-1 grid grid-cols-4 gap-px">
          <div className={CELL_CLASS}>
            <span className={LABEL_CLASS}>{dict.points}</span>
            <span className={VALUE_CLASS}>
              {stats.totalPoints}
              {stats.pointsToday > 0 && (
                <Badge className="bg-accent-soft border-accent-ring text-ob-accent text-2xs self-center rounded-full border px-2 py-0 font-mono font-normal">
                  {dict.pointsToday.replace("{points}", String(stats.pointsToday))}
                </Badge>
              )}
            </span>
            {tracksSub !== null && <span className={SUB_CLASS}>{tracksSub}</span>}
          </div>

          <div className={CELL_CLASS}>
            <span className={LABEL_CLASS}>{dict.streak}</span>
            <span className={`${VALUE_CLASS} ${streakAlive ? "" : "text-fg-muted"}`}>
              <IconFlame
                aria-hidden
                className={`size-[17px] self-center ${streakAlive ? "text-ob-accent" : "text-fg-faint"}`}
              />
              {stats.currentStreak} <span className={UNIT_CLASS}>{dict.days}</span>
            </span>
            <span className={streakAlive ? "text-fg-2 text-13" : SUB_CLASS}>
              {getStreakSub(stats, dict, lang)}
            </span>
          </div>

          <div className={CELL_CLASS}>
            <span className={LABEL_CLASS}>{dict.completed}</span>
            <span className={VALUE_CLASS}>
              {stats.completedCount}{" "}
              <span className={UNIT_CLASS}>
                {dict.of.replace("{total}", String(totalChallenges))}
              </span>
            </span>
            <span className={SUB_CLASS}>{completedSubLine}</span>
          </div>

          <div className={CELL_CLASS}>
            <span className={LABEL_CLASS}>{dict.best}</span>
            <span className={VALUE_CLASS}>
              {stats.bestStreak} <span className={UNIT_CLASS}>{dict.days}</span>
            </span>
            {stats.bestStreak > 0 && <span className={SUB_CLASS}>{dict.bestNote}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
