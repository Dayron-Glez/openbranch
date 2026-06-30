import type { createClient } from "@/lib/supabase/server"
import { CHALLENGE_TRACKS } from "../domain/manifest"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export const ensureSession = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string,
  lang: string
): Promise<void> => {
  const { data: existing } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .maybeSingle()

  if (existing !== null) return

  await supabase.from("challenge_sessions").insert({
    user_id: userId,
    challenge_slug: slug,
    lang,
    status: "in_progress",
  })
}

export const saveSnapshot = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string,
  snapshot: Record<string, unknown>
): Promise<void> => {
  await supabase
    .from("challenge_sessions")
    .update({ snapshot })
    .eq("user_id", userId)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const getInProgressSnapshot = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<unknown> => {
  const { data } = await supabase
    .from("challenge_sessions")
    .select("snapshot")
    .eq("user_id", userId)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .maybeSingle()
  return data?.snapshot ?? null
}

export const markSessionCompleted = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string,
  lang: string
): Promise<boolean> => {
  const { data } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  return (data?.length ?? 0) > 0
}

/**
 * Awards the track badge for the given slug if the user has completed at least
 * one challenge in that track and does not already hold the badge.
 * Badge key and slug prefix are resolved from CHALLENGE_TRACKS (domain/manifest).
 */
export const awardTrackBadge = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<void> => {
  const track = CHALLENGE_TRACKS.find((t) => slug.startsWith(t.slugPrefix))
  if (track === undefined) return

  const { badgeKey, slugPrefix } = track

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge", badgeKey)
    .maybeSingle()

  if (existingBadge !== null) return

  const { data: completedInTrack } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .like("challenge_slug", `${slugPrefix}%`)

  if ((completedInTrack?.length ?? 0) >= 1) {
    await supabase.from("user_badges").insert({ user_id: userId, badge: badgeKey })
  }
}
