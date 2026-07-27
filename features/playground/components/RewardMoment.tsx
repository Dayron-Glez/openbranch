import type React from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { CompletionReward } from "../server/reward-service"
import type { TrackColorToken } from "../domain/manifest"
import { IconBook, IconRoute } from "@/icons"
import { RewardCountUp } from "./RewardCountUp"
import { CheckIcon, ClockIcon } from "./ResultIcons"

/**
 * Declared here rather than imported from the paths feature: this component
 * is presentation-only, and `features/paths` already depends on this feature
 * for `TrackColorToken`. The result page maps the domain model onto this
 * shape, so a status added there stops compiling until it is handled here.
 */
export type PathRecapStep = {
  readonly title: string
  readonly type: "doc" | "challenge"
  readonly status: "done" | "justCompleted" | "upcoming"
}

/**
 * Models both outcomes: a path finished, and a path advanced. `nextStep` is
 * what distinguishes them — `null` means there is nothing left to do.
 */
export type PathRecap = {
  readonly track: TrackColorToken
  readonly pathHref: string
  readonly pathTitle: string
  readonly otherPathsHref: string
  readonly steps: readonly PathRecapStep[]
  readonly completedChallengeCount: number
  readonly totalChallengeSteps: number
  readonly nextStep: { readonly title: string; readonly href: string } | null
}

type RewardMomentProps = {
  readonly reward: CompletionReward | null
  readonly currentElapsedDisplay: string | null
  readonly dict: PlaygroundDict["reward"]
  readonly pathRecap?: PathRecap | null
  readonly pathDict?: {
    readonly pathComplete: string
    readonly pathInProgress: string
    readonly youFinishedThePath: string
    readonly continuePath: string
    readonly explorePaths: string
    readonly nextInPath: string
    readonly guideLabel: string
    readonly challengeLabel: string
    readonly practiced: (done: number, total: number) => string
  }
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

const STEP_MARKER_BASE = "inline-grid size-6 shrink-0 place-items-center rounded-full border"

const stepMarkerClass = (status: PathRecapStep["status"]): string => {
  if (status === "justCompleted") {
    return `${STEP_MARKER_BASE} bg-ob-accent border-ob-accent text-accent-ink [&_svg]:size-3`
  }
  if (status === "done") {
    return `${STEP_MARKER_BASE} bg-accent-soft border-accent-ring text-ob-accent [&_svg]:size-3`
  }
  return `${STEP_MARKER_BASE} border-line text-fg-faint`
}

const StepRow = ({
  step,
  dict,
}: {
  readonly step: PathRecapStep
  readonly dict: NonNullable<RewardMomentProps["pathDict"]>
}): ReactNode => (
  <div className="flex items-center gap-2.5 text-[13.5px]">
    <span className={stepMarkerClass(step.status)}>
      {step.status === "upcoming" ? (
        <span className="bg-fg-faint size-1.5 rounded-full" />
      ) : (
        <CheckIcon />
      )}
    </span>
    <span
      className={`flex-1 ${step.status === "upcoming" ? "text-fg-muted" : "text-fg-2"} ${
        step.status === "justCompleted" ? "text-fg font-medium" : ""
      }`}
    >
      {step.title}
    </span>
    <span className="text-fg-muted inline-flex items-center gap-1 font-mono text-[10.5px]">
      {step.type === "doc" ? <IconBook className="size-3" /> : <IconRoute className="size-3" />}
      {step.type === "doc" ? dict.guideLabel : dict.challengeLabel}
    </span>
  </div>
)

/**
 * Two outcomes, told apart by `nextStep`: a path finished, or a path
 * advanced. Claiming completion mid-path was the v1 bug this replaces.
 */
const PathRecapCard = ({
  recap,
  dict,
}: {
  readonly recap: PathRecap
  readonly dict: NonNullable<RewardMomentProps["pathDict"]>
}): ReactNode => {
  const finished = recap.nextStep === null

  return (
    <div
      data-track={recap.track}
      className="bg-bg-card mt-2 w-full max-w-[420px] rounded-(--r-16) border border-(--track-ring) p-6 text-left"
    >
      <Link
        href={recap.pathHref}
        className="mb-4 flex items-center gap-2.5 text-inherit no-underline hover:underline"
      >
        <span className="size-2 shrink-0 rounded-full bg-(--track)" />
        <span className="min-w-0 font-mono text-[10.5px] tracking-[0.1em] text-(color:--track) uppercase">
          {finished ? dict.pathComplete : dict.pathInProgress} · {recap.pathTitle}
        </span>
      </Link>

      <p className="text-fg m-0 mb-4 text-[16px] font-medium">
        {finished
          ? dict.youFinishedThePath
          : dict.practiced(recap.completedChallengeCount, recap.totalChallengeSteps)}
      </p>

      <div className="mb-5 flex flex-col gap-2">
        {recap.steps.map((step, index) => (
          <StepRow key={`${step.type}-${index}`} step={step} dict={dict} />
        ))}
      </div>

      {recap.nextStep === null ? (
        <Link
          href={recap.otherPathsHref}
          className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-(--r-8) bg-(--track) text-[13px] font-semibold text-(color:--track-ink) no-underline"
        >
          {dict.explorePaths}
        </Link>
      ) : (
        <>
          <p className="text-fg-muted m-0 mb-2 font-mono text-[10.5px] tracking-[0.08em] uppercase">
            {dict.nextInPath}
          </p>
          <Link
            href={recap.nextStep.href}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-(--r-8) bg-(--track) px-3 text-[13px] font-semibold text-(color:--track-ink) no-underline"
          >
            <span className="min-w-0 truncate">{dict.continuePath}</span>
          </Link>
          <p className="text-fg-2 m-0 mt-2 text-center text-[12.5px]">{recap.nextStep.title}</p>
        </>
      )}
    </div>
  )
}

export const RewardMoment = ({
  reward,
  currentElapsedDisplay,
  dict,
  pathRecap,
  pathDict,
}: RewardMomentProps): React.ReactElement | null => {
  if (reward === null) return null

  /**
   * Rendered by both branches. The chips below are rewards — a repeat earns
   * no points, leaves the streak alone and does not move your rank — but the
   * recap answers "where am I in this path", which stays true on a repeat.
   */
  const recap =
    pathRecap != null && pathDict !== undefined ? (
      <PathRecapCard recap={pathRecap} dict={pathDict} />
    ) : null

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
        {recap}
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
      {recap}
    </div>
  )
}
