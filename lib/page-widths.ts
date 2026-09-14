/**
 * The page-content widths, as named in the `--container-*` tokens in
 * app/global.css. Shared with `cn()` so tailwind-merge can recognise them:
 * without that, `max-w-page` and `max-w-none` both survive a merge and CSS
 * order silently decides the winner.
 */
export const PAGE_WIDTHS = ["page", "reading", "wide"] as const

export type PageShellWidth = (typeof PAGE_WIDTHS)[number]
