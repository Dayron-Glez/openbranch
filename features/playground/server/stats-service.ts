import type { createClient } from "@/lib/supabase/server"
import { CATEGORY_ORDER, CHALLENGE_TRACKS, type CategoryKey } from "../domain/manifest"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** Default awarded by the DB trigger when a slug is missing from the catalog. */
const FALLBACK_POINTS = 10

export type EngagementStats = {
  readonly totalPoints: number
  readonly pointsToday: number
  readonly completedCount: number
  /** Streak already normalized: 0 unless the last completion was today or yesterday (UTC). */
  readonly currentStreak: number
  readonly bestStreak: number
  readonly streakState: "alive" | "broken" | "none"
  /** Last completion date (UTC, `YYYY-MM-DD`); null when nothing is completed yet. */
  readonly lastCompletedOn: string | null
  /** Distinct tracks with at least one completed challenge. */
  readonly tracksStarted: number
  /** First category (in display order) with no completions; null when every track is started. */
  readonly nextTrack: CategoryKey | null
}

const EMPTY_STATS: EngagementStats = {
  totalPoints: 0,
  pointsToday: 0,
  completedCount: 0,
  currentStreak: 0,
  bestStreak: 0,
  streakState: "none",
  lastCompletedOn: null,
  tracksStarted: 0,
  nextTrack: CATEGORY_ORDER[0],
}

const toUtcDay = (isoTimestamp: string): string => isoTimestamp.slice(0, 10)

const previousUtcDay = (utcDay: string): string => {
  const date = new Date(`${utcDay}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

const inferCategory = (slug: string): CategoryKey | null =>
  CHALLENGE_TRACKS.find((track) => slug.startsWith(track.slugPrefix))?.category ?? null

/**
 * Points earned today (UTC): sum of catalog points over slugs whose FIRST
 * completion happened today — mirrors the DB's first-completion-only rule,
 * so repeats never light up the delta chip.
 */
const sumPointsEarnedToday = (
  completions: ReadonlyMap<string, string>,
  pointsBySlug: ReadonlyMap<string, number>,
  today: string
): number => {
  let sum = 0
  for (const [slug, firstCompletedDay] of completions) {
    if (firstCompletedDay !== today) continue
    sum += pointsBySlug.get(slug) ?? FALLBACK_POINTS
  }
  return sum
}

/**
 * Loads user_stats and derives the display-ready engagement numbers for the
 * hub strip. Returns null on any query error — the strip must never break
 * the hub, callers simply skip rendering it.
 */
export const getEngagementStats = async (
  supabase: SupabaseServerClient,
  userId: string
): Promise<EngagementStats | null> => {
  const [statsResult, sessionsResult, catalogResult] = await Promise.all([
    supabase
      .from("user_stats")
      .select("total_points, completed_count, current_streak, best_streak, last_completed_on")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("challenge_sessions")
      .select("challenge_slug, completed_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("completed_at", "is", null),
    supabase.from("challenges").select("slug, points"),
  ])

  const failed = [statsResult, sessionsResult, catalogResult].find(
    (result) => result.error !== null
  )
  if (failed !== undefined) {
    console.error("getEngagementStats: query failed", failed.error)
    return null
  }

  const stats = statsResult.data
  if (stats === null) return EMPTY_STATS

  const firstCompletionBySlug = new Map<string, string>()
  for (const session of sessionsResult.data ?? []) {
    const slug = session.challenge_slug as string
    const day = toUtcDay(session.completed_at as string)
    const existing = firstCompletionBySlug.get(slug)
    if (existing === undefined || day < existing) firstCompletionBySlug.set(slug, day)
  }

  const pointsBySlug = new Map<string, number>()
  for (const challenge of catalogResult.data ?? []) {
    pointsBySlug.set(challenge.slug as string, challenge.points as number)
  }

  const startedCategories = new Set<CategoryKey>()
  for (const slug of firstCompletionBySlug.keys()) {
    const category = inferCategory(slug)
    if (category !== null) startedCategories.add(category)
  }

  const today = toUtcDay(new Date().toISOString())
  const yesterday = previousUtcDay(today)
  const lastCompletedOn = stats.last_completed_on as string | null

  const streakAlive =
    lastCompletedOn !== null && (lastCompletedOn === today || lastCompletedOn === yesterday)

  const getStreakState = (): EngagementStats["streakState"] => {
    if (streakAlive) return "alive"
    return lastCompletedOn === null ? "none" : "broken"
  }

  return {
    totalPoints: stats.total_points as number,
    pointsToday: sumPointsEarnedToday(firstCompletionBySlug, pointsBySlug, today),
    completedCount: stats.completed_count as number,
    currentStreak: streakAlive ? (stats.current_streak as number) : 0,
    bestStreak: stats.best_streak as number,
    streakState: getStreakState(),
    lastCompletedOn,
    tracksStarted: startedCategories.size,
    nextTrack: CATEGORY_ORDER.find((category) => !startedCategories.has(category)) ?? null,
  }
}
