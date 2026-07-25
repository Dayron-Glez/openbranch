import type { ReactNode } from "react"
import Link from "next/link"
import { IconRoute } from "@/icons"
import type { TrackColorToken } from "@/features/playground/domain/manifest"

/**
 * Opt-in only — per specs/learning-paths-v1.md §07, the default for a track
 * without a path (documentation, bug-fix in v1) is to show nothing at all.
 * Not wired into any surface yet; a future surface owner reaches for this
 * only where an unfilled slot would otherwise look conspicuously empty.
 */
type NoPathNoteProps = {
  readonly track: TrackColorToken
  readonly browseHref: string
  readonly heading: string
  readonly body: string
  readonly cta: string
}

export const NoPathNote = ({
  track,
  browseHref,
  heading,
  body,
  cta,
}: NoPathNoteProps): ReactNode => (
  <div data-track={track} className="mx-auto max-w-[440px] px-5 py-6 text-center">
    <span className="mb-4 inline-grid size-12 place-items-center rounded-(--r-12) border border-(--track-ring) bg-(--track-soft) text-(color:--track) [&_svg]:size-[22px]">
      <IconRoute />
    </span>
    <h4 className="text-fg m-0 mb-2 text-[16px] font-semibold">{heading}</h4>
    <p className="text-fg-muted mx-auto mb-4 max-w-[42ch] text-[13.5px] leading-[1.6]">{body}</p>
    <Link
      href={browseHref}
      className="border-line-2 bg-bg-elev text-fg-2 hover:text-fg inline-flex h-9 items-center gap-2 rounded-(--r-8) border px-4 text-[13px] font-medium no-underline transition-colors"
    >
      {cta}
    </Link>
  </div>
)
