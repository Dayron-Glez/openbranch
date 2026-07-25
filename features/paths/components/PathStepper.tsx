import type { ReactNode } from "react"
import Link from "next/link"
import { IconBook, IconClock, IconCheck, IconLock, IconArrowRight } from "@/icons"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import type { StepStatus } from "@/features/paths/domain/path-status"
import { DiffBars } from "@/shared/DiffBars"

export type ResolvedPathStep =
  | {
      readonly type: "doc"
      readonly href: string
      readonly title: string
      readonly description: string
      readonly readingLabel: string
      readonly status: StepStatus
    }
  | {
      readonly type: "challenge"
      readonly href: string
      readonly title: string
      readonly description: string
      readonly difficulty: string
      readonly difficultyLabel: string
      readonly timeLabel: string
      readonly pointsLabel: string
      readonly icon: ReactNode
      readonly status: StepStatus
    }

type PathStepperDict = {
  readonly guideLabel: string
  readonly challengeLabel: string
  readonly openGuide: string
  readonly openChallenge: string
  readonly startChallenge: string
  readonly youAreHere: string
  readonly available: string
  readonly completed: string
  readonly stepOf: (n: number, total: number) => string
}

type PathStepperProps = {
  readonly steps: readonly ResolvedPathStep[]
  readonly track: TrackColorToken
  readonly dict: PathStepperDict
}

const MARK_CLASS: Readonly<Record<StepStatus, string>> = {
  available: "border-line-2 bg-bg-elev text-fg-2",
  current:
    "border-(--track) bg-(--track-soft) text-(color:--track) shadow-[0_0_0_4px_var(--track-soft)]",
  completed: "border-accent-ring bg-accent-soft text-ob-accent",
  locked: "border-line bg-bg-elev text-fg-faint",
}

const StepMark = ({
  status,
  type,
  icon,
}: {
  readonly status: StepStatus
  readonly type: "doc" | "challenge"
  readonly icon: ReactNode
}): ReactNode => {
  if (status === "completed") return <IconCheck className="size-[21px]" />
  if (status === "locked") return <IconLock className="size-[19px]" />
  if (type === "doc") return <IconBook className="size-[19px]" />
  return icon
}

const getStepCta = (step: ResolvedPathStep, dict: PathStepperDict): string => {
  if (step.type === "doc") return dict.openGuide
  if (step.status === "current") return dict.startChallenge
  return dict.openChallenge
}

export const PathStepper = ({ steps, track, dict }: PathStepperProps): ReactNode => {
  const total = steps.length

  return (
    <div data-track={track} className="flex flex-col">
      {steps.map((step, index) => (
        <div key={step.href} className="grid grid-cols-[48px_1fr] gap-5">
          <div className="flex flex-col items-center">
            <div
              className={`grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] [&_svg]:shrink-0 ${MARK_CLASS[step.status]}`}
            >
              <StepMark
                status={step.status}
                type={step.type}
                icon={step.type === "challenge" ? step.icon : null}
              />
            </div>
            {index < steps.length - 1 && <div className="bg-line-2 my-2 min-h-6.5 w-0.5 flex-1" />}
          </div>

          <div
            className={`bg-bg-card mb-3.5 rounded-(--r-12) border p-5 ${
              step.status === "current" ? "border-(--track-ring)" : "border-line"
            } ${step.status === "locked" ? "opacity-60" : ""}`}
          >
            <div className="text-fg-muted mb-2.5 flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.09em] uppercase">
              <span>{dict.stepOf(index + 1, total)}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 [&_svg]:size-3 ${
                  step.type === "challenge"
                    ? "border-(--track-ring) bg-(--track-soft) text-(color:--track)"
                    : "border-line-2 bg-bg-elev text-fg-2"
                }`}
              >
                {step.type === "doc" ? <IconBook /> : step.icon}
                {step.type === "doc" ? dict.guideLabel : dict.challengeLabel}
              </span>
              <span className="ml-auto normal-case">
                {step.status === "completed" && (
                  <span className="text-ob-accent inline-flex items-center gap-1.5">
                    <IconCheck className="size-3.5" />
                    {dict.completed}
                  </span>
                )}
                {step.status === "current" && (
                  <span className="text-(color:--track)">{dict.youAreHere}</span>
                )}
                {(step.status === "available" || step.status === "locked") && (
                  <span>{dict.available}</span>
                )}
              </span>
            </div>

            <h3 className="text-fg m-0 mb-1.5 text-[18px] font-semibold tracking-[-0.01em]">
              {step.title}
            </h3>
            <p className="text-fg-muted m-0 mb-4 max-w-[64ch] text-[13.5px] leading-[1.55]">
              {step.description}
            </p>

            <div className="flex items-center justify-between gap-3.5">
              <div className="text-fg-muted flex items-center gap-4 font-mono text-[11.5px]">
                {step.type === "doc" ? (
                  <span className="inline-flex items-center gap-1.5">
                    <IconBook className="size-3" />
                    {step.readingLabel}
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <DiffBars difficulty={step.difficulty} />
                      {step.difficultyLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IconClock className="size-3" />
                      {step.timeLabel}
                    </span>
                    <span className="text-(color:--track)">{step.pointsLabel}</span>
                  </>
                )}
              </div>

              <Link
                href={step.href}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-(--r-8) px-3.5 text-[13px] font-medium no-underline transition-colors ${
                  step.status === "current"
                    ? "bg-(--track) text-(color:--track-ink) hover:brightness-110"
                    : "border-line-2 bg-bg-elev text-fg-2 hover:text-fg border"
                }`}
              >
                {getStepCta(step, dict)}
                <IconArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
