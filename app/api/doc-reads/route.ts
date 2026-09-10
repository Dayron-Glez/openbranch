import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/supabase/auth-context"
import { getReadDocSlugs } from "@/features/paths/server/doc-reads"

/**
 * A route handler rather than the browser Supabase client: `createBrowserClient`
 * starts its own token-refresh loop, and running one on every docs page
 * alongside the refresh `proxy.ts` already performs invites intermittent
 * sign-outs. It also keeps data access server-side, as everywhere else here.
 */
export const GET = async (): Promise<NextResponse> => {
  const { supabase, user } = await getAuthContext()

  if (user === null) {
    return NextResponse.json(
      { signedIn: false, readSlugs: [] },
      { headers: { "Cache-Control": "private, no-store" } }
    )
  }

  const readSlugs = await getReadDocSlugs(supabase, user.id)

  // private, no-store: a shared cache must never hand one reader's set to another.
  return NextResponse.json(
    { signedIn: true, readSlugs: [...readSlugs] },
    { headers: { "Cache-Control": "private, no-store" } }
  )
}
