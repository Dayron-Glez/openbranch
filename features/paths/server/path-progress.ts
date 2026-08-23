import type { createClient } from "@/lib/supabase/server"
import { challengeSlugsOf, flattenSteps, type LearningPath } from "../domain/paths"
import type { PathProgress } from "../domain/path-status"
import { getReadDocSlugs } from "./doc-reads"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Default awarded by the DB trigger when a slug is missing from the catalog. */
const FALLBACK_POINTS = 10

/**
 * Which of a set of challenge slugs the signed-in user has completed.
 * Doc steps have no equivalent signal — see specs/learning-paths-v1.md Q3.
 */
export const getCompletedChallengeSlugs = async (
  supabase: SupabaseServerClient,
  userId: string,
  challengeSlugs: readonly string[]
): Promise<ReadonlySet<string>> => {
  if (challengeSlugs.length === 0) return new Set()

  const { data, error } = await supabase
    .from("challenge_sessions")
    .select("challenge_slug")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("challenge_slug", challengeSlugs)

  if (error !== null) {
    console.error("getCompletedChallengeSlugs: failed to load completed challenges", error)
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.challenge_slug as string))
}

/** Progress for a single path's challenge steps. */
export const getPathProgress = (
  supabase: SupabaseServerClient,
  userId: string,
  path: LearningPath
): Promise<ReadonlySet<string>> =>
  getCompletedChallengeSlugs(supabase, userId, challengeSlugsOf(path))

const docSlugsOf = (paths: readonly LearningPath[]): readonly string[] =>
  paths.flatMap((path) =>
    flattenSteps(path)
      .filter((step) => step.type === "doc")
      .map((step) => step.slug)
  )

/**
 * Both halves of a path's progress in one call. Every surface that renders a
 * path needs both sets, and fetching them separately at each call site is how
 * the two drift apart.
 */
export const loadPathProgress = async (
  supabase: SupabaseServerClient,
  userId: string,
  paths: readonly LearningPath[]
): Promise<PathProgress> => {
  const challengeSlugs = paths.flatMap((path) => challengeSlugsOf(path))
  const [completedChallengeSlugs, readDocSlugs] = await Promise.all([
    getCompletedChallengeSlugs(supabase, userId, challengeSlugs),
    getReadDocSlugs(supabase, userId, docSlugsOf(paths)),
  ])
  return { completedChallengeSlugs, readDocSlugs }
}

/** Points per challenge slug, for the step meta chip (e.g. "+30 pts"). */
export const getChallengePoints = async (
  supabase: SupabaseServerClient,
  challengeSlugs: readonly string[]
): Promise<ReadonlyMap<string, number>> => {
  if (challengeSlugs.length === 0) return new Map()

  const { data, error } = await supabase
    .from("challenges")
    .select("slug, points")
    .in("slug", challengeSlugs)

  if (error !== null) {
    console.error("getChallengePoints: failed to load points", error)
    return new Map()
  }

  const points = new Map<string, number>()
  for (const slug of challengeSlugs) points.set(slug, FALLBACK_POINTS)
  for (const row of data ?? []) points.set(row.slug as string, row.points as number)
  return points
}
