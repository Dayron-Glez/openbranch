import type { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * Sibling of `getCompletedChallengeSlugs` in path-progress.ts. Guides had no
 * completion signal until now — see the migration for why that changed.
 *
 * Like every service here: takes the client as its first argument, logs and
 * degrades rather than throwing, so a failed read renders an un-read guide
 * instead of a broken page.
 */
export const getReadDocSlugs = async (
  supabase: SupabaseServerClient,
  userId: string,
  docSlugs?: readonly string[]
): Promise<ReadonlySet<string>> => {
  if (docSlugs?.length === 0) return new Set()

  const query = supabase.from("doc_reads").select("doc_slug").eq("user_id", userId)
  const { data, error } =
    docSlugs === undefined ? await query : await query.in("doc_slug", docSlugs)

  if (error !== null) {
    console.error("getReadDocSlugs: failed to load read guides", error)
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.doc_slug as string))
}

/**
 * One entry point taking the desired state rather than separate mark/unmark
 * calls. The caller can then serialise mutations and always send the latest
 * intent: auto-marking fires an insert, and an un-mark a moment later must not
 * be able to land before it and leave a surviving row.
 *
 * `ignoreDuplicates` keeps `lang` meaning "locale of first read".
 */
export const setDocRead = async (
  supabase: SupabaseServerClient,
  userId: string,
  docSlug: string,
  lang: string,
  read: boolean
): Promise<void> => {
  if (!read) {
    const { error } = await supabase
      .from("doc_reads")
      .delete()
      .eq("user_id", userId)
      .eq("doc_slug", docSlug)

    if (error !== null) console.error("setDocRead: failed to unmark guide", error)
    return
  }

  const { error } = await supabase
    .from("doc_reads")
    .upsert(
      { user_id: userId, doc_slug: docSlug, lang },
      { onConflict: "user_id,doc_slug", ignoreDuplicates: true }
    )

  if (error !== null) console.error("setDocRead: failed to mark guide as read", error)
}
