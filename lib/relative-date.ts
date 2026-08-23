/**
 * Relative dates ("hace 3 días"), bucketed by day / week / month.
 *
 * Lifted out of section-stats.ts, which grew it for the docs section cards and
 * hardcoded its two special-case literals inline. A second caller — the public
 * profile's activity feed — made that placement wrong twice over: a docs-stats
 * module is not where a date helper belongs, and copy does not belong in `lib`
 * at all. The labels now come in from the caller's dictionary.
 *
 * `Intl.RelativeTimeFormat` covers every other case, including pluralisation.
 */

export type RelativeDateLabels = {
  /** Under a day old — RelativeTimeFormat would say "in 0 days". */
  readonly today: string
  /** No date available at all. */
  readonly unknown: string
}

const MS_PER_DAY = 86_400_000

export const formatRelativeDate = (
  date: Date | null,
  lang: string,
  labels: RelativeDateLabels
): string => {
  if (date === null) return labels.unknown

  const formatter = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "narrow" })
  const diffDays = Math.round((date.getTime() - Date.now()) / MS_PER_DAY)
  const magnitude = Math.abs(diffDays)

  if (magnitude < 1) return labels.today
  if (magnitude < 7) return formatter.format(diffDays, "day")
  if (magnitude < 30) return formatter.format(Math.round(diffDays / 7), "week")
  return formatter.format(Math.round(diffDays / 30), "month")
}
