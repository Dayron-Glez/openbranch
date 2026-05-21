import { source } from "./source"

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

export function formatRelativeDate(date: Date | null, lang: string): string {
  if (!date) return lang === "es" ? "recientemente" : "recently"

  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "narrow" })
  const diffMs = date.getTime() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)

  if (Math.abs(diffDays) < 1) return lang === "es" ? "hoy" : "today"
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, "day")
  if (Math.abs(diffDays) < 30) return rtf.format(Math.round(diffDays / 7), "week")
  return rtf.format(Math.round(diffDays / 30), "month")
}
