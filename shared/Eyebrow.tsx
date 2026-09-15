import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The small monospace label above a panel or a block of detail. Nine copies of
 * this string existed before it was a component; `className` is merged so a
 * caller can add spacing without restating it.
 *
 * The page-section eyebrow is a different size and tracking and is not covered
 * here yet — see issue #240.
 */
export const Eyebrow = ({
  children,
  className,
}: {
  readonly children: ReactNode
  readonly className?: string
}): ReactNode => (
  <p className={cn("text-fg-muted text-2xs font-mono tracking-[0.08em] uppercase", className)}>
    {children}
  </p>
)
