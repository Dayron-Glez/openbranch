export const createChallengeRegistry =
  <T>(entries: Readonly<Record<string, T>>) =>
  (slug: string): T | null =>
    entries[slug] ?? null
