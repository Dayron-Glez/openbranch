import { useId, type ReactNode } from "react"
import { MOTION, clamp, dash } from "@/features/playground/domain/badge-motion"

const FLASK_BODY = "M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6"

const BUBBLES = [
  { x: 9.4, r: 0.62, s: 0.0 },
  { x: 12.2, r: 0.45, s: 0.55 },
  { x: 14.2, r: 0.55, s: 1.05 },
]

/** `coverage-hero` — the flask outline draws and fills with liquid as bubbles rise. */
export const FlaskIcon = ({ t }: { readonly t: number }): ReactNode => {
  // useId()'s colons aren't valid in a bare fragment id used via url(#id).
  const clipId = useId().replace(/:/g, "")
  const rim = MOTION.draw(0, 0.3)(t)
  const body = MOTION.draw(0.15, 0.6)(t)
  const neck = MOTION.draw(0.55, 0.3)(t)
  const fill = MOTION.enter(0.6, 0.95)(t)
  const wobble = 0.22 * Math.sin(t * 2.6)
  const level = 21 - 10.5 * fill + (fill > 0.9 ? wobble : 0)

  return (
    <g
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <clipPath id={clipId}>
        <path d={FLASK_BODY} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={3}
          y={level}
          width={18}
          height={14}
          fill="currentColor"
          opacity={0.3 * clamp(fill * 3, 0, 1)}
          stroke="none"
        />
        <rect
          x={3}
          y={level}
          width={18}
          height={0.55}
          fill="currentColor"
          opacity={0.85 * clamp(fill * 3, 0, 1)}
          stroke="none"
        />
        {BUBBLES.map((bubble, i) => {
          const q = ((t - 0.85 - bubble.s) / 1.7) % 1
          if (t < 0.85 + bubble.s || q < 0) return null
          return (
            <circle
              key={bubble.x}
              cx={bubble.x + Math.sin(q * 7 + i) * 0.35}
              cy={20.4 - q * (20.4 - level - 0.4)}
              r={bubble.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.9}
              opacity={0.8 * Math.sin(q * Math.PI)}
            />
          )
        })}
      </g>
      <path fill="none" d="M9 3l6 0" {...dash(rim)} />
      <path fill="none" d={FLASK_BODY} {...dash(body)} />
      <path fill="none" d="M10 9l4 0" {...dash(neck)} />
    </g>
  )
}
