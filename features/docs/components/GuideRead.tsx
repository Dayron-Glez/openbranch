"use client"

import type { ReactNode } from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { setGuideRead } from "@/app/actions/docs"
import { IconCheck, IconBook } from "@/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Read state is per-user, but the docs pages are statically rendered and their
// whole layout chain is free of dynamic APIs — resolving it during their render
// turns every guide into a per-request render. Hence the fetch from
// /api/doc-reads, mounted in the docs layout: that survives client-side
// navigation, so it runs once per docs session rather than once per guide.

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
   * Optimistic locally, serialised on the wire. An un-mark must not be able to
   * land before the auto-mark insert it follows — that leaves a surviving row
   * with the UI showing unread. Chaining per slug and always sending the latest
   * intent makes that ordering unrepresentable.
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

  const value = useMemo<DocReadsValue>(
    () => ({ readSlugs, signedIn, setRead }),
    [readSlugs, signedIn, setRead]
  )

  return <DocReadsContext.Provider value={value}>{children}</DocReadsContext.Provider>
}

const useDocReads = (): DocReadsValue | null => useContext(DocReadsContext)

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

const DWELL_MS = 1200

export type GuideReadDict = {
  readonly markLabel: string
  readonly readLabel: string
  readonly markHint: string
  readonly unmarkHint: string
  readonly confirmTitle: string
  readonly confirmBody: string
  readonly confirmAction: string
  readonly cancel: string
}

type GuideReadButtonProps = {
  readonly docSlug: string
  readonly lang: string
  readonly dict: GuideReadDict
}

/** Sits at the end of the article, so it doubles as the "reached the end" sentinel. */
export const GuideReadButton = ({ docSlug, lang, dict }: GuideReadButtonProps): ReactNode => {
  const ctx = useDocReads()
  const hostRef = useRef<HTMLDivElement>(null)
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
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

  /**
   * Un-marking asks first: it deletes the row, which loses the original
   * `read_at` and drops the path's progress. Marking back costs neither.
   */
  const onClick = (): void => {
    autoMarkArmed.current = false
    if (isRead) {
      setConfirmOpen(true)
      return
    }
    setRead(docSlug, lang, true)
  }

  return (
    <div ref={hostRef} className="border-line mt-10 border-t pt-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-pressed={isRead}
            className={`inline-flex h-9 items-center gap-2 rounded-(--r-8) border px-3.5 text-[13px] font-medium transition-colors [&_svg]:size-3.5 ${
              isRead
                ? "border-accent-ring bg-accent-soft text-ob-accent"
                : "border-line-2 bg-bg-elev text-fg-2 hover:text-fg"
            }`}
          >
            {isRead ? <IconCheck /> : <IconBook />}
            {isRead ? dict.readLabel : dict.markLabel}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{isRead ? dict.unmarkHint : dict.markHint}</TooltipContent>
      </Tooltip>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={dict.confirmTitle}
        description={dict.confirmBody}
        confirmLabel={dict.confirmAction}
        cancelLabel={dict.cancel}
        onConfirm={() => {
          setConfirmOpen(false)
          setRead(docSlug, lang, false)
        }}
      />
    </div>
  )
}
