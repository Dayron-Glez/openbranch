import type { MetadataRoute } from "next"
import { i18n } from "@/lib/i18n"
import { source } from "@/lib/source"
import { playgroundSource } from "@/lib/playground-source"
import { canonicalUrl, docsPath } from "@/lib/seo"
import { createAnonClient } from "@/lib/supabase/anon"
import { getAllPaths } from "@/features/paths/server/path-catalog"

// Profiles come from the database, so the sitemap cannot be fully static.
// An hour is short enough that a new profile is picked up the same day and
// long enough that crawling never drives real query volume.
export const revalidate = 3600

type PageWithLastModified = { lastModified?: Date }

/**
 * Usernames of every public profile. A failure here returns nothing rather than
 * throwing: a sitemap missing the profile section is a far smaller problem than
 * a build or a revalidation that fails because Supabase was briefly unreachable.
 */
const getProfileUsernames = async (): Promise<string[]> => {
  try {
    const supabase = createAnonClient()
    const { data, error } = await supabase.from("profile_overview").select("username")
    if (error !== null || data === null) return []
    return data
      .map((row) => row.username)
      .filter((username): username is string => username !== null)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const usernames = await getProfileUsernames()

  // `changeFrequency` and `priority` are deliberately absent: search engines
  // ignore both, and a hardcoded guess is one more thing to drift.
  return i18n.languages.flatMap((lang) => {
    const url = (path: string): string => canonicalUrl(lang, path)

    const docs = source.getPages(lang).map((page) => ({
      url: canonicalUrl(lang, docsPath(page.slugs)),
      lastModified: (page.data as PageWithLastModified).lastModified,
    }))

    const challenges = playgroundSource
      .getPages(lang)
      .filter((page) => page.data.maturity === "stable")
      .map((page) => ({ url: url(`/playground/${page.slugs[0]}`) }))

    const paths = getAllPaths(lang).map((path) => ({ url: url(`/paths/${path.slug}`) }))

    return [
      { url: url("/") },
      { url: url("/paths") },
      { url: url("/playground") },
      { url: url("/playground/leaderboard") },
      ...docs,
      ...paths,
      ...challenges,
      ...usernames.map((username) => ({ url: url(`/u/${username}`) })),
    ]
  })
}
