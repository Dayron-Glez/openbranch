import type { ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

/**
 * The five track hues converging — literal tokens, not `currentColor`: this
 * badge's whole point is "every track," so the particles have to carry each
 * track's own color, not the badge's single accent.
 */
const TRACK_HUES = [
  "var(--color-track-git)",
  "var(--color-track-review)",
  "var(--color-track-test)",
  "var(--color-track-bugfix)",
  "var(--color-track-docs)",
]

/** `all-tracks` — the five track hues converge into the medal, which pops with a shockwave. */
export const AwardIcon = ({ t }: { readonly t: number }): ReactNode => {
  const circle = MOTION.draw(0.72, 0.45)(t)
  const rib1 = MOTION.draw(1.05, 0.4)(t)
  const rib2 = MOTION.draw(1.15, 0.4)(t)
  const pop = MOTION.pop(0.8, 0.5)(t)
  const halo = clamp((t - 1.5) / 0.6, 0, 1)

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {TRACK_HUES.map((hue, i) => {
        const s = MOTION.enter(i * 0.1, 0.75)(t)
        if (s <= 0 || s >= 1) return null
        const angle = ((-140 + i * 62) * Math.PI) / 180
        const r = 15 * (1 - s)
        return (
          <circle
            key={hue}
            cx={12 + Math.cos(angle) * r}
            cy={9 + Math.sin(angle) * r}
            r={1.1 - 0.4 * s}
            fill={hue}
            stroke="none"
            opacity={Math.sin(s * Math.PI) * 1.1}
          />
        )
      })}
      {halo > 0 && (
        <circle
          cx={12}
          cy={9}
          r={6 + halo * (1.4 + Math.sin(t * 2.2) * 0.9)}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.8}
          opacity={halo * (0.24 + 0.12 * Math.sin(t * 2.2 + 1))}
        />
      )}
      <g
        style={{
          transform: `translate(12px,11px) scale(${0.75 + 0.25 * pop}) translate(-12px,-11px)`,
        }}
      >
        <path fill="none" d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" {...dash(circle)} />
        <path fill="none" d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889" {...dash(rib1)} />
        <path
          fill="none"
          d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"
          {...dash(rib2)}
        />
      </g>
    </g>
  )
}
