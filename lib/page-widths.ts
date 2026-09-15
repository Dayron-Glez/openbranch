/**
 * The page-content widths, as named in the `--container-*` tokens in
 * app/global.css. Shared with `cn()` so tailwind-merge can recognise them:
 * without that, `max-w-page` and `max-w-none` both survive a merge and CSS
 * order silently decides the winner.
 */
export const PAGE_WIDTHS = ["page", "reading", "wide"] as const

export type PageShellWidth = (typeof PAGE_WIDTHS)[number]

/**
 * The text steps that are ours rather than Tailwind's. `cn()` needs them too:
 * tailwind-merge reads `text-*` as either a size or a colour, and it only
 * recognises t-shirt-style names. A numeric step like `text-13` falls through
 * to the colour group, so `cn("text-fg-muted", "text-13")` would silently drop
 * the colour.
 */
export const TEXT_STEPS = ["3xs", "2xs", "13", "15"] as const
