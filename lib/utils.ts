import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { PAGE_WIDTHS, TEXT_STEPS } from "@/lib/page-widths"

/**
 * tailwind-merge only collapses conflicting classes it recognises, and neither
 * our `--container-*` widths nor our `--text-*` steps are in its default scale.
 *
 * Left untaught, `max-w-page` and `max-w-none` would both survive and CSS order
 * would decide. Worse for text: tailwind-merge reads `text-*` as a size or a
 * colour, and only recognises t-shirt-style names, so `text-13` lands in the
 * colour group and `cn("text-fg-muted", "text-13")` silently drops the colour.
 */
const twMerge = extendTailwindMerge({
  extend: { theme: { container: [...PAGE_WIDTHS], text: [...TEXT_STEPS] } },
})

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
