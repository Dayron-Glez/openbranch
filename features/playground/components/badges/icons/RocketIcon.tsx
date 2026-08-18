import type { ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

/** `ship-it` — the rocket dips for anticipation, then lifts off trailing exhaust. */
export const RocketIcon = ({ t }: { readonly t: number }): ReactNode => {
  const draw = MOTION.draw(0, 0.6)(t)
  const dip = MOTION.enter(0.55, 0.22)(t)
  const go = MOTION.pop(0.8, 0.55)(t)
  const bob = clamp((t - 1.35) / 0.5, 0, 1) * 0.5 * Math.sin((t - 1.35) * 2.1)
  const dx = -0.9 * dip + 3.1 * go
  const dy = 0.9 * dip - 3.1 * go + bob
  const flame = clamp((t - 0.8) / 0.25, 0, 1)

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: `translate(${dx}px,${dy}px)` }}
    >
      {[0, 1, 2].map((i) => {
        const q = ((t - 0.85) / 0.55 + i * 0.33) % 1
        if (t < 0.85) return null
        return (
          <path
            key={i}
            fill="none"
            d={`M${5.4 - q * 3.6} ${15.6 + q * 3.6}l-1.2 1.2`}
            strokeWidth={1.5 - q}
            opacity={flame * (1 - q) * 0.9}
          />
        )
      })}
      <path
        fill="none"
        d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"
        {...dash(draw)}
      />
      <path
        fill="none"
        d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"
        {...dash(MOTION.draw(0.35, 0.4)(t))}
      />
      <path
        fill="none"
        d="M14 9a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"
        style={{ opacity: MOTION.enter(0.6, 0.3)(t) }}
      />
    </g>
  )
}
