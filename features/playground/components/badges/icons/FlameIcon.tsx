import type { ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

const FLAME_D =
  "M12 10.941c2.333 -3.308 .167 -7.823 -1 -8.941c0 3.395 -2.235 5.299 -3.667 6.706c-1.43 1.408 -2.333 3.294 -2.333 5.588c0 3.704 3.134 6.706 7 6.706c3.866 0 7 -3.002 7 -6.706c0 -1.712 -1.232 -4.403 -2.333 -5.588c-2.084 3.353 -3.257 3.353 -4.667 2.235"

/** `streak-7` — seven sparks fly into the flame, which ignites and flickers. */
export const FlameIcon = ({ t }: { readonly t: number }): ReactNode => {
  const draw = MOTION.draw(0, 0.65)(t)
  const live = clamp((t - 0.6) / 0.4, 0, 1)
  const sy = 1 + live * 0.05 * Math.sin(t * 8.2) + live * 0.03 * Math.sin(t * 13.7)
  const sx = 1 - live * 0.035 * Math.sin(t * 8.2 + 0.6)

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const s = MOTION.enter(0.05 + i * 0.11, 0.55)(t)
        if (s <= 0) return null
        const angle = ((-90 + (i - 3) * 26) * Math.PI) / 180
        const r = 13 * (1 - s)
        return (
          <circle
            key={i}
            cx={12 + Math.cos(angle) * r}
            cy={14 + Math.sin(angle) * r}
            r={0.85 * (1 - s * 0.55)}
            fill="currentColor"
            stroke="none"
            opacity={s < 1 ? 0.9 * s : Math.max(0, 1 - (s - 1) * 6)}
          />
        )
      })}
      <g
        style={{
          transform: `translate(12px,20px) scale(${sx},${sy}) translate(-12px,-20px)`,
          filter:
            live > 0
              ? `drop-shadow(0 0 ${2 + live * 2 + Math.sin(t * 5) * 0.8}px currentColor)`
              : "none",
        }}
      >
        <path fill="none" d={FLAME_D} {...dash(draw)} />
      </g>
    </g>
  )
}
