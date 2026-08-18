import type { ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

/** `review-corps` — the pull request arm draws out, the node lands, the arrow snaps back to the base. */
export const PrIcon = ({ t }: { readonly t: number }): ReactNode => {
  const trunk = MOTION.draw(0, 0.4)(t)
  const arm = MOTION.draw(0.3, 0.55)(t)
  const node = MOTION.pop(0.8, 0.38)(t)
  const slide = MOTION.pop(0.95, 0.45)(t)
  const nudge = 0.35 * Math.max(0, Math.sin((t - 1.4) * 1.9)) * clamp((t - 1.4) / 0.6, 0, 1)
  const dx = 5 * (1 - slide) - nudge

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        fill="none"
        d="M4 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"
        style={{ opacity: MOTION.enter(0, 0.3)(t) }}
      />
      <path fill="none" d="M6 8l0 8" {...dash(trunk)} />
      <path fill="none" d="M11 6h5a2 2 0 0 1 2 2v8" {...dash(arm)} />
      <g
        style={{
          transform: `translate(18px,18px) scale(${node}) translate(-18px,-18px)`,
          opacity: node,
        }}
      >
        <path fill="none" d="M16 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </g>
      <g style={{ transform: `translateX(${dx}px)`, opacity: slide }}>
        <path fill="none" d="M14 9l-3 -3l3 -3" />
      </g>
    </g>
  )
}
