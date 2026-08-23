import type { createClient } from "@/lib/supabase/server"
import { CHALLENGE_TRACKS, type BadgeKey } from "../domain/manifest"
import { formatElapsed } from "../domain/format-elapsed"
import { getLeaderboard } from "./leaderboard-service"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Default awarded by the DB trigger when a slug is missing from the catalog. */
const FALLBACK_POINTS = 10

/** Mirrors session-service.ts's own award threshold — see `awardMilestoneBadges`. */
const STREAK_BADGE_THRESHOLD = 7

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
  /** The specific badge this completion just earned, across all 7 keys — null on a repeat or when nothing was newly earned. */
  readonly newlyEarnedBadgeKey: BadgeKey | null
}

const getElapsedDisplay = (startedAt: string | null, completedAt: string | null): string | null => {
  if (startedAt === null || completedAt === null) return null
  const elapsedSeconds = Math.max(
    0,
    Math.floor((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000)
  )
  return formatElapsed(elapsedSeconds)
}

/** The track badge, if this completion is the first one in its track. */
const detectTrackBadge = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<BadgeKey | null> => {
  const track = CHALLENGE_TRACKS.find((t) => slug.startsWith(t.slugPrefix))
  if (track === undefined) return null

  const { count, error } = await supabase
    .from("challenge_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")
    .like("challenge_slug", `${track.slugPrefix}%`)

  if (error !== null) {
    console.error("getCompletionReward: track badge check failed", error)
    return null
  }
  // Safe: ChallengeTrackMeta.badgeKey stays a plain string (it's the domain
  // model CHALLENGE_TRACKS is built from) even though its values are exactly
  // 5 of BadgeKey's 7 literals.
  return count === 1 ? (track.badgeKey as BadgeKey) : null
}

/** `all-tracks`, if this completion is what closed the last open track. */
const detectAllTracksBadge = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<BadgeKey | null> => {
  const { data: completedSlugs, error } = await supabase
    .from("challenge_sessions")
    .select("challenge_slug")
    .eq("user_id", userId)
    .eq("status", "completed")

  if (error !== null) {
    console.error("getCompletionReward: all-tracks check failed", error)
    return null
  }

  const categoriesFor = (
    rows: readonly { challenge_slug: unknown }[],
    excludeSlug: string | null
  ) =>
    new Set(
      rows
        .map((row) => row.challenge_slug as string)
        .filter((completedSlug) => completedSlug !== excludeSlug)
        .map((completedSlug) =>
          CHALLENGE_TRACKS.find((t) => completedSlug.startsWith(t.slugPrefix))
        )
        .filter((track) => track !== undefined)
        .map((track) => track.category)
    )

  const rows = completedSlugs ?? []
  const coveredNow = categoriesFor(rows, null).size === CHALLENGE_TRACKS.length
  const coveredBefore = categoriesFor(rows, slug).size === CHALLENGE_TRACKS.length
  return coveredNow && !coveredBefore ? "all-tracks" : null
}

/**
 * Mirrors awardTrackBadge's/awardMilestoneBadges' own award conditions,
 * read-only. Stops at the first match, since in practice only one badge
 * becomes newly earned by any single completion.
 */
const detectNewlyEarnedBadge = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string,
  currentStreak: number
): Promise<BadgeKey | null> => {
  const trackBadge = await detectTrackBadge(supabase, userId, slug)
  if (trackBadge !== null) return trackBadge
  if (currentStreak === STREAK_BADGE_THRESHOLD) return "streak-7"
  return detectAllTracksBadge(supabase, userId, slug)
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

  // Non-critical. A repeat completion can never newly earn anything, so this
  // only runs on a first completion.
  const newlyEarnedBadgeKey = isFirstCompletion
    ? await detectNewlyEarnedBadge(supabase, userId, slug, currentStreak)
    : null

  return {
    isFirstCompletion,
    pointsEarned,
    totalPointsBefore,
    totalPointsAfter,
    streakEffect: getStreakEffect(),
    currentStreak,
    firstRunElapsedDisplay,
    rank,
    newlyEarnedBadgeKey,
  }
}
