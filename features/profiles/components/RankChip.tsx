import type { ReactNode } from "react"
import { IconRoute, IconTrophy } from "@/icons"
import type { ProfileDict } from "@/lib/dictionaries/profile"
import type { ProfileRank } from "../server/profile-service"

/** Past this a bare position reads as *last in the class*, so a band replaces it. */
const EXACT_RANK_LIMIT = 100

const CHIP_BASE =
  "inline-flex shrink-0 items-center gap-[7px] rounded-full border px-3.5 py-[7px] font-mono text-[13px] leading-none [&_svg]:size-3.5"

/** Rounded up, so rank 1 of 8 is "Top 13%" rather than "Top 12%". */
const percentileOf = (rank: number, totalRanked: number): number =>
  Math.max(1, Math.ceil((rank / totalRanked) * 100))

export const RankChip = ({
  rank,
  dict,
}: {
  readonly rank: ProfileRank | null
  readonly dict: ProfileDict
}): ReactNode => {
  if (rank === null || rank.totalRanked === 0) {
    return (
      <span className={`${CHIP_BASE} border-line-2 bg-bg-elev text-fg-2`}>
        <IconRoute aria-hidden className="text-fg-muted" />
        <span className="translate-y-px font-medium">{dict.rankStarting}</span>
      </span>
    )
  }

  const label =
    rank.rank <= EXACT_RANK_LIMIT
      ? dict.rankNumber(rank.rank)
      : dict.rankTopPercent(percentileOf(rank.rank, rank.totalRanked))

  return (
    <span className={`${CHIP_BASE} border-accent-ring bg-accent-soft text-ob-accent`}>
      <IconTrophy aria-hidden />
      <span className="translate-y-px font-medium">{label}</span>
    </span>
  )
}
