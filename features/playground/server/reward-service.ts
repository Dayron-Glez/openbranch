import type { createClient } from "@/lib/supabase/server"
import { CHALLENGE_TRACKS } from "../domain/manifest"
import { formatElapsed } from "../domain/format-elapsed"
import { getLeaderboard } from "./leaderboard-service"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Default awarded by the DB trigger when a slug is missing from the catalog. */
const FALLBACK_POINTS = 10

export type StreakEffect = "started" | "extended" | "unchanged"

export type CompletionReward = {
  readonly isFirstCompletion: boolean
  readonly pointsEarned: number
  readonly totalPointsBefore: number
  readonly totalPointsAfter: number
  readonly streakEffect: StreakEffect
  readonly currentStreak: number
  readonly firstRunElapsedDisplay: string | null
  readonly rank: number | null
  readonly badgeNewlyEarned: boolean
}

const getElapsedDisplay = (startedAt: string | null, completedAt: string | null): string | null => {
  if (startedAt === null || completedAt === null) return null
  const elapsedSeconds = Math.max(
    0,
    Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  )
  return formatElapsed(elapsedSeconds)
}

/**
 * Loads what a just-completed challenge session earned, purely by re-reading
 * current DB state (no data passed through the completion redirect) — the
 * same idempotent-derivation approach as Surfaces 1 & 2. Returns null on any
 * critical query error: the result page simply hides the reward row and
 * keeps working exactly as it does today.
 */
export const getCompletionReward = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<CompletionReward | null> => {
  const [sessionsResult, challengeResult, statsResult] = await Promise.all([
    // No `lang` filter — mirrors the DB trigger's own guard, which keys only
    // on user_id + challenge_slug, regardless of which locale a session ran in.
    supabase
      .from("challenge_sessions")
      .select("started_at, completed_at")
      .eq("user_id", userId)
      .eq("challenge_slug", slug)
      .eq("status", "completed")
      .order("completed_at", { ascending: true }),
    supabase.from("challenges").select("points").eq("slug", slug).maybeSingle(),
    supabase
      .from("user_stats")
      .select("total_points, current_streak")
      .eq("user_id", userId)
      .maybeSingle(),
  ])

  const failed = [sessionsResult, challengeResult, statsResult].find(
    (result) => result.error !== null
  )
  if (failed !== undefined) {
    console.error("getCompletionReward: query failed", failed.error)
    return null
  }

  const sessions = sessionsResult.data ?? []
  const isFirstCompletion = sessions.length === 1
  const firstSession = sessions[0] ?? null
  const firstRunElapsedDisplay = isFirstCompletion
    ? null
    : getElapsedDisplay(
        (firstSession?.started_at as string | null) ?? null,
        (firstSession?.completed_at as string | null) ?? null
      )

  const points = (challengeResult.data?.points as number | undefined) ?? FALLBACK_POINTS
  const pointsEarned = isFirstCompletion ? points : 0

  const totalPointsAfter = (statsResult.data?.total_points as number | undefined) ?? 0
  const totalPointsBefore = totalPointsAfter - pointsEarned
  const currentStreak = (statsResult.data?.current_streak as number | undefined) ?? 0

  const getStreakEffect = (): StreakEffect => {
    if (!isFirstCompletion) return "unchanged"
    return currentStreak > 1 ? "extended" : "started"
  }

  // Non-critical: a failure here just hides the rank chip.
  const leaderboard = await getLeaderboard(supabase, userId)
  const rank = leaderboard?.ownRank ?? null

  // Non-critical: mirrors awardTrackBadge's own award condition — if this
  // session is the only completed one in its track, the badge was just earned.
  const track = CHALLENGE_TRACKS.find((t) => slug.startsWith(t.slugPrefix))
  let badgeNewlyEarned = false
  if (track !== undefined) {
    const { count, error } = await supabase
      .from("challenge_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")
      .like("challenge_slug", `${track.slugPrefix}%`)
    if (error !== null) {
      console.error("getCompletionReward: badge check failed", error)
    } else {
      badgeNewlyEarned = count === 1
    }
  }

  return {
    isFirstCompletion,
    pointsEarned,
    totalPointsBefore,
    totalPointsAfter,
    streakEffect: getStreakEffect(),
    currentStreak,
    firstRunElapsedDisplay,
    rank,
    badgeNewlyEarned,
  }
}
