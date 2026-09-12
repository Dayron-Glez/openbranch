import { createServerClient } from "@supabase/ssr"

/**
 * Server-side client with no cookie access, for reading public data outside a
 * request (the sitemap). `createClient` in ./server reads `cookies()`, which
 * opts the caller out of static rendering and revalidation.
 */
export const createAnonClient = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
