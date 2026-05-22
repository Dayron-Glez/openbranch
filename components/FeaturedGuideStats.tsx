"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { MaturityBadge } from "@/components/MaturityBadge"
import { formatRelativeDate } from "@/lib/section-stats"
import type { Maturity } from "@/lib/maturity"

type FeaturedGuideStatsProps = {
  readonly maturity: Maturity
  readonly lastModified: Date | null
  readonly lang: string
  readonly updatedLabel: string
}

export function FeaturedGuideStats({
  maturity,
  lastModified,
  lang,
  updatedLabel,
}: FeaturedGuideStatsProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const items = el.querySelectorAll("[data-stat]")
    gsap.set(items, { opacity: 0, y: 8 })

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        gsap.to(items, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.45,
          ease: "power2.out",
        })
        observer.disconnect()
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  const relativeDate = formatRelativeDate(lastModified, lang)

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span data-stat="">
        <MaturityBadge maturity={maturity} size="xs" />
      </span>
      {lastModified && (
        <span data-stat="" className="text-fg-muted font-mono text-[11px]">
          {updatedLabel} {relativeDate}
        </span>
      )}
    </div>
  )
}
