import type { ReactNode } from "react"
import Link from "next/link"
import type { TrackColorToken } from "@/features/playground/domain/manifest"

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
}

export type PathCardDict = {
  /** e.g. "2 guides · 3 challenges" — shown when progress is unknown. */
  readonly shape: (guides: number, challenges: number) => string
  readonly stepsDone: (done: number, total: number) => string
}

/**
 * `auto-fill` rather than `auto-fit`: with a single path the card keeps its
 * width instead of stretching across the whole row, and the same class still
 * lays out three or more without breakpoints.
 */
export const PATH_CARD_GRID =
  "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]"

/**
 * One dot per step, so the spine reflects the real shape of the path. The v1
 * card hardcoded two dots because every path was a guide plus a challenge.
 */
const StepDot = ({ step }: { readonly step: PathCardStep }): ReactNode => {
  if (step.done === true) return <span className="bg-ob-accent size-[5px] rounded-full" />
  if (step.type === "challenge") return <span className="size-[5px] rounded-full bg-(--track)" />
  return <span className="border-line-2 size-[5px] rounded-full border" />
}

const caption = (item: PathCardItem, dict: PathCardDict): string => {
  if (item.progress === null) {
    const challenges = item.steps.filter((step) => step.type === "challenge").length
    return dict.shape(item.steps.length - challenges, challenges)
  }
  return dict.stepsDone(item.progress.done, item.progress.total)
}

export const PathCard = ({
  item,
  dict,
}: {
  readonly item: PathCardItem
  readonly dict: PathCardDict
}): ReactNode => (
  <Link
    href={item.href}
    data-track={item.track}
    className="group border-line bg-bg-card hover:bg-bg-hover relative flex flex-col gap-3.5 overflow-hidden rounded-(--r-12) border p-[18px] text-inherit no-underline transition-colors before:absolute before:inset-x-0 before:top-0 before:h-[2.5px] before:bg-(--track) before:opacity-85 before:content-['']"
  >
    <div className="flex items-center gap-2.5">
      <span className="inline-grid size-9 shrink-0 place-items-center rounded-(--r-10) border border-(--track-ring) bg-(--track-soft) text-(color:--track) [&_svg]:size-[17px]">
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
    <div className="border-line flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2 border-t pt-3.5">
      <span className="flex flex-wrap items-center gap-1.5">
        {item.steps.map((step, index) => (
          <StepDot key={`${step.type}-${index}`} step={step} />
        ))}
      </span>
      <span className="text-fg-muted font-mono text-[11px]">{caption(item, dict)}</span>
    </div>
  </Link>
)
