"use client"

import { useEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

/**
 * A gloss band swept once across the tile — the genuine "reveal" accent,
 * absent from the source composition (added per the owner's ask). Only
 * plays for the real unlock moment; the hover replay on already-earned
 * tiles never shimmers, so this stays a rarer, more meaningful cue.
 */
export const BadgeShimmer = ({ playKey }: { readonly playKey: number }): ReactNode => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (el === null) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { xPercent: -160, opacity: 0 },
        { xPercent: 160, opacity: 1, duration: 1.1, ease: "power2.inOut", delay: 0.15 }
      )
    })
    return () => mm.revert()
  }, [playKey])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      <div
        ref={ref}
        className="absolute inset-y-0 w-1/3 opacity-0"
        style={{
          background:
            "linear-gradient(75deg, transparent, rgba(255,255,255,.16) 45%, rgba(255,255,255,.28) 50%, rgba(255,255,255,.16) 55%, transparent)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}
