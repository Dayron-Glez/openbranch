import type React from "react"
import type { ReactNode } from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { CompletionReward } from "../server/reward-service"
import { RewardCountUp } from "./RewardCountUp"
import { CheckIcon, ClockIcon } from "./ResultIcons"

type RewardMomentProps = {
  readonly reward: CompletionReward | null
  readonly currentElapsedDisplay: string | null
  readonly dict: PlaygroundDict["reward"]
}

const FlameIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 1.5c.7 2 2.7 2.7 2.7 5.3a2.7 2.7 0 0 1-5.4 0c0-.7.2-1.3.7-2 0 1 .7 1.3 1 1.3.3-1.3-.3-2.7 1-4.6z" />
  </svg>
)

const TrophyIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 2.5h6v4a3 3 0 0 1-6 0v-4z" />
    <path d="M5 3.5H3a1 1 0 0 0-1 1c0 1.7 1 2.7 2.7 2.7M11 3.5h2a1 1 0 0 1 1 1c0 1.7-1 2.7-2.7 2.7" />
    <path d="M8 9.5v2.5M6 13.5h4M7 12h2" />
  </svg>
)

const CHIP_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px]"
const CHIP_ACCENT = `${CHIP_BASE} bg-accent-soft border-accent-ring text-ob-accent`
const CHIP_NORMAL = `${CHIP_BASE} bg-bg-card border-line text-fg-2`
const CHIP_DIMMED = `${CHIP_BASE} bg-bg-card border-line text-fg-muted`

export const RewardMoment = ({
  reward,
  currentElapsedDisplay,
  dict,
}: RewardMomentProps): React.ReactElement | null => {
  if (reward === null) return null

  if (!reward.isFirstCompletion) {
    const hasTimeComparison =
      currentElapsedDisplay !== null && reward.firstRunElapsedDisplay !== null

    return (
      <div className="mt-5 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={CHIP_DIMMED}>
            <FlameIcon />
            {dict.streakUnchangedLabel}
          </span>
          {hasTimeComparison && (
            <span className={CHIP_NORMAL}>
              <ClockIcon />
              {dict.timeComparisonLabel
                .replace("{current}", currentElapsedDisplay as string)
                .replace("{first}", reward.firstRunElapsedDisplay as string)}
            </span>
          )}
        </div>
        <p className="text-fg-muted font-mono text-[12px]">{dict.repeatNote}</p>
      </div>
    )
  }

  const streakLabel =
    reward.streakEffect === "extended"
      ? dict.streakExtendedLabel.replace("{day}", String(reward.currentStreak))
      : dict.streakStartedLabel

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={CHIP_ACCENT}>
          <CheckIcon />+
          <RewardCountUp from={0} to={reward.pointsEarned} /> {dict.pointsSuffix}
        </span>
        <span className={CHIP_ACCENT}>
          <FlameIcon />
          {streakLabel}
          {reward.streakEffect === "extended" && (
            <span className="text-ob-accent/70">{dict.streakExtendedTag}</span>
          )}
        </span>
        {reward.rank !== null && (
          <span className={CHIP_NORMAL}>
            <TrophyIcon />
            {dict.rankLabel.replace("{rank}", String(reward.rank))}
          </span>
        )}
      </div>
      <p className="text-fg-muted font-mono text-[12px]">
        {reward.totalPointsBefore} <span aria-hidden="true">→</span>{" "}
        <RewardCountUp
          from={reward.totalPointsBefore}
          to={reward.totalPointsAfter}
          className="text-ob-accent"
        />{" "}
        {dict.totalPointsSuffix}
      </p>
      {reward.streakEffect === "started" && (
        <p className="text-fg-muted font-mono text-[12px]">{dict.streakStartedNote}</p>
      )}
    </div>
  )
}
