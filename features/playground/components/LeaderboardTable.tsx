import type React from "react"
import Link from "next/link"
import { IconBranch } from "@/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { LeaderboardData, LeaderboardRow } from "../server/leaderboard-service"

/** Rows shown before switching to the pinned-own-row layout. */
const TOP_N = 10
/** Seats the board always offers in the sparse launch state. */
const MIN_SEATS = 6

type LeaderboardTableProps = {
  readonly dict: PlaygroundDict["leaderboard"]
  readonly data: LeaderboardData | null
  readonly hubPath: string
}

const CARD_CLASS = "border-line bg-bg-card overflow-hidden rounded-(--r-12) border"
const HEAD_CLASS =
  "text-fg-muted h-9 font-mono text-[10.5px] font-normal tracking-[0.08em] uppercase"
const NUMBER_CLASS = "text-fg-2 text-center font-mono text-[13px] leading-none tabular-nums"
const RANK_CLASS = "text-fg-muted font-mono text-[12.5px] leading-none tabular-nums"
const HIDE_ON_MOBILE = "max-[640px]:hidden"

const formatRank = (rank: number): string => String(rank).padStart(2, "0")

/** State-dependent sub-line for the page header; null when the board failed to load. */
export const getLeaderboardSub = (
  dict: PlaygroundDict["leaderboard"],
  data: LeaderboardData | null
): string | null => {
  if (data === null) return null
  if (data.rows.length === 0) return dict.subEmpty
  const template = data.rows.length > TOP_N ? dict.subFull : dict.subSparse
  return template.replace("{count}", String(data.rows.length))
}

const getInitials = (username: string): string => username.slice(0, 2).toUpperCase()

const BuilderCell = ({
  row,
  isOwn,
  youLabel,
}: {
  readonly row: LeaderboardRow
  readonly isOwn: boolean
  readonly youLabel: string
}): React.ReactElement => (
  <div className="flex min-w-0 items-center gap-2.5">
    <Avatar className="border-line size-6 shrink-0 border">
      {row.avatarUrl !== null && <AvatarImage src={row.avatarUrl} alt={row.username} />}
      <AvatarFallback className="bg-bg-elev text-fg-muted font-mono text-[9px]">
        {getInitials(row.username)}
      </AvatarFallback>
    </Avatar>
    <span className="truncate text-[14px] leading-none font-medium">{row.username}</span>
    {isOwn && (
      <Badge className="bg-accent-soft border-accent-ring text-ob-accent shrink-0 rounded-full border px-[7px] py-0 font-mono text-[10px] font-normal tracking-[0.06em] uppercase">
        {youLabel}
      </Badge>
    )}
  </div>
)

const BoardRow = ({
  row,
  isOwn,
  pinned,
  youLabel,
}: {
  readonly row: LeaderboardRow
  readonly isOwn: boolean
  readonly pinned: boolean
  readonly youLabel: string
}): React.ReactElement => {
  const getRowClass = (): string => {
    if (pinned) return "border-t-accent-ring bg-accent-soft border-t"
    if (isOwn) return "bg-ob-accent/5"
    return ""
  }

  return (
    <TableRow className={`border-line h-[42px] hover:bg-transparent ${getRowClass()}`}>
      <TableCell
        className={`pl-4 text-center ${RANK_CLASS} ${row.rank === 1 || pinned ? "text-ob-accent" : ""}`}
      >
        {formatRank(row.rank)}
      </TableCell>
      <TableCell>
        <BuilderCell row={row} isOwn={isOwn} youLabel={youLabel} />
      </TableCell>
      <TableCell className={`${NUMBER_CLASS} text-fg font-medium`}>{row.totalPoints}</TableCell>
      <TableCell className={`${NUMBER_CLASS} ${HIDE_ON_MOBILE}`}>{row.completedCount}</TableCell>
      <TableCell className={`${NUMBER_CLASS} ${HIDE_ON_MOBILE} pr-4`}>{row.bestStreak}</TableCell>
    </TableRow>
  )
}

const GhostRow = ({
  seat,
  label,
}: {
  readonly seat: number
  readonly label: string
}): React.ReactElement => (
  <TableRow
    aria-hidden
    className="border-line h-[38px] border-t border-dashed hover:bg-transparent"
  >
    <TableCell className={`pl-4 text-center ${RANK_CLASS} text-fg-faint`}>
      {formatRank(seat)}
    </TableCell>
    <TableCell colSpan={4} className="pr-4">
      <div className="flex items-center gap-2.5">
        <span className="border-line-2 size-6 shrink-0 rounded-full border border-dashed" />
        <span className="text-fg-faint truncate text-[13px] leading-none">{label}</span>
      </div>
    </TableCell>
  </TableRow>
)

