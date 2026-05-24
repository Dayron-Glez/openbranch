"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { MaturityBadge } from "@/components/docs/MaturityBadge"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatRelativeDate } from "@/lib/section-stats"
import type { Maturity } from "@/lib/maturity"

type FeaturedGuideStatsProps = {
  readonly maturity: Maturity
  readonly lastModified: Date | null
  readonly lang: string
  readonly updatedLabel: string
  readonly authors: string[]
  readonly authorsDisplay: string
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts.at(-1)![0]).toUpperCase()
}

export function FeaturedGuideStats({
  maturity,
  lastModified,
  lang,
  updatedLabel,
  authors,
  authorsDisplay,
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
          stagger: 0.12,
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
    <div ref={ref} className="flex items-center gap-2">
      {authors.length > 0 && (
        <span data-stat="" className="inline-flex items-center gap-2">
          <span className="inline-flex items-center">
            {authors.slice(0, 3).map((author, i) => (
              <Avatar
                key={author}
                className={`border-line bg-accent-soft outline-bg-card ${i === 0 ? "ml-0" : "-ml-2"} size-5.5 border outline-2`}
              >
                <AvatarFallback className="text-ob-accent bg-transparent font-mono text-[9px] font-medium">
                  {getInitials(author)}
                </AvatarFallback>
              </Avatar>
            ))}
          </span>
          <span className="text-fg-2 text-[12px] leading-none">{authorsDisplay}</span>
        </span>
      )}

      {authors.length > 0 && (
        <span
          data-stat=""
          className="text-fg-faint inline-flex items-center text-[10px]"
          aria-hidden
        >
          Â·
        </span>
      )}

      <span data-stat="" className="inline-flex items-center">
        <MaturityBadge maturity={maturity} />
      </span>

      {lastModified && (
        <Badge
          data-stat=""
          variant="outline"
          className="border-line text-fg-muted gap-1.5 font-mono tracking-[0.02em] whitespace-nowrap"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
          {updatedLabel} {relativeDate}
        </Badge>
      )}
    </div>
  )
}
