import { createClient } from "./server"

/**
 * The client plus the signed-in user, in one await. Every server action starts
 * this way. It lives here rather than beside the actions because a "use server"
 * module can only export async functions, so the actions files cannot share a
 * helper between themselves.
 */
export const getAuthContext = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}
