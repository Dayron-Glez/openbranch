"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/shared/Logo"
import { IconGithub, IconAlertCircle } from "@/icons"
import { createClient } from "@/lib/supabase/client"
import type { AuthDictionary } from "@/lib/dictionaries/auth"

/** Reasons the callback can hand back on `?error=`. Anything else is `unknown`. */
export type AuthErrorReason = "access_denied" | "exchange_failed" | "unknown"

type LoginPanelProps = {
  readonly dict: AuthDictionary
  /** Already validated server-side: same-origin, single leading slash. */
  readonly next: string
  /** Human-readable form of `next`, for the hand-off note. */
  readonly nextLabel: string
  readonly initialError: AuthErrorReason | null
  /** The provider's raw code, shown verbatim so a support question is answerable. */
  readonly errorCode: string | null
}

export const LoginPanel = ({
  dict,
  next,
  nextLabel,
  initialError,
  errorCode,
}: LoginPanelProps): ReactElement => {
  const [redirecting, setRedirecting] = useState<boolean>(false)
  const [error, setError] = useState<AuthErrorReason | null>(initialError)

  const handleGitHubSignIn = async (): Promise<void> => {
    setRedirecting(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      // A resolved call still redirects the whole document, so reaching here
      // with no error means the hand-off is in flight and the button stays busy.
      if (oauthError !== null) {
        setError("unknown")
        setRedirecting(false)
      }
    } catch {
      // Without this the button stayed disabled forever on a rejected promise.
      setError("unknown")
      setRedirecting(false)
    }
  }

  const errorBody = (): string => {
    if (error === "access_denied") {
      return dict.errorAccessDenied.replace("{code}", errorCode ?? "access_denied")
    }
    if (error === "exchange_failed") return dict.errorExchange
    return dict.errorUnknown
  }

  const ctaLabel = (): string => {
    if (redirecting) return dict.redirecting
    if (error !== null) return dict.errorRetry
    return dict.github
  }

  return (
    <div className="max-page:p-6 max-tablet:p-0 flex items-center justify-center p-10">
      <div className="flex w-[464px] max-w-full flex-col gap-5">
        <div className="auth-rise bg-bg-card border-line max-tablet:gap-6 max-tablet:p-6 flex flex-col gap-7 rounded-(--r-16) border p-9 shadow-(--sh-3)">
          <Link href={next} aria-label="openbranch" className="w-fit">
            <Logo />
          </Link>

          <div className="flex flex-col gap-3">
            <span className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
              {dict.eyebrow}
            </span>
            <h1 className="text-fg max-tablet:text-[26px] text-[30px] leading-[1.15] font-light tracking-[-0.015em]">
              {dict.title} <span className="text-fg-2">{dict.titleAccent}</span>
            </h1>
            <p className="text-fg-2 text-[14px] leading-[1.6] text-pretty">{dict.lead}</p>
          </div>

          {error !== null && (
            <div
              role="alert"
              className="border-danger-ring bg-danger-soft flex flex-col gap-2.5 rounded-(--r-10) border p-4"
            >
              <span className="text-fg flex items-center gap-2.5 text-[14px] font-medium">
                <IconAlertCircle className="text-danger size-[15px] shrink-0" />
                {dict.errorTitle}
              </span>
              <p className="text-fg-2 text-[13px] leading-[1.6] text-pretty">{errorBody()}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="accent"
              size="lg"
              onClick={handleGitHubSignIn}
              disabled={redirecting}
              className="w-full gap-2.5 px-5 text-[14px] disabled:opacity-60"
            >
              {redirecting ? (
                <span
                  aria-hidden
                  className="border-accent-ink size-3.5 shrink-0 rounded-full border-[1.6px] border-t-transparent motion-safe:animate-spin"
                />
              ) : (
                <IconGithub className="size-[15px]" />
              )}
              {ctaLabel()}
            </Button>

            {redirecting && (
              <p className="text-fg-muted text-center font-mono text-[11.5px] leading-[1.6]">
                {dict.redirectingNote} {nextLabel}
              </p>
            )}
          </div>

          <div className="border-line -mt-1 border-t pt-5 text-center">
            <Link
              href={next}
              className="text-fg-2 hover:text-fg text-[13.5px] transition-colors duration-(--d-fast) ease-(--ease)"
            >
              {error !== null ? dict.errorBrowse : dict.browse} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
