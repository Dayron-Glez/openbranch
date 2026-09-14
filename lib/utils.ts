import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"
import { PAGE_WIDTHS } from "@/lib/page-widths"

/**
 * tailwind-merge only collapses conflicting classes it recognises. Our
 * `--container-*` widths are not in its default scale, so `max-w-page` and
 * `max-w-none` would both survive and CSS order would decide — silently.
 * Teaching it the scale makes the merge deterministic.
 */
const twMerge = extendTailwindMerge({
  extend: { theme: { container: [...PAGE_WIDTHS] } },
})

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
