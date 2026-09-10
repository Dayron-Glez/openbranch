// Ported verbatim from the Claude Design composition's `animations-v3.jsx` —
// same formulas, not a library approximation, so the icon components stay a
// near-literal port of the source choreography. Keep them pure.

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

export type EaseFn = (t: number) => number

export const Easing = {
  easeOutCubic: (t: number): number => {
    const inv = t - 1
    return inv * inv * inv + 1
  },
  easeInOutQuart: (t: number): number => (t < 0.5 ? 8 * t ** 4 : 1 - 8 * (t - 1) ** 4),
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    const inv = t - 1
    return 1 + c3 * inv ** 3 + c1 * inv ** 2
  },
} as const satisfies Record<string, EaseFn>

/** `t` is seconds since the icon's animation started; clamped outside the window. */
export const animate = ({
  from = 0,
  to = 1,
  start,
  end,
  ease,
}: {
  readonly from?: number
  readonly to?: number
  readonly start: number
  readonly end: number
  readonly ease: EaseFn
}): ((t: number) => number) => {
  return (t: number): number => {
    if (t <= start) return from
    if (t >= end) return to
    return from + (to - from) * ease((t - start) / (end - start))
  }
}

export const MOTION = {
  enter: (start: number, dur: number) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutCubic }),
  draw: (start: number, dur: number) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeInOutQuart }),
  pop: (start: number, dur: number) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutBack }),
} as const

export const dash = (
  progress: number
): { pathLength: number; strokeDasharray: number; strokeDashoffset: number } => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
})
