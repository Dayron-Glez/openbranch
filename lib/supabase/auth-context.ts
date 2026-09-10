import { createClient } from "./server"

/**
 * Lives here rather than beside the actions: a "use server" module can only
 * export async functions, so the actions files cannot share a helper.
 */
export const getAuthContext = async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}
