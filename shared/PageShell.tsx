import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { PageShellWidth } from "@/lib/page-widths"

/**
 * The single owner of horizontal page geometry. `mx-auto`, `max-w-*` and the
 * side gutter live here and nowhere else, so changing the product's gutter is
 * one edit rather than twenty-one. Widths come from the `--container-*` tokens
 * in app/global.css.
 *
 * Vertical rhythm stays with the page: pass it through `className`, which is
 * merged (not replaced) so a caller can add layout without restating the shell.
 */
export type { PageShellWidth }

const WIDTH_CLASS: Record<PageShellWidth, string> = {
  page: "max-w-page",
  reading: "max-w-reading",
  wide: "max-w-wide",
}

const GUTTER_CLASS = "mx-auto w-full px-8 max-narrow:px-5"

/**
 * Shell classes for surfaces that cannot be a `<PageShell>` element — the nav
 * bar's inner row, the footer, a wrapper inside a full-bleed `<main>`. Same
 * source of truth, so those stay aligned with page content by construction.
 */
export const pageShellClass = (width: PageShellWidth = "page"): string =>
  cn(GUTTER_CLASS, WIDTH_CLASS[width])

type PageShellProps = {
  readonly children: ReactNode
  readonly width?: PageShellWidth
  readonly className?: string
}

/**
 * `data-pg-main` is always set: PlaygroundTransition selects `[data-pg-main]`
 * to animate page entry, and every playground `<main>` must carry it. Making
 * it structural means it cannot be forgotten on a new route. Outside the
 * playground nothing selects it, so it is inert there.
 */
export const PageShell = ({ children, width = "page", className }: PageShellProps): ReactNode => (
  <main data-pg-main className={cn(pageShellClass(width), className)}>
    {children}
  </main>
)
