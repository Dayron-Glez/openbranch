"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { setGuideRead } from "@/app/actions/docs"
import { IconCheck, IconBook } from "@/icons"

/**
 * Read state is per-user, but the docs pages are statically rendered and their
 * whole layout chain is free of dynamic APIs. Resolving this during their
 * render would turn every guide into a per-request render — the regression
 * #152 introduced and had to revert.
 *
 * So the set is fetched from /api/doc-reads. It lives in the docs layout, which
 * survives client-side navigation between guides, so it is fetched once per
 * docs session instead of once per guide. Writes still go through a server
 * action, like every other mutation in this codebase.
 */

type DocReadsValue = {
  /** `null` until the fetch resolves — the UI renders nothing before then. */
  readonly readSlugs: ReadonlySet<string> | null
  readonly signedIn: boolean
  readonly setRead: (docSlug: string, lang: string, read: boolean) => void
}

const DocReadsContext = createContext<DocReadsValue | null>(null)

export const DocReadsProvider = ({ children }: { readonly children: ReactNode }): ReactNode => {
  const [readSlugs, setReadSlugs] = useState<ReadonlySet<string> | null>(null)
  const [signedIn, setSignedIn] = useState<boolean>(false)

  /** Latest desired value per slug, and the in-flight chain that will send it. */
  const desiredRef = useRef<Map<string, boolean>>(new Map())
  const chainRef = useRef<Map<string, Promise<void>>>(new Map())

  useEffect(() => {
    let active = true
    const load = async (): Promise<void> => {
      try {
        const response = await fetch("/api/doc-reads")
        if (!response.ok) return
        const body = (await response.json()) as {
          signedIn: boolean
          readSlugs: readonly string[]
        }
        if (!active) return
        setSignedIn(body.signedIn)
        setReadSlugs(new Set(body.readSlugs))
      } catch {
        // Degrade to "not read" rather than breaking the guide.
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  /**
   * Optimistic locally, serialised on the wire. Auto-marking fires an insert
   * and an un-mark a moment later must not be able to land before it — that
   * would leave a surviving row with the UI showing unread. Chaining per slug
   * and always sending the latest intent makes that ordering unrepresentable.
   */
  const setRead = useCallback((docSlug: string, lang: string, read: boolean): void => {
    setReadSlugs((current) => {
      const next = new Set(current ?? [])
      if (read) next.add(docSlug)
      else next.delete(docSlug)
      return next
    })

    desiredRef.current.set(docSlug, read)
    const prior = chainRef.current.get(docSlug) ?? Promise.resolve()
    const next = prior.then(async () => {
      const desired = desiredRef.current.get(docSlug)
      if (desired === undefined) return
      desiredRef.current.delete(docSlug)
      await setGuideRead(docSlug, lang, desired)
    })
    chainRef.current.set(docSlug, next)
  }, [])

  // Memoised: a fresh object here re-renders every guide's control on any
  // render of the docs layout.
  const value = useMemo<DocReadsValue>(
    () => ({ readSlugs, signedIn, setRead }),
    [readSlugs, signedIn, setRead]
  )

  return <DocReadsContext.Provider value={value}>{children}</DocReadsContext.Provider>
}

const useDocReads = (): DocReadsValue | null => useContext(DocReadsContext)

/** Beside the title. Only ever shown once the guide is actually read. */
export const GuideReadIndicator = ({
  docSlug,
  label,
}: {
  readonly docSlug: string
  readonly label: string
}): ReactNode => {
  const ctx = useDocReads()
  if (ctx === null || !ctx.signedIn || ctx.readSlugs?.has(docSlug) !== true) return null

  return (
    <span className="border-accent-ring bg-accent-soft text-ob-accent inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[11px]">
      <IconCheck className="size-3" />
      {label}
    </span>
  )
}

/** Milliseconds the end of the article must stay on screen before auto-marking. */
const DWELL_MS = 1200

type GuideReadButtonProps = {
  readonly docSlug: string
  readonly lang: string
  readonly markLabel: string
  readonly readLabel: string
}

/**
 * At the end of the article, so it doubles as the "reached the end" sentinel —
 * no second element to keep in sync with it.
 */
export const GuideReadButton = ({
  docSlug,
  lang,
  markLabel,
  readLabel,
}: GuideReadButtonProps): ReactNode => {
  const ctx = useDocReads()
  const hostRef = useRef<HTMLDivElement>(null)
  /** One-shot. Disarmed by any toggle, and never re-armed for this mount. */
  const autoMarkArmed = useRef<boolean>(true)

  const isRead = ctx?.readSlugs?.has(docSlug) === true
  const ready = ctx !== null && ctx.signedIn && ctx.readSlugs !== null
  const setRead = ctx?.setRead

  useEffect(() => {
    if (!ready || isRead || setRead === undefined) return
    const node = hostRef.current
    if (node === null) return

    let dwell: ReturnType<typeof setTimeout> | null = null
    const clear = (): void => {
      if (dwell !== null) clearTimeout(dwell)
      dwell = null
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting)
      if (!visible) {
        clear()
        return
      }
      // A short guide has its end on screen at load; requiring the reader to
      // stay there stops it marking itself with nothing read.
      dwell = setTimeout(() => {
        if (!autoMarkArmed.current) return
        autoMarkArmed.current = false
        setRead(docSlug, lang, true)
      }, DWELL_MS)
    })

    observer.observe(node)
    return () => {
      clear()
      observer.disconnect()
    }
  }, [ready, isRead, setRead, docSlug, lang])

  // Nothing until loaded, so the label never flips under the reader.
  if (!ready || setRead === undefined) return null

  const onToggle = (): void => {
    autoMarkArmed.current = false
    setRead(docSlug, lang, !isRead)
  }

  return (
    <div ref={hostRef} className="border-line mt-10 border-t pt-6">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isRead}
        className={`inline-flex h-9 items-center gap-2 rounded-(--r-8) border px-3.5 text-[13px] font-medium transition-colors [&_svg]:size-3.5 ${
          isRead
            ? "border-accent-ring bg-accent-soft text-ob-accent"
            : "border-line-2 bg-bg-elev text-fg-2 hover:text-fg"
        }`}
      >
        {isRead ? <IconCheck /> : <IconBook />}
        {isRead ? readLabel : markLabel}
      </button>
    </div>
  )
}
