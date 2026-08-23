import type { ReactNode } from "react"
import Link from "next/link"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import { IconBook, IconCheck } from "@/icons"

/** `done` is `null` when signed out. Guides can be done too — they are read. */
export type PathCardStep = {
  readonly type: "doc" | "challenge"
  readonly done: boolean | null
}

export type PathCardItem = {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly track: TrackColorToken
  readonly trackLabel: string
  readonly icon: ReactNode
  readonly steps: readonly PathCardStep[]
  /** Counted on the server; `null` when signed out. */
  readonly progress: { readonly done: number; readonly total: number } | null
  /** Sum of every step's estimated time. Only shown once the path is complete. */
  readonly estimatedMinutes: number
}

export type PathCardDict = {
  /** e.g. "2 guides · 3 challenges" — shown when progress is unknown. */
  readonly shape: (guides: number, challenges: number) => string
  /** e.g. "3 de 5 completados" — used by the path page's progress bar. */
  readonly stepsDone: (done: number, total: number) => string
  /** e.g. "3 de 5" — bare fraction, for the card's in-progress caption. */
  readonly progressFraction: (done: number, total: number) => string
  readonly nextStepLabel: (kind: "doc" | "challenge") => string
  readonly routeComplete: string
  readonly stepsCount: (n: number) => string
  readonly minutesSuffix: string
}

/**
 * `auto-fill` rather than `auto-fit`: with a single path the card keeps its
 * width instead of stretching across the whole row, and the same class still
 * lays out three or more without breakpoints.
 */
export const PATH_CARD_GRID =
  "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]"

const NODE_BASE =
  "grid size-[21px] shrink-0 place-items-center rounded-full border-[1.5px] transition-[background-color,border-color,color,box-shadow] duration-(--d-base) ease-(--ease) [&_svg]:size-[11px]"

/** The icon a not-done node shows: what kind of step it is, not a status glyph. */
const StepTypeIcon = ({
  step,
  trackIcon,
}: {
  readonly step: PathCardStep
  readonly trackIcon: ReactNode
}): ReactNode => (step.type === "doc" ? <IconBook /> : trackIcon)

/**
 * One node per step. `current` is the first not-done step — only meaningful
 * while signed in and not yet finished; the caller gates it, so this never
 * has to ask "am I current" itself.
 */
const StepNode = ({
  step,
  trackIcon,
  current,
}: {
  readonly step: PathCardStep
  readonly trackIcon: ReactNode
  readonly current: boolean
}): ReactNode => {
  if (step.done === true) {
    return (
      <span className={`${NODE_BASE} bg-ob-accent border-ob-accent text-accent-ink`}>
        <IconCheck />
      </span>
    )
  }
  if (current) {
    return (
      <span
        className={`${NODE_BASE} border-(--track) bg-(--track-soft) text-(color:--track) shadow-[0_0_0_3px_var(--track-soft)]`}
      >
        <StepTypeIcon step={step} trackIcon={trackIcon} />
      </span>
    )
  }
  return (
    <span className={`${NODE_BASE} border-line-2 bg-bg-elev text-fg-faint`}>
      <StepTypeIcon step={step} trackIcon={trackIcon} />
    </span>
  )
}

const Segment = ({ done }: { readonly done: boolean }): ReactNode => (
  <span className={`h-[2px] flex-1 rounded-full ${done ? "bg-ob-accent" : "bg-line-2"}`} />
)

/**
 * The full node+segment sequence — every step in order. Used signed-out and
 * in-progress; the completed state renders `CollapsedStepper` instead.
 */
const FullStepper = ({
  steps,
  trackIcon,
  currentIndex,
}: {
  readonly steps: readonly PathCardStep[]
  readonly trackIcon: ReactNode
  /** -1 when there is no current step (signed out). */
  readonly currentIndex: number
}): ReactNode => (
  <div className="flex w-full items-center">
    {steps.map((step, index) => (
      <div key={`${step.type}-${index}`} className="flex flex-1 items-center last:flex-none">
        <StepNode step={step} trackIcon={trackIcon} current={index === currentIndex} />
        {index < steps.length - 1 && <Segment done={step.done === true} />}
      </div>
    ))}
  </div>
)

/**
 * Completed state: not CSS hiding nodes (the mock's trick, valid in static
 * HTML) — only the first and last step render at all. The real step count
 * lives in the caption, not the node count. A 1-step path (unreachable today,
 * the catalog validator requires at least one step per section, but cheap to
 * get right) collapses to a single node with no bar.
 */
