import type { ReactNode } from "react"
import { MOTION, dash } from "@/features/playground/domain/badge-motion"

const BOOK_TOP = "M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"

/** `doc-writer` — the book spine and pages draw open, a bright dash writes across the top page. */
export const BookIcon = ({ t }: { readonly t: number }): ReactNode => {
  const spine = MOTION.enter(0, 0.35)(t)
  const wings = MOTION.enter(0.2, 0.4)(t)
  const arcs = MOTION.draw(0.28, 0.6)(t)
  const w = ((t - 0.95) / 2.2) % 1
  const writing = t > 0.95 && w >= 0

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path fill="none" d="M12 6l0 13" style={{ opacity: spine }} />
      <path fill="none" d="M3 6l0 13" style={{ opacity: wings }} />
      <path fill="none" d="M21 6l0 13" style={{ opacity: wings }} />
      <path fill="none" d={BOOK_TOP} {...dash(arcs)} />
      <path
        fill="none"
        d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"
        {...dash(MOTION.draw(0.42, 0.6)(t))}
      />
      {writing && (
        <path
          d={BOOK_TOP}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          pathLength={1}
          strokeDasharray="0.14 1"
          strokeDashoffset={0.14 - 1.14 * w}
          opacity={0.9 * Math.sin(Math.min(1, w * 1.6) * Math.PI * 0.9)}
          style={{ filter: "drop-shadow(0 0 3px currentColor)" }}
        />
      )}
    </g>
  )
}
