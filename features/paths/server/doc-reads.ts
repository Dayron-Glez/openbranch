import type { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

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
 * One entry point taking the desired state, so the caller can serialise
 * mutations and always send the latest intent. `ignoreDuplicates` keeps `lang`
 * meaning "locale of first read".
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
