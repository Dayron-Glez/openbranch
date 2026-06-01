"use client"

import { useState, useEffect } from "react"
import { IconBulb, IconFork, IconStar, IconGlobe } from "@/icons"
import type { HeroStatsLabels } from "@/lib/landing-dictionary"
import { fetchGitHubStars, fetchGitHubContributors } from "@/lib/github-stars"
import { GH_REPO } from "@/lib/constants"

type HeroStatsProps = {
  readonly labels: HeroStatsLabels
  readonly guideCount: number
  readonly localeCount: number
}

export function HeroStats({ labels, guideCount, localeCount }: HeroStatsProps) {
  const [stars, setStars] = useState<string | null>(null)
  const [contributors, setContributors] = useState<string | null>(null)

  useEffect(() => {
    fetchGitHubStars(GH_REPO)
      .then(setStars)
      .catch(() => null)
    fetchGitHubContributors(GH_REPO)
      .then(setContributors)
      .catch(() => null)
  }, [])

  const items = [
    { icon: <IconBulb />, value: String(guideCount), unit: "+", label: labels.guides },
    { icon: <IconFork />, value: contributors, unit: null, label: labels.contributors },
    { icon: <IconStar />, value: stars, unit: null, label: labels.stars },
    { icon: <IconGlobe />, value: String(localeCount), unit: null, label: labels.locales },
  ] as const

  return (
    <div className="mt-12 grid grid-cols-4 gap-3 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
      {items.map(({ icon, value, unit, label }) => (
        <div
          key={label}
          className="border-line bg-bg-card flex flex-col gap-4 rounded-(--r-12) border px-6 py-5"
        >
          <span className="text-ob-accent [&_svg]:size-[18px]">{icon}</span>
          <div>
            <div className="text-[28px] leading-none font-medium tracking-normal">
              {value ?? <span className="text-fg-muted text-[22px]">—</span>}
              {unit && value && (
                <span className="text-fg-muted ml-0.5 text-base font-normal">{unit}</span>
              )}
            </div>
            <div className="text-fg-muted mt-2 font-mono text-[11px] tracking-[0.06em] uppercase">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
