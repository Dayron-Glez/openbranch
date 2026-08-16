import type { ReactNode } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconArrowRight } from "@/icons"
import type { ProfileDictionary } from "@/lib/dictionaries/profile"
import type { ProfileOverview, ProfileRank } from "../server/profile-service"
import { RankChip } from "./RankChip"

/** Same fallback as the leaderboard's rows, so one person reads alike in both. */
const getInitials = (username: string): string => username.slice(0, 2).toUpperCase()

const formatMemberSince = (isoDate: string, lang: string): string =>
  new Intl.DateTimeFormat(lang === "en" ? "en" : "es", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate))

export const ProfileHeader = ({
  overview,
  rank,
  leaderboardHref,
  dict,
  lang,
}: {
  readonly overview: ProfileOverview
  readonly rank: ProfileRank | null
  readonly leaderboardHref: string
  readonly dict: ProfileDictionary
  readonly lang: string
}): ReactNode => (
  <header className="flex items-start gap-4">
    <Avatar className="border-line bg-bg-elev size-14 shrink-0 border">
      {overview.avatarUrl !== null && (
        <AvatarImage src={overview.avatarUrl} alt={overview.username} />
      )}
      <AvatarFallback className="bg-bg-elev text-fg-2 font-mono text-[17px] font-medium">
        {getInitials(overview.username)}
      </AvatarFallback>
    </Avatar>

    <div className="min-w-0 flex-1 pt-0.5">
      <h1 className="text-fg m-0 text-[22px] leading-[1.15] font-semibold tracking-[-0.015em]">
        {overview.username}
      </h1>
      <p className="text-fg-muted m-0 mt-[3px] font-mono text-[12px]">
        github.com/{overview.username}
      </p>
      <div className="text-fg-muted mt-2.5 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span>
          {overview.memberSince === null
            ? dict.memberSinceUnknown
            : dict.memberSince(formatMemberSince(overview.memberSince, lang))}
        </span>
        {/* Only worth offering once they are actually on the board. */}
        {rank !== null && (
          <>
            <span className="bg-fg-faint size-[3px] shrink-0 rounded-full" />
            <Link
              href={leaderboardHref}
              className="text-fg-2 hover:text-fg inline-flex items-center gap-1 no-underline"
            >
              {dict.seeOnLeaderboard}
              <IconArrowRight aria-hidden className="size-[11px]" />
            </Link>
          </>
        )}
      </div>
    </div>

    <RankChip rank={rank} dict={dict} />
  </header>
)
