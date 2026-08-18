import type { ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

/** `first-merge` — two commit nodes pop in, the trunk draws down, the branch curves into the merge node. */
export const MergeIcon = ({ t }: { readonly t: number }): ReactNode => {
  const top = MOTION.pop(0, 0.34)(t)
  const bottom = MOTION.pop(0.12, 0.34)(t)
  const trunk = MOTION.draw(0.24, 0.42)(t)
  const branch = MOTION.draw(0.5, 0.5)(t)
  const node = MOTION.pop(0.95, 0.4)(t)
  const breathe = 1 + 0.06 * Math.sin((t - 1.35) * 2.4) * clamp((t - 1.35) / 0.6, 0, 1)

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g
        style={{ transform: `translate(7px,6px) scale(${top}) translate(-7px,-6px)`, opacity: top }}
      >
        <path fill="none" d="M5 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </g>
      <g
        style={{
          transform: `translate(7px,18px) scale(${bottom}) translate(-7px,-18px)`,
          opacity: bottom,
        }}
      >
        <path fill="none" d="M5 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </g>
      <path fill="none" d="M7 8l0 8" {...dash(trunk)} />
      <path fill="none" d="M7 8a4 4 0 0 0 4 4h4" {...dash(branch)} />
      <g
        style={{
          transform: `translate(17px,12px) scale(${node * breathe}) translate(-17px,-12px)`,
          opacity: node,
        }}
      >
        <path fill="none" d="M15 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </g>
    </g>
  )
}
