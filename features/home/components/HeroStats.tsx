"use client"

import { IconBulb, IconFork, IconGlobe, IconStar } from "@/icons"
import type { HeroStatsLabels } from "@/lib/landing-dictionary"
import { Eyebrow } from "@/shared/Eyebrow"

type HeroStatsProps = {
  readonly labels: HeroStatsLabels
  readonly guideCount: number
}

const ICONS = {
  license: <IconStar />,
  compatibility: <IconGlobe />,
  guides: <IconBulb />,
  contributors: <IconFork />,
} as const

export function HeroStats({ labels, guideCount }: HeroStatsProps) {
  const items = (["license", "compatibility", "guides", "contributors"] as const).map((key) => ({
    key,
    icon: ICONS[key],
    ...labels[key],
    value: key === "guides" ? String(guideCount) : labels[key].value,
  }))

  return (
    <div className="max-wide:grid-cols-2 mt-12 grid grid-cols-4 gap-3">
      {items.map(({ key, icon, label, value, unit, subAccent, subText }) => (
        <div
          key={key}
          className="border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover max-narrow:items-center max-narrow:justify-between max-narrow:gap-2 max-narrow:px-4 max-narrow:pt-5 max-narrow:pb-4 max-narrow:text-center flex flex-col gap-4 rounded-(--r-12) border px-[22px] py-5 transition-colors"
        >
          <div className="text-ob-accent flex items-center gap-2 [&_svg]:size-[15px]">
            {icon}
            <Eyebrow as="span">{label}</Eyebrow>
          </div>
          <div className="max-narrow:items-center flex flex-col gap-1.5">
            <div className="max-narrow:text-base text-[27px] leading-[1.05] font-medium tracking-[-0.02em]">
              {value}
              {"unit" in labels[key] && unit && (
                <span className="text-fg-muted max-narrow:text-xs ml-px text-lg font-normal">
                  {unit}
                </span>
              )}
            </div>
            <div className="text-fg-muted max-narrow:hidden text-2xs font-mono">
              {subAccent && <span className="text-ob-accent">{subAccent}</span>}
              {subText}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
