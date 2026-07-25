import type { ReactNode } from "react"
import Link from "next/link"
import { IconDeviceLaptop } from "@/icons"

type NeedsWiderScreenNoteProps = {
  readonly title: string
  readonly body: string
  readonly secondaryHref?: string
  readonly secondaryLabel?: string
}

/**
 * Shown in place of a challenge workspace entry point below
 * WORKSPACE_MIN_WIDTH (shared/viewport.ts). Names the reason and offers an
 * exit — never just a bare refusal.
 */
export const NeedsWiderScreenNote = ({
  title,
  body,
  secondaryHref,
  secondaryLabel,
}: NeedsWiderScreenNoteProps): ReactNode => (
  <div className="border-line-2 bg-bg-elev flex items-start gap-3 rounded-(--r-12) border p-4">
    <span className="text-fg-muted mt-0.5 shrink-0 [&_svg]:size-[18px]">
      <IconDeviceLaptop />
    </span>
    <div className="flex-1">
      <p className="text-fg m-0 mb-1 text-[13.5px] font-medium">{title}</p>
      <p className="text-fg-muted m-0 text-[13px] leading-[1.55]">{body}</p>
      {secondaryHref !== undefined && secondaryLabel !== undefined && (
        <Link
          href={secondaryHref}
          className="text-fg-2 hover:text-fg mt-2 inline-block text-[13px] underline underline-offset-2"
        >
          {secondaryLabel}
        </Link>
      )}
    </div>
  </div>
)
