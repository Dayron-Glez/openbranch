import "./global.css"
import "./animations.css"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SITE_AUTHOR, SITE_AUTHOR_URL, SITE_URL } from "@/lib/constants"
import { appName } from "@/lib/shared"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s — openbranch",
    default: "openbranch — The open guide to building software the right way",
  },
  description:
    "A living guide on best practices, contribution workflows, testing patterns, Git strategies, and lessons learned in real projects.",
  icons: { icon: "/favicon.svg" },
  authors: [{ name: SITE_AUTHOR, url: SITE_AUTHOR_URL }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  // No `images` here: `app/opengraph-image.tsx` is the sitewide card, and an
  // entry in this object would win over it everywhere. Guides and profiles
  // still override it from their own `generateMetadata`.
  openGraph: {
    type: "website",
    siteName: appName,
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
