import { Fragment, type ReactElement } from "react"
import type { AuthDictionary } from "@/lib/dictionaries/auth"
import { AuthTerminal } from "./AuthTerminal"

/**
 * The counts are computed from content at build time and passed in, never typed
 * here: a panel whose whole claim is "this is what exists today" cannot carry a
 * number that goes stale the next time someone adds a guide.
 */
export type StoryCounts = {
  readonly challenges: number
  readonly tracks: number
  readonly guides: number
}

type StoryPanelProps = {
  readonly dict: AuthDictionary
  readonly counts: StoryCounts
  readonly challengeMinutes: number | null
}

export const StoryPanel = ({ dict, counts, challengeMinutes }: StoryPanelProps): ReactElement => {
  const stats: readonly { readonly value: number; readonly label: string }[] = [
    { value: counts.challenges, label: dict.statChallenges },
    { value: counts.tracks, label: dict.statTracks },
    { value: counts.guides, label: dict.statGuides },
  ].filter((stat) => stat.value > 0)

  return (
    <aside className="bg-bg-elev border-line flex w-full flex-col justify-center gap-[30px] overflow-hidden rounded-(--r-16) border p-12 max-[1100px]:p-8">
      <div className="flex flex-col gap-3">
        <span className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
          {dict.storyEyebrow}
        </span>
        <h2 className="text-fg max-w-[520px] text-[30px] leading-[1.2] font-light tracking-[-0.015em] text-pretty max-[1100px]:text-[25px]">
          {dict.storyTitle} <span className="text-fg-2">{dict.storyTitleAccent}</span>
        </h2>
        <p className="text-fg-2 max-w-[500px] text-[14.5px] leading-[1.6] text-pretty">
          {dict.storyLead}
        </p>
      </div>

      <AuthTerminal minutes={challengeMinutes} />

      {stats.length > 0 && (
        <div className="flex items-center gap-7 pt-1">
          {stats.map((stat, index) => (
            <Fragment key={stat.label}>
              {index > 0 && <span aria-hidden className="bg-line h-3.5 w-px" />}
              <span className="flex items-baseline gap-2">
                <span className="text-fg text-[20px]">{stat.value}</span>
                <span className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
                  {stat.label}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </aside>
  )
}
