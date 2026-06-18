"use client"

import type React from "react"
import { useState } from "react"

type HintPanelProps = {
  readonly hints: readonly string[]
  readonly revealLabel: string
  readonly hintsLabel: string
}

export const HintPanel = ({
  hints,
  revealLabel,
  hintsLabel,
}: HintPanelProps): React.ReactElement => {
  const [revealed, setRevealed] = useState<number>(0)

  const handleReveal = (): void => {
    setRevealed((prev) => Math.min(prev + 1, hints.length))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
          {hintsLabel}
        </p>
        <span className="text-fg-faint font-mono text-[10.5px]">
          {revealed}/{hints.length}
        </span>
      </div>

      {revealed > 0 && (
        <div className="flex flex-col gap-2">
          {hints.slice(0, revealed).map((hint, i) => (
            <div key={i} className="border-line bg-bg-elev rounded-[var(--r-8)] border px-3 py-2.5">
              <p className="text-fg-2 font-mono text-[12px] leading-[1.6]">
                <span className="text-fg-faint mr-2">{i + 1}.</span>
                {hint}
              </p>
            </div>
          ))}
        </div>
      )}

      {revealed < hints.length && (
        <button
          type="button"
          onClick={handleReveal}
          className="border-line hover:border-line-2 text-fg-muted hover:text-fg-2 flex items-center justify-center gap-1.5 rounded-[var(--r-8)] border border-dashed py-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-3 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3M8 10.5v.5" />
          </svg>
          {revealLabel}
        </button>
      )}
    </div>
  )
}
