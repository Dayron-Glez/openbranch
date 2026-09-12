import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/constants"

/**
 * Without this route `/robots.txt` falls through to the `[lang]` segment — the
 * proxy matcher skips any path containing a dot, so the request never reaches
 * the i18n middleware and renders the home page with `lang="robots.txt"` under
 * a 200. A real route shadows the dynamic segment and ends that.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated workspace states and generated assets: nothing to index,
      // and `active` URLs are per-session dead ends for a crawler.
      disallow: ["/api/", "/og/", "/playground/*/active"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
