import { pathsSource, type PathPage } from "@/lib/paths-source"
import type { LearningPath } from "../domain/paths"
import { hasChallengeStep, hasDocStep } from "../domain/paths"

/**
 * This assignment is the only thing stopping `PATH_TRACKS` (duplicated in
 * lib/paths-schema, because source.config.ts cannot resolve `@/`) from drifting
 * past the manifest's `TRACK_COLOR_TOKENS`. A track the manifest does not know
 * resolves to no `data-track` CSS vars; this stops compiling first.
 */
export const toLearningPath = (page: PathPage): LearningPath => ({
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

export const getPathPage = (slug: string, lang: string): PathPage | undefined =>
  pathsSource.getPage([slug], lang)

export const pathsForDoc = (docSlug: string, lang: string): readonly LearningPath[] =>
  getAllPaths(lang).filter((path) => hasDocStep(path, docSlug))

export const pathForChallenge = (challengeSlug: string, lang: string): LearningPath | null =>
  getAllPaths(lang).find((path) => hasChallengeStep(path, challengeSlug)) ?? null
