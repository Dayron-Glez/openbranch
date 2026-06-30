"use client"

import { IconBulb, IconFork, IconGlobe, IconStar } from "@/icons"
import type { HeroStatsLabels } from "@/lib/landing-dictionary"

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
    <div className="mt-12 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2">
      {items.map(({ key, icon, label, value, unit, subAccent, subText }) => (
        <div
          key={key}
          className="border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover flex flex-col gap-4 rounded-(--r-12) border px-[22px] py-5 transition-colors max-[520px]:items-center max-[520px]:justify-between max-[520px]:gap-2 max-[520px]:px-4 max-[520px]:pt-5 max-[520px]:pb-4 max-[520px]:text-center"
        >
          <div className="text-ob-accent flex items-center gap-2 [&_svg]:size-[15px]">
            {icon}
            <span className="text-fg-muted font-mono text-[10.5px] tracking-[0.07em] uppercase">
              {label}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 max-[520px]:items-center">
            <div className="text-[27px] leading-[1.05] font-medium tracking-[-0.02em] max-[520px]:text-base">
              {value}
              {"unit" in labels[key] && unit && (
                <span className="text-fg-muted ml-px text-lg font-normal max-[520px]:text-xs">
                  {unit}
                </span>
              )}
            </div>
            <div className="text-fg-muted font-mono text-[11px] max-[520px]:hidden">
              {subAccent && <span className="text-ob-accent">{subAccent}</span>}
              {subText}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
