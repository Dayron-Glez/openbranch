import type { ReactElement } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Logo } from "@/shared/Logo"
import type { AuthDictionary } from "@/lib/dictionaries/auth"
import { SignOutButton } from "@/shared/SignOutButton"

/**
 * The design paired sign-out with "use a different account". That control was
 * dropped: it can only sign out and re-run OAuth, and GitHub — still holding its
 * own session — silently re-authorises the same account, so it promised
 * switching and delivered a round trip to the same place.
 */
type AlreadySignedInProps = {
  readonly dict: AuthDictionary
  readonly username: string
  readonly avatarUrl: string | null
  readonly streak: number
  /** Title of the challenge left in progress, when there is one. */
  readonly openChallengeTitle: string | null
  /** Where the primary CTA goes — the open challenge, or `next`. */
  readonly continueHref: string
  readonly next: string
}

const initialsOf = (username: string): string =>
  username
    .split(/[-_\s]/)
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("")

export const AlreadySignedIn = ({
  dict,
  username,
  avatarUrl,
  streak,
  openChallengeTitle,
  continueHref,
  next,
}: AlreadySignedInProps): ReactElement => (
  <div className="max-page:p-6 max-tablet:p-0 flex items-center justify-center p-10">
    <div className="flex w-[464px] max-w-full flex-col">
      <div className="auth-rise bg-bg-card border-line max-tablet:gap-6 max-tablet:p-6 flex flex-col gap-7 rounded-(--r-16) border p-9 shadow-(--sh-3)">
        <Link href={next} aria-label="openbranch" className="w-fit">
          <Logo />
        </Link>

        {/* A plain row, not a nested card: with no streak to fill its right
            half, a boxed version reads as a container someone forgot to fill. */}
        <div className="border-line flex items-center gap-3 border-b pb-6">
          {avatarUrl === null ? (
            <span
              aria-hidden
              className="border-line-2 bg-bg-elev text-fg-muted inline-grid size-10 shrink-0 place-items-center rounded-full border font-mono text-sm"
            >
              {initialsOf(username)}
            </span>
          ) : (
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="border-line-2 size-10 shrink-0 rounded-full border object-cover"
              unoptimized
            />
          )}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-fg truncate font-mono text-sm">@{username}</span>
            <span className="text-fg-muted text-xs">{dict.signedInWith}</span>
          </span>
          {streak > 0 && (
            <span className="border-accent-ring bg-accent-soft text-ob-accent text-2xs ml-auto shrink-0 rounded-full border px-2.5 py-[3px] font-mono tracking-[0.06em] uppercase">
              {dict.streak.replace("{count}", String(streak))}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-fg text-[26px] leading-[1.2] font-light tracking-[-0.015em]">
            {dict.signedInTitle}
          </h1>
          {openChallengeTitle === null ? (
            <p className="text-fg-2 text-sm leading-[1.6]">{dict.signedInNone}</p>
          ) : (
            <p className="text-fg-2 text-sm leading-[1.6]">
              {dict.signedInOpen} <span className="text-fg">{openChallengeTitle}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Button asChild variant="accent" size="lg" className="w-full px-5 text-sm">
            <Link href={continueHref}>
              {openChallengeTitle === null ? dict.signedInGo : dict.signedInContinue}
            </Link>
          </Button>
          <div className="border-line border-t pt-5 text-center">
            <SignOutButton
              dict={dict}
              redirectTo={next}
              className="text-fg-2 hover:text-danger text-sm transition-colors duration-(--d-fast) ease-(--ease)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)
