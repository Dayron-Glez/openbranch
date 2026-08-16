import type { createClient } from "@/lib/supabase/server"
import { resolveEarnedBadges } from "@/features/playground/domain/manifest"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type SessionStatus = "in_progress" | "completed"

export type UserPlaygroundProgress = {
  readonly slugToStatus: ReadonlyMap<string, SessionStatus>
  readonly earnedBadges: ReadonlySet<string>
}

export const getUserPlaygroundProgress = async (
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserPlaygroundProgress> => {
  const [sessionsResult, badgesResult] = await Promise.all([
    supabase
      .from("challenge_sessions")
      .select("challenge_slug, status")
      .eq("user_id", userId)
      .in("status", ["in_progress", "completed"]),
    supabase.from("user_badges").select("badge").eq("user_id", userId),
  ])

  if (sessionsResult.error !== null) {
    console.error("getUserPlaygroundProgress: failed to load sessions", sessionsResult.error)
  }
  if (badgesResult.error !== null) {
    console.error("getUserPlaygroundProgress: failed to load badges", badgesResult.error)
  }

  const slugToStatus = new Map<string, SessionStatus>()
  const completedChallengeSlugs: string[] = []

  for (const session of sessionsResult.data ?? []) {
    const slug = session.challenge_slug as string
    const status = session.status as SessionStatus
    if (slugToStatus.get(slug) !== "completed") slugToStatus.set(slug, status)
    if (status === "completed") completedChallengeSlugs.push(slug)
  }

  return {
    slugToStatus,
    earnedBadges: resolveEarnedBadges({
      completedChallengeSlugs,
      persistedBadges: (badgesResult.data ?? []).map((row) => row.badge as string),
    }),
  }
}
