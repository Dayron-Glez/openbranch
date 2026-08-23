import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { source } from "@/lib/source"
import { playgroundSource } from "@/lib/playground-source"
import { getReadingTime } from "@/lib/reading-time"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { CHALLENGE_TRACKS } from "@/features/playground/domain/manifest"
import type { PathCardItem } from "../components/PathCard"
import { isStepDone, type PathProgress } from "../domain/path-status"
import { flattenSteps, type LearningPath, type PathStep } from "../domain/paths"

/**
 * Just the number, not a full step resolution — the card only ever shows a
 * total. `resolveStep` on the path detail page does the equivalent work but
 * also resolves title/description/etc., which the card does not need.
 */
const stepMinutes = async (step: PathStep, lang: string): Promise<number> => {
  if (step.type === "doc") {
    const page = source.getPage(step.slug.split("/"), lang)
    if (page === undefined) return 0
    return getReadingTime(await page.data.getText("processed"))
  }
  return playgroundSource.getPage([step.slug], lang)?.data.estimated_minutes ?? 0
}

const sumEstimatedMinutes = async (path: LearningPath, lang: string): Promise<number> => {
  const minutes = await Promise.all(flattenSteps(path).map((step) => stepMinutes(step, lang)))
  return minutes.reduce((sum, m) => sum + m, 0)
}

/**
 * Shared by the index route and the hub band so the two cannot describe the
 * same path differently. `progress` is `null` when signed out, which is what
 * makes the card describe the path's shape instead of progress.
 *
 * The card is handed a ready-made count rather than inferring one: deducing
 * "signed out" from the data shape broke as soon as guides carried real
 * booleans, and would also have misread a path with no challenges.
 *
 * Async because the completed-state caption needs a total time estimate,
 * which for guide steps means reading the MDX body — one `getText` per guide
 * step across every path shown, in parallel. Cheap at today's catalog size
 * (one path, two guide steps); worth revisiting if the catalog grows a lot.
 */
export const buildPathCardItems = async (
  paths: readonly LearningPath[],
  lang: string,
  categoryDict: PlaygroundDict["category"],
  progress: PathProgress | null
): Promise<readonly PathCardItem[]> =>
  Promise.all(
    paths.map(async (path) => {
      const trackMeta = CHALLENGE_TRACKS.find((track) => track.colorToken === path.track)
      const steps = flattenSteps(path)
      const done = progress === null ? 0 : steps.filter((step) => isStepDone(step, progress)).length

      return {
        href: localizedHref(lang, `/paths/${path.slug}`),
        title: path.title,
        description: path.lead,
        track: path.track,
        trackLabel: trackMeta !== undefined ? categoryDict[trackMeta.category] : path.track,
        icon: getChallengeIcon(trackMeta?.iconName),
        steps: steps.map((step) => ({
          type: step.type,
          done: progress === null ? null : isStepDone(step, progress),
        })),
        progress: progress === null ? null : { done, total: steps.length },
        estimatedMinutes: await sumEstimatedMinutes(path, lang),
      }
    })
  )

/** Every challenge slug across a set of paths — input to the progress query. */
export const challengeSlugsAcross = (paths: readonly LearningPath[]): readonly string[] =>
  paths.flatMap((path) =>
    flattenSteps(path)
      .filter((step) => step.type === "challenge")
      .map((step) => step.slug)
  )

/** Every guide slug across a set of paths — input to the read-guides query. */
export const docSlugsAcross = (paths: readonly LearningPath[]): readonly string[] =>
  paths.flatMap((path) =>
    flattenSteps(path)
      .filter((step) => step.type === "doc")
      .map((step) => step.slug)
  )