const CollapsedStepper = ({ length }: { readonly length: number }): ReactNode => {
  const endpoints = [...new Set([0, length - 1])]
  return (
    <div className="relative flex w-full items-center justify-between">
      {endpoints.length > 1 && (
        <div className="bg-ob-accent absolute top-1/2 right-[21px] left-[21px] z-0 h-[2px] -translate-y-1/2 rounded-full" />
      )}
      {endpoints.map((index) => (
        <span key={index} className="relative z-10">
          <span className={`${NODE_BASE} bg-ob-accent border-ob-accent text-accent-ink`}>
            <IconCheck />
          </span>
        </span>
      ))}
    </div>
  )
}

const Caption = ({
  item,
  dict,
}: {
  readonly item: PathCardItem
  readonly dict: PathCardDict
}): ReactNode => {
  if (item.progress === null) {
    const challenges = item.steps.filter((step) => step.type === "challenge").length
    return (
      <span className="text-fg-muted font-mono text-[11px]">
        {dict.shape(item.steps.length - challenges, challenges)}
      </span>
    )
  }

  const { done, total } = item.progress
  if (total > 0 && done === total) {
    return (
      <span className="text-fg-muted flex items-center gap-1.5 font-mono text-[11px]">
        <span className="bg-ob-accent text-accent-ink grid size-3.5 shrink-0 place-items-center rounded-full [&_svg]:size-2">
          <IconCheck />
        </span>
        <span className="text-ob-accent">{dict.routeComplete}</span>
        <span className="bg-fg-faint size-[3px] shrink-0 rounded-full" />
        <span>
          {dict.stepsCount(item.steps.length)} · {item.estimatedMinutes} {dict.minutesSuffix}
        </span>
      </span>
    )
  }

  const currentStep = item.steps.find((step) => step.done !== true)
  return (
    <span className="text-fg-muted flex items-center gap-1.5 font-mono text-[11px]">
      <span className="text-fg-2">{dict.progressFraction(done, total)}</span>
      {currentStep !== undefined && (
        <>
          <span className="bg-fg-faint size-[3px] shrink-0 rounded-full" />
          <span>{dict.nextStepLabel(currentStep.type)}</span>
        </>
      )}
    </span>
  )
}

export const PathCard = ({
  item,
  dict,
}: {
  readonly item: PathCardItem
  readonly dict: PathCardDict
}): ReactNode => {
  const isCompleted =
    item.progress !== null && item.progress.total > 0 && item.progress.done === item.progress.total
  // Signed out means every step's `done` is `null`, so without gating on
  // sign-in the first step would read as "current" with nothing done.
  const currentIndex =
    item.progress !== null && !isCompleted ? item.steps.findIndex((step) => step.done !== true) : -1

  return (
    <Link
      href={item.href}
      data-track={item.track}
      className={`group border-line bg-bg-card hover:bg-bg-hover relative flex flex-col gap-3.5 overflow-hidden rounded-(--r-12) border p-[18px] text-inherit no-underline transition-colors before:absolute before:inset-x-0 before:top-0 before:h-[2.5px] before:content-[''] ${
        isCompleted
          ? "before:bg-ob-accent before:opacity-100"
          : "before:bg-(--track) before:opacity-85"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`inline-grid size-9 shrink-0 place-items-center rounded-(--r-10) border border-(--track-ring) bg-(--track-soft) text-(color:--track) [&_svg]:size-[17px] ${isCompleted ? "opacity-90" : ""}`}
        >
          {item.icon}
        </span>
        <div className="min-w-0">
          <div className="text-fg-muted font-mono text-[10px] tracking-[0.08em] uppercase">
            {item.trackLabel}
          </div>
          <h3 className="text-fg m-0 text-[15px] leading-snug font-medium tracking-[-0.005em]">
            {item.title}
          </h3>
        </div>
      </div>
      <p className="text-fg-muted m-0 line-clamp-2 flex-1 text-[12.5px] leading-[1.5]">
        {item.description}
      </p>
      <div className="border-line flex min-h-16 flex-col justify-center gap-[11px] border-t pt-[15px]">
        {/* Decorative — the same information is text in the caption below. */}
        <div aria-hidden="true">
          {isCompleted ? (
            <CollapsedStepper length={item.steps.length} />
          ) : (
            <FullStepper steps={item.steps} trackIcon={item.icon} currentIndex={currentIndex} />
          )}
        </div>
        <Caption item={item} dict={dict} />
      </div>
    </Link>
  )
}
