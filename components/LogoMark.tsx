type LogoMarkProps = {
  size?: number
  animate?: boolean
  className?: string
}

export function LogoMark({ size = 64, animate = false, className }: Readonly<LogoMarkProps>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={animate ? "-12 -12 88 88" : "0 0 64 64"}
      className={`${animate ? "logo-play" : ""} ${className ?? ""}`.trim()}
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
          d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50"
        />
        <circle className="n-top" cx="18" cy="10" r="4.5" fill="currentColor" stroke="none" />
        <circle className="n-bot" cx="18" cy="54" r="4.5" fill="currentColor" stroke="none" />
        <circle
          className="n-accent"
          cx="40"
          cy="50"
          r="4.5"
          fill="var(--ob-accent)"
          stroke="none"
        />
      </g>
    </svg>
  )
}
