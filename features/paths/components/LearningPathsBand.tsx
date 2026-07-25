import type { ReactNode } from "react"
import Link from "next/link"
import type { TrackColorToken } from "@/features/playground/domain/manifest"

/**
 * v1 paths are always one doc step + one challenge step (specs/learning-paths-v1.md),
 * so the card only ever needs a two-dot spine — no need to generalize to N steps yet.
 */
export type PathBandItem = {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly track: TrackColorToken
  readonly trackLabel: string
  readonly icon: ReactNode
  /** null = signed out, progress unknown; the challenge step's completion otherwise. */
  readonly challengeCompleted: boolean | null
}

type LearningPathsBandProps = {
  readonly items: readonly PathBandItem[]
  readonly heading: string
  readonly sub: string
  readonly practicedLabel: (done: number, total: number) => string
  readonly guideAndChallengeLabel: string
}

const StepDot = ({ variant }: { readonly variant: "neutral" | "accent" | "track" }): ReactNode => {
  if (variant === "accent") return <span className="bg-ob-accent size-[5px] rounded-full" />
  if (variant === "track") return <span className="size-[5px] rounded-full bg-(--track)" />
  return <span className="border-line-2 size-[5px] rounded-full border" />
}

export const LearningPathsBand = ({
  items,
  heading,
  sub,
  practicedLabel,
  guideAndChallengeLabel,
}: LearningPathsBandProps): ReactNode => {
  if (items.length === 0) return null

  return (
    <div>
      <div className="text-fg-muted border-line mb-4 flex items-baseline justify-between gap-3 border-b pb-2.5">
        <span className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
          {heading}
        </span>
        <span className="hidden font-mono text-[11.5px] max-[640px]:hidden sm:inline">{sub}</span>
      </div>
      <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-track={item.track}
            className="group border-line bg-bg-card hover:bg-bg-hover relative flex flex-col gap-3.5 overflow-hidden rounded-(--r-12) border p-[18px] text-inherit no-underline transition-colors before:absolute before:inset-x-0 before:top-0 before:h-[2.5px] before:bg-(--track) before:opacity-85 before:content-['']"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-grid size-9 shrink-0 place-items-center rounded-(--r-10) border border-(--track-ring) bg-(--track-soft) text-(color:--track) [&_svg]:size-[17px]">
                {item.icon}
              </span>
              <div>
                <div className="text-fg-muted font-mono text-[10px] tracking-[0.08em] uppercase">
                  {item.trackLabel}
                </div>
                <h4 className="text-fg m-0 text-[15px] leading-snug font-medium tracking-[-0.005em]">
                  {item.title}
                </h4>
              </div>
            </div>
            <p className="text-fg-muted m-0 line-clamp-2 flex-1 text-[12.5px] leading-[1.5]">
              {item.description}
            </p>
            <div className="border-line flex items-center justify-between gap-2.5 border-t pt-3.5">
              <span className="flex items-center gap-1.5">
                <StepDot variant="neutral" />
                <StepDot
                  variant={
                    item.challengeCompleted === true
                      ? "accent"
                      : item.challengeCompleted === false
                        ? "track"
                        : "neutral"
                  }
                />
              </span>
              <span className="text-fg-muted font-mono text-[11px]">
                {item.challengeCompleted === null
                  ? guideAndChallengeLabel
                  : practicedLabel(item.challengeCompleted ? 1 : 0, 1)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
