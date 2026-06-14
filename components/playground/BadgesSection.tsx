import { IconGitMerge, IconPR, IconFlask, IconRocket, IconFlame, IconAward } from "@/icons"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

type BadgesSectionProps = {
  readonly dict: PlaygroundDict["badges"]
}

const BADGE_KEYS = [
  "first-merge",
  "review-corps",
  "coverage-hero",
  "ship-it",
  "streak-7",
  "all-tracks",
] as const

type BadgeKey = (typeof BADGE_KEYS)[number]

const BADGE_ICONS: Record<BadgeKey, React.ReactNode> = {
  "first-merge": <IconGitMerge />,
  "review-corps": <IconPR />,
  "coverage-hero": <IconFlask />,
  "ship-it": <IconRocket />,
  "streak-7": <IconFlame />,
  "all-tracks": <IconAward />,
}

export const BadgesSection = ({ dict }: BadgesSectionProps) => {
  return (
    <div>
      <div className="text-fg-muted border-line mb-4 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
        {dict.heading}
      </div>
      <div className="mb-3 grid grid-cols-6 gap-3 max-[980px]:grid-cols-3 max-[520px]:grid-cols-2">
        {BADGE_KEYS.map((key) => (
          <div
            key={key}
            className="border-line bg-bg-card text-fg-muted flex flex-col items-center gap-2.5 rounded-[var(--r-10)] border p-4 text-center opacity-60"
          >
            <span className="border-line bg-bg-elev text-fg-faint inline-grid size-9 place-items-center rounded-[var(--r-10)] border [&_svg]:size-[17px]">
              {BADGE_ICONS[key]}
            </span>
            <span className="font-mono text-[11px]">{dict[key].name}</span>
          </div>
        ))}
      </div>
      <p className="text-fg-muted m-0 font-mono text-[12px]">{dict.lockMessage}</p>
    </div>
  )
}
