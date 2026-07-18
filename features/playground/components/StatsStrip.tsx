import type React from "react"
import { IconFlame } from "@/icons"
import { Badge } from "@/components/ui/badge"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { EngagementStats } from "../server/stats-service"

type StatsStripProps = {
  readonly dict: PlaygroundDict["stats"]
  readonly categoryDict: PlaygroundDict["category"]
  readonly stats: EngagementStats
  readonly totalChallenges: number
  readonly lang: string
}

const formatStreakEndDate = (lastCompletedOn: string, lang: string): string =>
  new Intl.DateTimeFormat(lang === "en" ? "en" : "es", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${lastCompletedOn}T00:00:00Z`))

const CELL_CLASS = "bg-bg-card flex min-w-0 flex-col gap-2 px-6 py-5"
const LABEL_CLASS = "text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase"
const VALUE_CLASS =
  "flex items-baseline gap-2 text-[30px] leading-[1.1] font-light tracking-[-0.02em] tabular-nums"
const UNIT_CLASS = "text-fg-muted text-[14px] font-normal"
const SUB_CLASS = "text-fg-muted text-[12.5px]"

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
}: StatsStripProps): React.ReactElement => {
  const streakAlive = stats.streakState === "alive"
  const tracksSub = getTracksSub(stats, dict)
  const nextTrackSub =
    stats.nextTrack !== null
      ? dict.nextUp.replace("{track}", categoryDict[stats.nextTrack])
      : dict.allTracksStarted

  return (
    <div>
      <div className="text-fg-muted border-line mb-4 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
        {dict.eyebrow}
      </div>
      <div className="border-line overflow-hidden rounded-(--r-12) border">
        <div className="bg-line grid grid-cols-4 gap-px max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div className={CELL_CLASS}>
            <span className={LABEL_CLASS}>{dict.points}</span>
            <span className={VALUE_CLASS}>
              {stats.totalPoints}
              {stats.pointsToday > 0 && (
                <Badge className="bg-accent-soft border-accent-ring text-ob-accent self-center rounded-full border px-2 py-0 font-mono text-[11px] font-normal">
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
            <span className={streakAlive ? "text-fg-2 text-[12.5px]" : SUB_CLASS}>
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
            <span className={SUB_CLASS}>{nextTrackSub}</span>
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
