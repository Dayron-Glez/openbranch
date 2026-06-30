/**
 * Returns a slug → T lookup function over a static challenge collection.
 * T is inferred from the entries object, so no explicit annotation is needed
 * at call sites.
 *
 * @example
 * export const getDiffBySlug = createChallengeRegistry({
 *   "code-review-noisy-pr": codeReviewNoisyPrDiff,
 * })
 */
export const createChallengeRegistry =
  <T>(entries: Readonly<Record<string, T>>) =>
  (slug: string): T | null =>
    entries[slug] ?? null
