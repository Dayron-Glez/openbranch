import { pathsSource, type PathPage } from "@/lib/paths-source"
import type { LearningPath } from "../domain/paths"
import { hasChallengeStep, hasDocStep } from "../domain/paths"

/**
 * Assigning the schema's `track` into `LearningPath["track"]` is what keeps
 * `PATH_TRACKS` (lib/paths-schema, duplicated because source.config.ts cannot
 * resolve `@/`) from drifting past the manifest's `TRACK_COLOR_TOKENS`: a
 * track the manifest does not know would resolve to no `data-track` CSS vars,
 * and this assignment stops compiling before that can ship.
 */
const toLearningPath = (page: PathPage): LearningPath => ({
  slug: page.slugs[0],
  track: page.data.track,
  title: page.data.title,
  lead: page.data.lead,
  sections: page.data.sections,
})

export const getAllPaths = (lang: string): readonly LearningPath[] =>
  pathsSource.getPages(lang).map(toLearningPath)

export const getPath = (slug: string, lang: string): LearningPath | null => {
  const page = pathsSource.getPage([slug], lang)
  return page === undefined ? null : toLearningPath(page)
}

/** Paths referencing a given doc slug — powers the docs chip and next-in-path block. */
export const pathsForDoc = (docSlug: string, lang: string): readonly LearningPath[] =>
  getAllPaths(lang).filter((path) => hasDocStep(path, docSlug))

/** The path a challenge belongs to, if any — powers the result-page recap. */
export const pathForChallenge = (challengeSlug: string, lang: string): LearningPath | null =>
  getAllPaths(lang).find((path) => hasChallengeStep(path, challengeSlug)) ?? null
