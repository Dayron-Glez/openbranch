"use client"

import { useState, type ReactNode } from "react"
import { IconCheck, IconShare } from "@/icons"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { SITE_URL } from "@/lib/constants"
import { localizedHref } from "@/lib/landing-dictionary"

const COPIED_DURATION_MS = 2000

/**
 * Feature-detects `navigator.share` inside the click handler rather than at
 * render time, so server and client render identical markup — no
 * hydration guard needed just to know which capability the browser has.
 *
 * Takes resolved strings, not the `ProfileDict` object — `ProfileDict`'s
 * template functions (`shareText`, `metaTitle`, …) can't cross the
 * server/client boundary, so the caller resolves them server-side first.
 */
export const ShareProfileButton = ({
  username,
  lang,
  shareTitle,
  shareText,
  shareLabel,
  shareCopiedLabel,
}: {
  readonly username: string
  readonly lang: string
  readonly shareTitle: string
  readonly shareText: string
  readonly shareLabel: string
  readonly shareCopiedLabel: string
}): ReactNode => {
  const [copied, setCopied] = useState<boolean>(false)

  const handleShare = async (): Promise<void> => {
    const profilePath = localizedHref(lang, `/u/${username}`)
    const url = `${SITE_URL}${profilePath}`

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url })
      } catch {
        // Closing the native share sheet rejects the promise — not an error.
      }
      return
    }

    await navigator.clipboard.writeText(`${shareText} ${url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_DURATION_MS)
  }

  const Icon = copied ? IconCheck : IconShare
  const label = copied ? shareCopiedLabel : shareLabel

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleShare}
          className="border-line-2 bg-bg-elev text-fg-2 hover:text-fg hover:border-line inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors [&_svg]:size-4 [&_svg]:shrink-0"
          aria-label={label}
        >
          <Icon aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
