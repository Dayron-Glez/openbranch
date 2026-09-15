import type { ReactElement } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/shared/LogoMark"
import { IconCheck } from "@/icons"
import type { AuthDictionary } from "@/lib/dictionaries/auth"
import { AuthPanel } from "@/features/auth/components/AuthPanel"

/**
 * Shown once, on the request that created the account. Returning users keep
 * going straight to `?next=` without seeing anything, which is what makes this
 * worth showing at all.
 */
type WelcomePanelProps = {
  readonly dict: AuthDictionary
  readonly username: string
  readonly profileHref: string
  readonly continueHref: string
}

export const WelcomePanel = ({
  dict,
  username,
  profileHref,
  continueHref,
}: WelcomePanelProps): ReactElement => (
  <div className="max-page:p-6 max-tablet:p-0 flex items-center justify-center p-10">
    <div className="flex w-[464px] max-w-full flex-col">
      <AuthPanel centered>
        <LogoMark size={44} />

        <div className="flex flex-col gap-2.5">
          <h1 className="text-fg text-[26px] leading-[1.2] font-light tracking-[-0.015em]">
            {dict.welcomeTitle} <span className="text-fg font-mono text-[22px]">@{username}</span>
          </h1>
          <p className="text-fg-2 text-sm leading-[1.6] text-pretty">{dict.welcomeLead}</p>
        </div>

        <ul className="flex w-full list-none flex-col gap-2.5 p-0 text-left">
          <li className="text-fg-2 flex items-center gap-2.5 text-sm">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            {dict.welcomePointProgress}
          </li>
          <li className="text-fg-2 flex items-center gap-2.5 text-sm">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            {dict.welcomePointBoard}
          </li>
          <li className="text-fg-2 flex items-center gap-2.5 text-sm">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            <span>
              {dict.welcomePointProfile}{" "}
              <Link href={profileHref} className="text-fg text-13 font-mono hover:underline">
                {profileHref}
              </Link>
            </span>
          </li>
        </ul>

        <Button asChild variant="accent" size="lg" className="w-full px-5 text-sm">
          <Link href={continueHref}>{dict.welcomeCta}</Link>
        </Button>
      </AuthPanel>
    </div>
  </div>
)
