"use client"

import { useState } from "react"
import Link from "next/link"
import {
  MATURITY_CLASSES,
  MATURITY_LABEL,
  MATURITY_SIZE_CLASSES,
  MATURITY_VALUES,
} from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"

export type FilterPage = {
  title: string
  url: string
  description?: string
  maturity: Maturity
}

type MaturityFilterProps = {
  pages: FilterPage[]
}

export function MaturityFilter({ pages }: MaturityFilterProps) {
  const [active, setActive] = useState<Set<Maturity>>(() => new Set(MATURITY_VALUES))

  const toggle = (m: Maturity) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  const counts = Object.fromEntries(
    MATURITY_VALUES.map((m) => [m, pages.filter((p) => p.maturity === m).length])
  ) as Record<Maturity, number>

  const visible = pages.filter((p) => active.has(p.maturity))

  // Only render chips for states that have at least one page.
  const nonEmptyStates = MATURITY_VALUES.filter((m) => counts[m] > 0)

  return (
    <div className="not-prose mb-8 flex flex-col gap-6">
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">Filter by maturity</legend>
        {nonEmptyStates.map((m) => (
          <button
            key={m}
            aria-pressed={active.has(m)}
            aria-label={`Maturity: ${MATURITY_LABEL[m]}, ${counts[m]} guide${counts[m] === 1 ? "" : "s"}`}
            onClick={() => toggle(m)}
            className={[
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] transition-opacity",
              MATURITY_CLASSES[m],
              MATURITY_SIZE_CLASSES.lg,
              active.has(m) ? "" : "opacity-40",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
            {counts[m]} {MATURITY_LABEL[m]}
          </button>
        ))}
      </fieldset>

      {visible.length === 0 ? (
        <p className="text-fg-muted font-mono text-sm">No guides match the selected filters.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((page) => (
            <li key={page.url}>
              <Link
                href={page.url}
                className="border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover flex flex-col gap-1 rounded-[var(--r-10)] border px-5 py-4 no-underline transition-[background,border-color] duration-[var(--d-base)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-fg font-medium">{page.title}</span>
                  <BadgeInline maturity={page.maturity} />
                </div>
                {page.description && (
                  <p className="text-fg-muted m-0 text-sm leading-relaxed">{page.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Duplicates MaturityBadge markup to avoid importing a server component into a client module.
function BadgeInline({ maturity }: { maturity: Maturity }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES.xs,
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </span>
  )
}
