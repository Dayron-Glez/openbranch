import { SITE_URL } from "./constants"
import { localizedHref } from "./landing-dictionary"

/**
 * Absolute URL for a route, in the given locale. Canonical tags and sitemap
 * entries must be absolute — a relative one is resolved against whichever
 * hostname served the page, which defeats the point when two hostnames answer.
 */
export const canonicalUrl = (lang: string, path: string): string => {
  const localized = localizedHref(lang, path)
  // `localizedHref(en, "/")` yields "/en/", but Next serves that page at "/en".
  // A canonical that points at a URL the site redirects away from is worse than
  // none, so the trailing slash goes — except on the root, which is just "/".
  const normalized = localized.length > 1 ? localized.replace(/\/$/, "") : localized
  return `${SITE_URL}${normalized}`
}

/** Route of a docs page from its slug segments; the index page has none. */
export const docsPath = (slugs: readonly string[] | undefined): string =>
  slugs === undefined || slugs.length === 0 ? "/docs" : `/docs/${slugs.join("/")}`
