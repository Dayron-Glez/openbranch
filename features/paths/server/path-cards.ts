import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { CHALLENGE_TRACKS } from "@/features/playground/domain/manifest"
import type { PathCardItem } from "../components/PathCard"
import { flattenSteps, type LearningPath } from "../domain/paths"

/**
 * Shared by the index route and the hub band so the two cannot describe the
 * same path differently. `completed` is `null` when signed out, which is what
 * makes the card fall back to describing the path's shape instead of progress.
 */
export const buildPathCardItems = (
  paths: readonly LearningPath[],
  lang: string,
  categoryDict: PlaygroundDict["category"],
  completed: ReadonlySet<string> | null
): readonly PathCardItem[] =>
  paths.map((path) => {
    const trackMeta = CHALLENGE_TRACKS.find((track) => track.colorToken === path.track)
    return {
      href: localizedHref(lang, `/paths/${path.slug}`),
      title: path.title,
      description: path.lead,
      track: path.track,
      trackLabel: trackMeta !== undefined ? categoryDict[trackMeta.category] : path.track,
      icon: getChallengeIcon(trackMeta?.iconName),
      steps: flattenSteps(path).map((step) => ({
        type: step.type,
        completed: step.type === "doc" || completed === null ? null : completed.has(step.slug),
      })),
    }
  })

/** Every challenge slug across a set of paths — the progress query's input. */
export const challengeSlugsAcross = (paths: readonly LearningPath[]): readonly string[] =>
  paths.flatMap((path) =>
    flattenSteps(path)
      .filter((step) => step.type === "challenge")
      .map((step) => step.slug)
  )
