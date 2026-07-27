"use server"

import { getAuthContext } from "@/lib/supabase/auth-context"
import { source } from "@/lib/source"
import { setDocRead } from "@/features/paths/server/doc-reads"

/**
 * `doc_slug` arrives from the browser and RLS only checks `user_id`, so
 * without this a signed-in user could write unlimited junk slugs into their
 * own rows. There is no catalog table to constrain it — unlike challenges,
 * which need one for points — so the fumadocs source is the source of truth.
 *
 * Section index pages are rejected too: a page listing links to other guides
 * is not something you read, and it never renders the control.
 */
const isTrackableGuide = (docSlug: string, lang: string): boolean => {
  const segments = docSlug.split("/")
  if (segments.length < 2) return false
  return source.getPage(segments, lang) !== undefined
}

export const setGuideRead = async (docSlug: string, lang: string, read: boolean): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  if (!isTrackableGuide(docSlug, lang)) {
    console.warn("setGuideRead: rejected unknown doc slug", docSlug)
    return
  }
  await setDocRead(supabase, user.id, docSlug, lang, read)
}
