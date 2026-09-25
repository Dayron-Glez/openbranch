import "./global.css"
import "./animations.css"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SITE_AUTHOR, SITE_AUTHOR_URL, SITE_TAGLINE, SITE_URL } from "@/lib/constants"
import { appName, siteImageRoute } from "@/lib/shared"
import { ogImage } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s — openbranch",
    default: `${appName} — ${SITE_TAGLINE}`,
  },
  description:
    "A living guide on best practices, contribution workflows, testing patterns, Git strategies, and lessons learned in real projects.",
  icons: { icon: "/favicon.svg" },
  authors: [{ name: SITE_AUTHOR, url: SITE_AUTHOR_URL }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  // The fallback for a route with no `generateMetadata` of its own. Every route
  // that has one restates all of this through `seoFor`, because a child's
  // `openGraph` replaces this object outright instead of merging into it.
  openGraph: {
    type: "website",
    siteName: appName,
    images: ogImage(siteImageRoute, `${appName} — ${SITE_TAGLINE}`),
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}
