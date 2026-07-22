import type { ReactNode } from "react"
import Link from "next/link"
import { IconClock } from "@/icons"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import { DiffBars } from "@/shared/DiffBars"
import "./challenge-card.css"

type ChallengeDifficultyKey = "beginner" | "moderate" | "demanding"

type SessionStatus = "in_progress" | "completed" | null

type ChallengeCardProps = {
  readonly href: string
  readonly title: string
  readonly description: string
  readonly difficulty: ChallengeDifficultyKey
  readonly estimatedMinutes: number
  readonly icon: ReactNode
  readonly colorToken: TrackColorToken
  readonly difficultyLabel: string
  readonly statusLabel: string
  readonly minutesLabel: string
  readonly sessionStatus?: SessionStatus
}

export const ChallengeCard = ({
  href,
  title,
  description,
  difficulty,
  estimatedMinutes,
  icon,
  colorToken,
  difficultyLabel,
  statusLabel,
  minutesLabel,
  sessionStatus,
}: ChallengeCardProps) => {
  let statusTextClass = "text-fg-muted"
  if (sessionStatus === "completed") statusTextClass = "text-ob-accent"
  else if (sessionStatus === "in_progress") statusTextClass = "text-warn"

  let statusDotClass = "border-fg-faint border-[1.5px]"
  if (sessionStatus === "completed") statusDotClass = "bg-ob-accent"
  else if (sessionStatus === "in_progress") statusDotClass = "bg-warn"

  return (
    <Link
      href={href}
      data-challenge-card
      data-track={colorToken}
      className="group border-line bg-bg-card hover:bg-bg-hover relative flex flex-col gap-3 overflow-hidden rounded-(--r-12) border p-5 text-inherit no-underline transition-[background,border-color] duration-(--d-base) ease-(--ease)"
    >
      <div className="flex items-center justify-between">
        <span className="inline-grid size-9 shrink-0 place-items-center rounded-(--r-8) border border-(--track-ring) bg-(--track-soft) text-(color:--track) [&_svg]:size-[17px]">
          {icon}
        </span>
        <span className={`flex items-center gap-1.5 font-mono text-[11.5px] ${statusTextClass}`}>
          <span className={`size-1.5 rounded-full ${statusDotClass}`} />
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="m-0 text-[15px] leading-snug font-medium tracking-[0]">{title}</h3>
        <p className="text-fg-muted m-0 line-clamp-2 text-[13px] leading-[1.55]">{description}</p>
      </div>
      <div className="text-fg-muted mt-auto flex items-center justify-between font-mono text-[11px] tracking-[0.04em]">
        <span className="flex items-center gap-2">
          <DiffBars difficulty={difficulty} />
          <span>{difficultyLabel}</span>
        </span>
        <span className="flex items-center gap-1">
          <IconClock className="size-3 shrink-0" />
          <span>
            {estimatedMinutes} {minutesLabel}
          </span>
        </span>
      </div>
    </Link>
  )
}
