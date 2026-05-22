const WORDS_PER_MINUTE = 200

export function getReadingTime(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

export function formatReadingTime(minutes: number, lang: string): string {
  return lang === "es" ? `${minutes} min de lectura` : `${minutes} min read`
}
