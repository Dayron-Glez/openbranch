"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const startChallengeSession = async (
  slug: string,
  lang: string,
  activePath: string
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: existing } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("lang", lang)
    .eq("status", "in_progress")
    .maybeSingle()

  if (existing === null) {
    await supabase.from("challenge_sessions").insert({
      user_id: user.id,
      challenge_slug: slug,
      lang,
      status: "in_progress",
    })
  }

  redirect(activePath)
}
