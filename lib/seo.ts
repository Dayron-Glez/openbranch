import type { Metadata } from "next"
import { SITE_TAGLINE, SITE_URL } from "./constants"
import { i18n } from "./i18n"
import { localizedHref } from "./landing-dictionary"
import { appName, OG_HEIGHT, OG_WIDTH, siteImageRoute } from "./shared"

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
const alternatesFor = (lang: string, path: string): Metadata["alternates"] => ({
  canonical: canonicalUrl(lang, path),
  languages: {
    ...Object.fromEntries(i18n.languages.map((code) => [code, canonicalUrl(code, path)])),
    "x-default": canonicalUrl(i18n.defaultLanguage, path),
  },
})

/** Route of a docs page from its slug segments; the index page has none. */
export const docsPath = (slugs: readonly string[] | undefined): string =>
  slugs === undefined || slugs.length === 0 ? "/docs" : `/docs/${slugs.join("/")}`

/**
 * An `og:image` with its dimensions declared, which is the difference between a
 * large card and a thumbnail.
 *
 * A bare URL leaves a scraper to work the size out by fetching the file, and
 * the ones that will not wait for that fall back to their small layout —
 * LinkedIn stored our 1200×630 card as a 160px rendition and upscaled it.
 * Declaring width and height lets it pick the right format up front.
 */
export const ogImage = (
  url: string,
  alt: string
): { url: string; width: number; height: number; alt: string; type: string } => ({
  url,
  width: OG_WIDTH,
  height: OG_HEIGHT,
  alt,
  type: "image/png",
})

/**
 * The canonical, the hreflang set and `og:url` for one route, together.
 *
 * They are three statements of the same fact, and the only way they stay in
 * agreement is by being written once: a page whose `og:url` and canonical point
 * at different addresses is telling a crawler and a social scraper two
 * different things about where it lives.
 *
 * It carries the rest of the card as well, because Next merges metadata
 * shallowly between segments: a `generateMetadata` that returns `openGraph` at
 * all discards every field the root layout declared under that key rather than
 * merging into it. Naming them here is what keeps the site name, the type and
 * the card from vanishing off any page that states its own `og:url`.
 *
 * `openGraph` spreads last, so a page that renders its own card still wins.
 */
export const seoFor = (
  lang: string,
  path: string,
  openGraph: NonNullable<Metadata["openGraph"]> = {}
): Pick<Metadata, "alternates" | "openGraph"> => ({
  alternates: alternatesFor(lang, path),
  openGraph: {
    type: "website",
    siteName: appName,
    images: ogImage(siteImageRoute, `${appName} — ${SITE_TAGLINE}`),
    url: canonicalUrl(lang, path),
    ...openGraph,
  },
})
