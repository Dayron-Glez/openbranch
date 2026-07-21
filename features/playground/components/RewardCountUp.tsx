"use client"

import type React from "react"
import { useEffect, useState } from "react"

type RewardCountUpProps = {
  readonly from: number
  readonly to: number
  readonly durationMs?: number
  readonly className?: string
}

const DEFAULT_DURATION_MS = 900

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3

export const RewardCountUp = ({
  from,
  to,
  durationMs = DEFAULT_DURATION_MS,
  className,
}: RewardCountUpProps): React.ReactElement => {
  // Defaults to the final value so the very first paint (including any
  // pre-hydration SSR paint) is already correct — never a flash of 0.
  const [value, setValue] = useState<number>(to)

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    setValue(from)
    let frameId: number
    const startTime = performance.now()

    const tick = (now: number): void => {
      const progress = Math.min(1, (now - startTime) / durationMs)
      setValue(Math.round(from + (to - from) * easeOutCubic(progress)))
      if (progress < 1) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [from, to, durationMs])

  return <span className={className}>{value}</span>
}
