import { source } from "./source"

const mulberry32 = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const arr = [...items]
  const rand = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const getAbsoluteWeek = (date: Date): number => {
  return Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))
}

const makeExcerpt = (text: string, maxLength = 450): string => {
  if (text.length <= maxLength) return text
  const trimmed = text.slice(0, maxLength)
  const lastSpace = trimmed.lastIndexOf(" ")
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + "…"
}

export type WeeklyPick = {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly excerpt: string
  readonly rawText: string
}

export async function getWeeklyPick(lang: string, date = new Date()): Promise<WeeklyPick | null> {
  const guides = source
    .getPages(lang)
    .filter((p) => p.slugs.length === 2)
    .sort((a, b) => a.url.localeCompare(b.url))

  if (guides.length === 0) return null

  const week = getAbsoluteWeek(date)
  const cycle = Math.floor(week / guides.length)
  const position = week % guides.length

  const page = seededShuffle(guides, cycle)[position]
  const rawText = await page.data.getText("processed")

  return {
    title: page.data.title,
    description: page.data.description ?? "",
    href: page.url,
    excerpt: makeExcerpt(rawText),
    rawText,
  }
}
