import { source } from "./source"
import { formatRelativeDate as formatRelative } from "./relative-date"

type PageWithLastModified = { lastModified?: Date }

export type SectionStats = {
  count: number
  lastModified: Date | null
}

export function getSectionStats(slug: string, lang: string): SectionStats {
  const pages = source.getPages(lang)
  // Exclude the section index page (slugs.length === 1); only count actual guides
  const sectionPages = pages.filter((p) => p.slugs[0] === slug && p.slugs.length > 1)

  const count = sectionPages.length

  const dates = sectionPages
    .map((p) => (p.data as PageWithLastModified).lastModified)
    .filter((d): d is Date => d instanceof Date)

  const lastModified =
    dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null

  return { count, lastModified }
}

/**
 * Kept as the docs sections' entry point, but the bucketing now lives in
 * lib/relative-date.ts so the profile activity feed can share it. These two
 * literals were the only copy in this module and stay here to keep the docs
 * cards rendering exactly as before.
 */
export function formatRelativeDate(date: Date | null, lang: string): string {
  return formatRelative(date, lang, {
    today: lang === "es" ? "hoy" : "today",
    unknown: lang === "es" ? "recientemente" : "recently",
  })
}