const EmptyState = ({
  dict,
  hubPath,
}: {
  readonly dict: PlaygroundDict["leaderboard"]
  readonly hubPath: string
}): React.ReactElement => (
  <div className={CARD_CLASS}>
    <div className="flex flex-col items-center gap-3.5 px-10 py-12 text-center">
      <span className="border-line bg-bg-elev text-fg-muted inline-grid size-[46px] place-items-center rounded-(--r-10) border [&_svg]:size-5">
        <IconBranch aria-hidden />
      </span>
      <h3 className="m-0 text-[19px] font-[550] tracking-[-0.01em]">{dict.emptyTitle}</h3>
      <p className="text-fg-muted m-0 max-w-[42ch] text-[14px] leading-[1.55]">{dict.emptyBody}</p>
      <Link
        href={hubPath}
        className="bg-ob-accent text-accent-ink mt-1.5 inline-flex h-[38px] items-center rounded-(--r-8) px-4 text-[14px] font-medium hover:brightness-105"
      >
        {dict.emptyCta}
      </Link>
    </div>
    <div className="border-line text-fg-muted border-t px-4 py-2.5 font-mono text-[11px] tracking-[0.04em]">
      {dict.footOrder}
    </div>
  </div>
)

export const LeaderboardTable = ({
  dict,
  data,
  hubPath,
}: LeaderboardTableProps): React.ReactElement => {
  if (data === null) {
    return (
      <div className={CARD_CLASS}>
        <p className="text-fg-muted m-0 px-4 py-5 font-mono text-[12.5px]">{dict.error}</p>
      </div>
    )
  }

  if (data.rows.length === 0) {
    return <EmptyState dict={dict} hubPath={hubPath} />
  }

  const isFull = data.rows.length > TOP_N
  const visibleRows = isFull ? data.rows.slice(0, TOP_N) : data.rows
  const pinnedRow =
    isFull && data.ownRank !== null && data.ownRank > TOP_N
      ? (data.rows.find((row) => row.rank === data.ownRank) ?? null)
      : null
  const ghostSeats = isFull
    ? []
    : Array.from(
        { length: Math.max(0, MIN_SEATS - data.rows.length) },
        (_, index) => data.rows.length + index + 1
      )

  const getFooter = (): string => {
    if (pinnedRow !== null) return dict.footPinned
    return isFull ? dict.footOrder : dict.footSparse
  }

  return (
    <div className={CARD_CLASS}>
      <Table className="text-[14px]">
        <TableHeader>
          <TableRow className="border-line hover:bg-transparent">
            <TableHead className={`w-14 pl-4 text-center ${HEAD_CLASS}`}>{dict.rank}</TableHead>
            <TableHead className={HEAD_CLASS}>{dict.builder}</TableHead>
            <TableHead className={`w-[110px] text-center max-[640px]:w-20 ${HEAD_CLASS}`}>
              {dict.points}
            </TableHead>
            <TableHead className={`w-[110px] text-center ${HIDE_ON_MOBILE} ${HEAD_CLASS}`}>
              {dict.completed}
            </TableHead>
            <TableHead className={`w-[110px] pr-4 text-center ${HIDE_ON_MOBILE} ${HEAD_CLASS}`}>
              {dict.best}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map((row) => (
            <BoardRow
              key={row.username}
              row={row}
              isOwn={row.rank === data.ownRank}
              pinned={false}
              youLabel={dict.you}
            />
          ))}
          {ghostSeats.map((seat) => (
            <GhostRow
              key={seat}
              seat={seat}
              label={seat === data.rows.length + 1 ? dict.openSeat : ""}
            />
          ))}
          {pinnedRow !== null && (
            <>
              <TableRow aria-hidden className="border-line hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-fg-faint py-1 text-center font-mono text-[12px] leading-none tracking-[0.3em]"
                >
                  ···
                </TableCell>
              </TableRow>
              <BoardRow row={pinnedRow} isOwn pinned youLabel={dict.you} />
            </>
          )}
        </TableBody>
        <TableCaption className="border-line text-fg-muted m-0 border-t px-4 py-2.5 text-left font-mono text-[11px] tracking-[0.04em]">
          {getFooter()}
        </TableCaption>
      </Table>
    </div>
  )
}
