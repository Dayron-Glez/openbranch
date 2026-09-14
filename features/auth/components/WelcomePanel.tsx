import type { ReactElement } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/shared/LogoMark"
import { IconCheck } from "@/icons"
import type { AuthDictionary } from "@/lib/dictionaries/auth"

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
  <div className="flex items-center justify-center p-10 max-[1100px]:p-6 max-[760px]:p-0">
    <div className="flex w-[464px] max-w-full flex-col">
      <div className="auth-rise bg-bg-card border-line flex flex-col items-center gap-7 rounded-(--r-16) border p-9 text-center shadow-(--sh-3) max-[760px]:gap-6 max-[760px]:p-6">
        <LogoMark size={44} />

        <div className="flex flex-col gap-2.5">
          <h1 className="text-fg m-0 text-[26px] leading-[1.2] font-light tracking-[-0.015em]">
            {dict.welcomeTitle} <span className="text-fg font-mono text-[22px]">@{username}</span>
          </h1>
          <p className="text-fg-2 m-0 text-[14px] leading-[1.6] text-pretty">{dict.welcomeLead}</p>
        </div>

        <ul className="m-0 flex w-full list-none flex-col gap-2.5 p-0 text-left">
          <li className="text-fg-2 flex items-center gap-2.5 text-[13.5px]">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            {dict.welcomePointProgress}
          </li>
          <li className="text-fg-2 flex items-center gap-2.5 text-[13.5px]">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            {dict.welcomePointBoard}
          </li>
          <li className="text-fg-2 flex items-center gap-2.5 text-[13.5px]">
            <IconCheck className="text-ob-accent size-4 shrink-0" />
            <span>
              {dict.welcomePointProfile}{" "}
              <Link href={profileHref} className="text-fg font-mono text-[12.5px] hover:underline">
                {profileHref}
              </Link>
            </span>
          </li>
        </ul>

        <Button asChild variant="accent" size="lg" className="w-full px-5 text-[14px]">
          <Link href={continueHref}>{dict.welcomeCta}</Link>
        </Button>
      </div>
    </div>
  </div>
)
