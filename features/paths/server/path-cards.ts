import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { CHALLENGE_TRACKS } from "@/features/playground/domain/manifest"
import type { PathCardItem } from "../components/PathCard"
import { isStepDone, type PathProgress } from "../domain/path-status"
import { flattenSteps, type LearningPath } from "../domain/paths"

/**
 * Shared by the index route and the hub band so the two cannot describe the
 * same path differently. `progress` is `null` when signed out, which is what
 * makes the card describe the path's shape instead of progress.
 *
 * The card is handed a ready-made count rather than inferring one: deducing
 * "signed out" from the data shape broke as soon as guides carried real
 * booleans, and would also have misread a path with no challenges.
 */
export const buildPathCardItems = (
  paths: readonly LearningPath[],
  lang: string,
  categoryDict: PlaygroundDict["category"],
  progress: PathProgress | null
): readonly PathCardItem[] =>
  paths.map((path) => {
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
    }
  })

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
