import type { createClient } from "@/lib/supabase/server"
import type { LearningPath } from "@/features/paths/domain/paths"
import type { PathProgress } from "@/features/paths/domain/path-status"
import { challengeSlugsAcross, docSlugsAcross } from "@/features/paths/server/path-cards"
import { resolveEarnedBadges } from "@/features/playground/domain/manifest"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * Reads for a public profile, keyed by username rather than by user id.
 *
 * Every query here hits an object created in the public-profiles migration —
 * views and functions that bypass RLS on a deliberately narrow surface — never
 * a base table. `user_stats`, `user_badges`, `challenge_sessions` and
 * `doc_reads` remain select-own, so pointing any of these at a base table
 * would silently return empty rather than fail, which is exactly the bug the
 * separate surface exists to prevent.
 *
 * Same convention as the other services: the client comes in as the first
 * argument, failures are logged and degraded rather than thrown, so one bad
 * query costs a section and not the page.
 */

export type ProfileOverview = {
  readonly username: string
  readonly avatarUrl: string | null
  /** `users.created_at` is nullable — it predates the not-null convention. */
  readonly memberSince: string | null
  readonly totalPoints: number
  readonly completedCount: number
  readonly currentStreak: number
  readonly bestStreak: number
  readonly lastCompletedOn: string | null
}

export type ProfileRank = {
  readonly rank: number
  readonly totalRanked: number
}

export type ProfileActivityEntry = {
  readonly challengeSlug: string
  /** Track category, for the row's coloured dot. Null if off-catalog. */
  readonly category: string | null
  readonly completedAt: string
  readonly points: number
}

/**
 * Identity and headline numbers, or null when no such user exists.
 *
 * A query failure also returns null and therefore 404s. That is a deliberate
 * simplification: the alternative is a distinct error state for a page whose
 * every section is already degrading independently, and a transient 404 reads
 * better than a shell with five empty sections.
 */
export const getProfileOverview = async (
  supabase: SupabaseServerClient,
  username: string
): Promise<ProfileOverview | null> => {
  const { data, error } = await supabase
    .from("profile_overview")
    .select(
      "username, avatar_url, created_at, total_points, completed_count, current_streak, best_streak, last_completed_on"
    )
    .eq("username", username)
    .maybeSingle()

  if (error !== null) {
    console.error("getProfileOverview: failed to load profile", error)
    return null
  }
  if (data === null) return null

  return {
    username: data.username as string,
    avatarUrl: (data.avatar_url as string | null) ?? null,
    memberSince: (data.created_at as string | null) ?? null,
    totalPoints: data.total_points as number,
    completedCount: data.completed_count as number,
    currentStreak: data.current_streak as number,
    bestStreak: data.best_streak as number,
    lastCompletedOn: (data.last_completed_on as string | null) ?? null,
  }
}

const getProfilePersistedBadges = async (
  supabase: SupabaseServerClient,
  username: string
): Promise<ReadonlySet<string>> => {
  const { data, error } = await supabase
    .from("profile_badges")
    .select("badge")
    .eq("username", username)

  if (error !== null) {
    console.error("getProfileBadges: failed to load badges", error)
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.badge as string))
}

/**
 * Every completion, newest first. The view already collapses replays to one
 * row per challenge, so this is bounded by the challenge catalogue — six today
 * — not by how much someone has played.
 *
 * Unbounded on purpose: the profile needs the newest few for the activity feed
 * *and* the distinct tracks across all of them for the summary, and paying for
 * one small query beats two. Worth a limit if the catalogue ever grows large.
 */
export const getProfileActivity = async (
  supabase: SupabaseServerClient,
  username: string
): Promise<readonly ProfileActivityEntry[]> => {
  const { data, error } = await supabase
    .from("profile_activity")
    .select("challenge_slug, category, completed_at, points")
    .eq("username", username)
    .order("completed_at", { ascending: false })

  if (error !== null) {
    console.error("getProfileActivity: failed to load activity", error)
    return []
  }

  return (data ?? []).map((row) => ({
    challengeSlug: row.challenge_slug as string,
    category: (row.category as string | null) ?? null,
    completedAt: row.completed_at as string,
    points: row.points as number,
  }))
}

export const getProfileActivityAndBadges = async (
  supabase: SupabaseServerClient,
  username: string
): Promise<{
  readonly activity: readonly ProfileActivityEntry[]
  readonly earnedBadges: ReadonlySet<string>
}> => {
  const [persistedBadges, activity] = await Promise.all([
    getProfilePersistedBadges(supabase, username),
    getProfileActivity(supabase, username),
  ])

  return {
    activity,
    earnedBadges: resolveEarnedBadges({
      completedChallengeSlugs: activity.map((entry) => entry.challengeSlug),
      persistedBadges,
    }),
  }
}

/**
 * Rank among users with at least one completion, or null when this user has
 * none. Null is the real answer, not a failure: the design suppresses the rank
 * entirely for a profile with nothing earned rather than showing a last place.
 */
export const getProfileRank = async (
  supabase: SupabaseServerClient,
  username: string
): Promise<ProfileRank | null> => {
  const { data, error } = await supabase.rpc("profile_rank", { p_username: username })

  if (error !== null) {
    console.error("getProfileRank: failed to load rank", error)
    return null
  }

  const row = (data as readonly { rank: number; total_ranked: number }[] | null)?.[0]
  if (row === undefined) return null

  return { rank: row.rank, totalRanked: row.total_ranked }
}

/**
 * Path progress for an arbitrary user, shaped so it drops straight into
 * `buildPathCardItems` — that function already takes progress as an argument
 * and never touches `auth`, so nothing about it assumes the viewer.
 *
 * The slugs to check are sent to the function rather than fetched from it: the
 * surface deliberately cannot answer "what has this person read", only "of
 * these path steps, which are done".
 */
export const getProfilePathProgress = async (
  supabase: SupabaseServerClient,
  username: string,
  paths: readonly LearningPath[]
): Promise<PathProgress> => {
  const empty: PathProgress = { completedChallengeSlugs: new Set(), readDocSlugs: new Set() }

  const docSlugs = docSlugsAcross(paths)
  const challengeSlugs = challengeSlugsAcross(paths)
  if (docSlugs.length === 0 && challengeSlugs.length === 0) return empty

  const { data, error } = await supabase.rpc("profile_path_progress", {
    p_username: username,
    p_doc_slugs: docSlugs,
    p_challenge_slugs: challengeSlugs,
  })

  if (error !== null) {
    console.error("getProfilePathProgress: failed to load path progress", error)
    return empty
  }

  const rows = (data as readonly { kind: string; slug: string }[] | null) ?? []
  const completedChallengeSlugs = new Set<string>()
  const readDocSlugs = new Set<string>()
  for (const row of rows) {
    if (row.kind === "doc") readDocSlugs.add(row.slug)
    else completedChallengeSlugs.add(row.slug)
  }

  return { completedChallengeSlugs, readDocSlugs }
}
