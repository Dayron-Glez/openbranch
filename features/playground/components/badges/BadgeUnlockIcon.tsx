"use client"

import { useEffect, useState, type ReactNode } from "react"
import gsap from "gsap"
import type { BadgeKey } from "@/features/playground/domain/manifest"
import { BADGE_UNLOCK_ICON, BADGE_UNLOCK_DURATION } from "./icon-registry"

/**
 * Plays once per `playKey` change. `t` is tweened over a plain object rather
 * than DOM refs, because the icon components take `t` as a prop and re-render
 * every tick.
 *
 * `prefers-reduced-motion` jumps straight to the settled end frame, matching
 * `PlaygroundTransition.tsx`'s `gsap.matchMedia()` guard.
 */
export const BadgeUnlockIcon = ({
  badgeKey,
  playKey,
}: {
  readonly badgeKey: BadgeKey
  readonly playKey: number
}): ReactNode => {
  const duration = BADGE_UNLOCK_DURATION[badgeKey]
  const [t, setT] = useState(duration)

  useEffect(() => {
    const state = { t: 0 }
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      setT(0)
      const tween = gsap.to(state, {
        t: duration,
        duration,
        ease: "none",
        onUpdate: () => setT(state.t),
      })
      return () => tween.kill()
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
      setT(duration)
    })

    return () => mm.revert()
  }, [playKey, badgeKey, duration])

  const Icon = BADGE_UNLOCK_ICON[badgeKey]
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <Icon t={t} />
    </svg>
  )
}
