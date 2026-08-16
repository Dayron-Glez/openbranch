import type { ReactElement } from "react"

type LogoMarkProps = {
  readonly size?: number
  readonly animate?: boolean
  /**
   * The 404 anchor. The branch stops short of merging back — dashed,
   * fading — and its accent endpoint breaks free and drifts. Same geometry
   * as the shipped mark, not a second drawing: a single path shortened and
   * one node detached, so both variants stay drawn from one source instead
   * of drifting apart if the logo ever changes. Disabled under
   * `prefers-reduced-motion` (app/animations.css).
   */
  readonly broken?: boolean
  readonly className?: string
}

const BRANCH_PATH =
  "M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50"
const BROKEN_BRANCH_PATH = "M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 41"

export const LogoMark = ({
  size = 64,
  animate = false,
  broken = false,
  className,
}: LogoMarkProps): ReactElement => (
  <svg
    width={size}
    height={size}
    viewBox={animate ? "-12 -12 88 88" : "0 0 64 64"}
    className={`${animate ? "logo-play" : ""} ${broken ? "logo-broken" : ""} ${className ?? ""}`.trim()}
    style={{ color: "var(--fg)" }}
    aria-hidden="true"
  >
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {animate ? (
        <>
          <circle
            className="n-halo"
            cx="40"
            cy="50"
            r="4.5"
            fill="none"
            stroke="var(--ob-accent)"
            strokeWidth="1.2"
          />
          <circle
            className="n-shock"
            cx="40"
            cy="50"
            r="4.5"
            fill="none"
            stroke="var(--ob-accent)"
            strokeWidth="1.5"
          />
        </>
      ) : null}
      <line className="p-trunk" x1="18" y1="10" x2="18" y2="54" pathLength="100" />
      <path
        className="p-branch"
        pathLength="100"
        d={broken ? BROKEN_BRANCH_PATH : BRANCH_PATH}
        stroke={broken ? "var(--fg-faint)" : undefined}
        strokeDasharray={broken ? "2 8" : undefined}
      />
      <circle className="n-top" cx="18" cy="10" r="4.5" fill="currentColor" stroke="none" />
      <circle className="n-bot" cx="18" cy="54" r="4.5" fill="currentColor" stroke="none" />
      {broken ? (
        <circle className="n-loose" cx="52" cy="51" r="4.5" fill="var(--ob-accent)" stroke="none" />
      ) : (
        <circle
          className="n-accent"
          cx="40"
          cy="50"
          r="4.5"
          fill="var(--ob-accent)"
          stroke="none"
        />
      )}
    </g>
  </svg>
)
