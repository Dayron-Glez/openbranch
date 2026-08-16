import type { ReactNode } from "react"
import { IconRoute, IconTrophy } from "@/icons"
import type { ProfileDictionary } from "@/lib/dictionaries/profile"
import type { ProfileRank } from "../server/profile-service"

/**
 * Beyond this the position stops being a fact worth printing. `#412 of 1,240`
 * reads as *last in the class*, which is the opposite of what someone still
 * building a record needs to see, so a band replaces the number.
 */
const EXACT_RANK_LIMIT = 100

const CHIP_BASE =
  "inline-flex shrink-0 items-center gap-[7px] rounded-full border px-3.5 py-[7px] font-mono text-[13px] [&_svg]:size-3.5"

/** Rounded up, so rank 1 of 8 is "Top 13%" rather than "Top 12%". */
const percentileOf = (rank: number, totalRanked: number): number =>
  Math.max(1, Math.ceil((rank / totalRanked) * 100))

/**
 * The profile's one lightly-loud accent, and the only place a number is
 * allowed to shout. Three tiers, so it appears only when it means something:
 * an exact position near the top, a band further down, and nothing at all for
 * a profile with no completions — where `rank` is null and the chip goes quiet
 * instead of inventing a last place.
 */
export const RankChip = ({
  rank,
  dict,
}: {
  readonly rank: ProfileRank | null
  readonly dict: ProfileDictionary
}): ReactNode => {
  if (rank === null || rank.totalRanked === 0) {
    return (
      <span className={`${CHIP_BASE} border-line-2 bg-bg-elev text-fg-2`}>
        <IconRoute aria-hidden className="text-fg-muted" />
        <span className="font-medium">{dict.rankStarting}</span>
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
      <span className="font-medium">{label}</span>
    </span>
  )
}
