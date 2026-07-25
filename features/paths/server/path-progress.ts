import type { createClient } from "@/lib/supabase/server"
import type { LearningPath } from "../domain/paths"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Default awarded by the DB trigger when a slug is missing from the catalog. */
const FALLBACK_POINTS = 10

/**
 * Which of a path's challenge steps the signed-in user has completed.
 * Doc steps have no equivalent signal — see specs/learning-paths-v1.md Q3.
 */
export const getPathProgress = async (
  supabase: SupabaseServerClient,
  userId: string,
  path: LearningPath
): Promise<ReadonlySet<string>> => {
  const challengeSlugs = path.steps
    .filter((s) => s.type === "challenge")
    .map((s) => s.challengeSlug)
  if (challengeSlugs.length === 0) return new Set()

  const { data, error } = await supabase
    .from("challenge_sessions")
    .select("challenge_slug")
    .eq("user_id", userId)
    .eq("status", "completed")
    .in("challenge_slug", challengeSlugs)

  if (error !== null) {
    console.error("getPathProgress: failed to load completed challenges", error)
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.challenge_slug as string))
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
