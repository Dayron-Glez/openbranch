import type { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type LeaderboardRow = {
  readonly rank: number
  readonly username: string
  readonly avatarUrl: string | null
  readonly totalPoints: number
  readonly completedCount: number
  readonly bestStreak: number
}

export type LeaderboardData = {
  readonly rows: readonly LeaderboardRow[]
  /** Rank of the signed-in user, or null when signed out or not on the board. */
  readonly ownRank: number | null
}

/**
 * The board has single-digit users at launch; pagination is a documented
 * non-goal until it approaches this cap.
 */
const MAX_ROWS = 100

/**
 * Loads the public leaderboard view and resolves the signed-in user's rank.
 * Rank is the row index + 1 — the view exposes no rank column. Returns null
 * on any query error: callers render a quiet error line, never a broken page
 * and never the misleading empty state.
 */
export const getLeaderboard = async (
  supabase: SupabaseServerClient,
  userId: string | null
): Promise<LeaderboardData | null> => {
  const [boardResult, ownUserResult] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("username, avatar_url, total_points, completed_count, best_streak")
      .order("total_points", { ascending: false })
      .order("completed_count", { ascending: false })
      .limit(MAX_ROWS),
    userId === null
      ? Promise.resolve(null)
      : supabase.from("users").select("username").eq("id", userId).maybeSingle(),
  ])

  if (boardResult.error !== null) {
    console.error("getLeaderboard: board query failed", boardResult.error)
    return null
  }
  if (ownUserResult !== null && ownUserResult.error !== null) {
    console.error("getLeaderboard: own user lookup failed", ownUserResult.error)
    return null
  }

  const rows: LeaderboardRow[] = (boardResult.data ?? []).map((row, index) => ({
    rank: index + 1,
    username: row.username as string,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    totalPoints: row.total_points as number,
    completedCount: row.completed_count as number,
    bestStreak: row.best_streak as number,
  }))

  // The public view exposes no user_id by design, so the signed-in user's row
  // is matched by username — unique upstream on GitHub and refreshed on login.
  const ownUsername = (ownUserResult?.data?.username as string | undefined) ?? null
  const ownRank =
    ownUsername === null ? null : (rows.find((row) => row.username === ownUsername)?.rank ?? null)

  return { rows, ownRank }
}
