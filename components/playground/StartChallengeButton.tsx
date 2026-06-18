"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { startChallengeSession } from "@/app/actions/playground"

const PlayIcon = (): React.ReactElement => (
  <svg
    viewBox="0 0 24 24"
    className="size-[14px] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 5l11 7-11 7z" />
  </svg>
)

const GitHubIcon = (): React.ReactElement => (
  <svg
    viewBox="0 0 24 24"
    className="size-[17px] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3a9 9 0 0 0-3 17.5v-2c-3 .5-3.5-1.5-3.5-1.5-.5-1-1-1.5-1-1.5-1-.5 0-.5 0-.5 1 0 1.5 1 1.5 1 1 1.5 2.5 1 3 1 0-1 .5-1.5 1-1.5-2-.5-3.5-1-3.5-4.5 0-1 .5-2 1-2.5 0-.5-.5-1.5 0-2.5 0 0 1 0 2.5 1a8 8 0 0 1 4 0c1.5-1 2.5-1 2.5-1 .5 1 0 2 0 2.5.5.5 1 1.5 1 2.5 0 3.5-1.5 4-3.5 4.5.5.5 1 1 1 2v3" />
  </svg>
)

type StartChallengeButtonDict = {
  readonly startChallenge: string
  readonly practiceAgain: string
  readonly continueChallenge: string
  readonly authTitle: string
  readonly authBody: string
  readonly authGithub: string
  readonly authPrivacyStrong: string
  readonly authPrivacyRest: string
  readonly signOut: string
  readonly signOutTitle: string
  readonly signOutBody: string
  readonly signOutConfirm: string
  readonly signOutCancel: string
}

type SessionStatus = "in_progress" | "completed" | null

type AuthUser = {
  readonly username: string | null
  readonly avatarUrl: string | null
}

type StartChallengeButtonProps = {
  readonly dict: StartChallengeButtonDict
  readonly isAuthenticated: boolean
  readonly sessionStatus: SessionStatus
  readonly challengePath: string
  readonly activePath: string
  readonly slug: string
  readonly lang: string
  readonly authUser: AuthUser | null
}

export const StartChallengeButton = ({
  dict,
  isAuthenticated,
  sessionStatus,
  challengePath,
  activePath,
  slug,
  lang,
  authUser,
}: StartChallengeButtonProps): React.ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const [signOutOpen, setSignOutOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const handleGitHubSignIn = async (): Promise<void> => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(challengePath)}`,
      },
    })
  }

  const handleSignOut = async (): Promise<void> => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (isAuthenticated) {
    const getCtaLabel = (): string => {
      if (sessionStatus === "in_progress") return dict.continueChallenge
      if (sessionStatus === "completed") return dict.practiceAgain
      return dict.startChallenge
    }
    const ctaLabel = getCtaLabel()

    return (
      <div className="flex flex-col gap-3">
        {sessionStatus === "in_progress" ? (
          <Link
            href={activePath}
            className="bg-ob-accent text-accent-ink inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-[var(--r-8)] text-[14px] font-medium hover:brightness-105"
          >
            <PlayIcon />
            {ctaLabel}
          </Link>
        ) : (
          <Button
            onClick={async () => {
              setLoading(true)
              await startChallengeSession(slug, lang, activePath)
            }}
            disabled={loading}
            className="bg-ob-accent text-accent-ink h-[42px] w-full gap-2 rounded-[var(--r-8)] text-[14px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
          >
            <PlayIcon />
            {ctaLabel}
          </Button>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {authUser?.avatarUrl !== null && authUser?.avatarUrl !== undefined ? (
              <Image
                src={authUser.avatarUrl}
                alt={authUser.username ?? "avatar"}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="bg-bg-elev border-line size-5 rounded-full border" />
            )}
            <span className="text-fg-2 min-w-0 truncate font-mono text-[11.5px]">
              {authUser?.username !== null && authUser?.username !== undefined
                ? `@${authUser.username}`
                : "GitHub"}
            </span>
          </div>
          <button
            onClick={() => setSignOutOpen(true)}
            className="text-fg-muted hover:text-fg-2 shrink-0 font-mono text-[11px] transition-colors duration-(--d-fast) ease-(--ease)"
          >
            {dict.signOut}
          </button>
        </div>

        <ConfirmDialog
          open={signOutOpen}
          onOpenChange={setSignOutOpen}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="text-fg-2 size-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
          title={dict.signOutTitle}
          description={dict.signOutBody}
          confirmLabel={dict.signOutConfirm}
          cancelLabel={dict.signOutCancel}
          onConfirm={handleSignOut}
        />
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-ob-accent text-accent-ink h-[42px] w-full gap-2 rounded-[var(--r-8)] text-[14px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <PlayIcon />
        {dict.startChallenge}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-bg-card border-line-2 w-[380px] max-w-[calc(100vw-2rem)] gap-0 rounded-[var(--r-16)] p-0 shadow-[var(--sh-4)]">
          <div className="px-8 pt-8 pb-7">
            <div className="mb-5 flex justify-center">
              <svg
                width="36"
                height="36"
                viewBox="0 0 64 64"
                className="text-fg"
                aria-hidden="true"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="10" x2="18" y2="54" />
                  <path d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50" />
                  <circle cx="18" cy="10" r="4.5" fill="currentColor" stroke="none" />
                  <circle cx="18" cy="54" r="4.5" fill="currentColor" stroke="none" />
                  <circle cx="40" cy="50" r="4.5" fill="var(--color-ob-accent)" stroke="none" />
                </g>
              </svg>
            </div>

            <DialogTitle className="text-fg mb-2.5 text-center text-[21px] font-[550] tracking-[-0.02em]">
              {dict.authTitle}
            </DialogTitle>
            <DialogDescription className="text-fg-2 mb-6 text-center text-[14px] leading-[1.55]">
              {dict.authBody}
            </DialogDescription>

            <Button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="bg-ob-accent text-accent-ink h-[42px] w-full gap-2.5 rounded-[var(--r-8)] text-[15px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60"
            >
              <GitHubIcon />
              {dict.authGithub}
            </Button>

            <div className="border-line my-5 h-px" />

            <p className="text-fg-muted text-center font-mono text-[11.5px] leading-[1.55]">
              <svg
                viewBox="0 0 24 24"
                className="text-ob-accent mr-1 inline-block size-[13px] align-[-2px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <strong className="text-fg-2 font-medium">{dict.authPrivacyStrong}</strong>{" "}
              {dict.authPrivacyRest}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
