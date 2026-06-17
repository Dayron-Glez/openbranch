"use client"

import type React from "react"
import { useState, useRef, useTransition, useCallback } from "react"
import { saveChecklistState, completeChallenge } from "@/app/actions/playground"

type ChecklistItem = {
  readonly id: string
  readonly text: string
}

type ChallengeChecklistDict = {
  readonly checklistHeading: string
  readonly progress: string
  readonly submitButton: string
  readonly submitHint: string
}

type ChallengeChecklistProps = {
  readonly items: readonly ChecklistItem[]
  readonly initialChecked: readonly string[]
  readonly slug: string
  readonly lang: string
  readonly dict: ChallengeChecklistDict
}

const CheckMark = (): React.ReactElement => (
  <svg
    viewBox="0 0 12 12"
    className="text-accent-ink size-[9px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 6l3 3 5-5" />
  </svg>
)

export const ChallengeChecklist = ({
  items,
  initialChecked,
  slug,
  lang,
  dict,
}: ChallengeChecklistProps): React.ReactElement => {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(initialChecked))
  const checkedRef = useRef<Set<string>>(checked)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPending, startTransition] = useTransition()

  const allChecked = checked.size === items.length

  const handleToggle = useCallback(
    (id: string): void => {
      const next = new Set(checkedRef.current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      checkedRef.current = next
      setChecked(new Set(next))

      if (debounceRef.current !== null) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void saveChecklistState(slug, lang, Array.from(next))
      }, 800)
    },
    [slug, lang]
  )

  const handleSubmit = (): void => {
    startTransition(async () => {
      await completeChallenge(slug, lang)
    })
  }

  const progressText = dict.progress
    .replace("{checked}", String(checked.size))
    .replace("{total}", String(items.length))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
          {dict.checklistHeading}
        </p>
        <span className="text-fg-muted shrink-0 font-mono text-[11px]">{progressText}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isChecked = checked.has(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`flex items-start gap-3 rounded-[var(--r-8)] border p-3 text-left transition-colors duration-(--d-fast) ease-(--ease) ${
                isChecked
                  ? "border-ob-accent/25 bg-ob-accent/[0.06]"
                  : "border-line-2 bg-bg-elev hover:border-line hover:bg-bg-card"
              }`}
            >
              <span
                className={`mt-0.5 flex size-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-(--d-fast) ${
                  isChecked ? "border-ob-accent bg-ob-accent" : "border-fg-faint bg-transparent"
                }`}
                aria-hidden="true"
              >
                {isChecked && <CheckMark />}
              </span>
              <span className="text-fg-2 text-[13px] leading-[1.55]">{item.text}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allChecked || isPending}
          className={`h-[42px] w-full rounded-[var(--r-8)] font-mono text-[13px] font-medium transition-all duration-(--d-fast) disabled:opacity-60 ${
            allChecked
              ? "bg-ob-accent text-accent-ink hover:brightness-105"
              : "border-line bg-bg-elev text-fg-faint cursor-not-allowed border"
          }`}
        >
          {isPending ? "···" : dict.submitButton}
        </button>
        {!allChecked && (
          <p className="text-fg-muted text-center font-mono text-[11px]">{dict.submitHint}</p>
        )}
      </div>
    </div>
  )
}
