import type { Metadata } from "next"
import { SITE_URL } from "./constants"
import { i18n } from "./i18n"
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

/**
 * The canonical plus the hreflang set for one route, for `metadata.alternates`.
 *
 * Every locale's page declares the whole set, itself included, because the
 * annotation is only honoured when it is reciprocal: if `es` names `en` but
 * `en` does not name `es` back, search engines discard it wholesale. Building
 * both sides from the same list is what keeps that true.
 *
 * `x-default` is the fallback for a visitor whose language matches none of
 * them, which is the locale the site serves unprefixed.
 *
 * Safe only while both translations exist for every route — they do, and the
 * pairing is enforced by the content living in `*.es.mdx`/`*.en.mdx` siblings.
 */
export const alternatesFor = (lang: string, path: string): Metadata["alternates"] => ({
  canonical: canonicalUrl(lang, path),
  languages: {
    ...Object.fromEntries(i18n.languages.map((code) => [code, canonicalUrl(code, path)])),
    "x-default": canonicalUrl(i18n.defaultLanguage, path),
  },
})

/** Route of a docs page from its slug segments; the index page has none. */
export const docsPath = (slugs: readonly string[] | undefined): string =>
  slugs === undefined || slugs.length === 0 ? "/docs" : `/docs/${slugs.join("/")}`
