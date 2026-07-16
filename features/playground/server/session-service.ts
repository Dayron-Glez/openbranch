import type { createClient } from "@/lib/supabase/server"
import { CHALLENGE_TRACKS } from "../domain/manifest"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

const UNIQUE_VIOLATION = "23505"

export const ensureSession = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string,
  lang: string
): Promise<void> => {
  const { error } = await supabase.from("challenge_sessions").insert({
    user_id: userId,
    challenge_slug: slug,
    lang,
    status: "in_progress",
  })

  // A unique violation on the partial index means an in-progress session
  // already exists — exactly the desired end state, so it is not an error.
  if (error !== null && error.code !== UNIQUE_VIOLATION) {
    console.error("ensureSession: failed to create session", error)
  }
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
 * one challenge in that track. The upsert ignores duplicates, so holding the
 * badge already is a no-op. Badge key and slug prefix are resolved from
 * CHALLENGE_TRACKS (domain/manifest).
 */
export const awardTrackBadge = async (
  supabase: SupabaseServerClient,
  userId: string,
  slug: string
): Promise<void> => {
  const track = CHALLENGE_TRACKS.find((t) => slug.startsWith(t.slugPrefix))
  if (track === undefined) return

  const { badgeKey, slugPrefix } = track

  const { data: completedInTrack, error: completedError } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .like("challenge_slug", `${slugPrefix}%`)
    .limit(1)

  if (completedError !== null) {
    console.error("awardTrackBadge: failed to check completed challenges", completedError)
    return
  }

  if ((completedInTrack?.length ?? 0) === 0) return

  const { error: upsertError } = await supabase
    .from("user_badges")
    .upsert(
      { user_id: userId, badge: badgeKey },
      { onConflict: "user_id,badge", ignoreDuplicates: true }
    )

  if (upsertError !== null) {
    console.error("awardTrackBadge: failed to award badge", upsertError)
  }
}
