/**
 * Relative dates ("hace 3 días"), bucketed by day / week / month. The labels
 * come in from the caller's dictionary — copy does not belong in `lib`.
 * `Intl.RelativeTimeFormat` covers every other case, including pluralisation.
 */

export type RelativeDateLabels = {
  /** Under a day old — RelativeTimeFormat would say "in 0 days". */
  readonly today: string
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
