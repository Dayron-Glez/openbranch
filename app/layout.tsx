import "./global.css"
import "./animations.css"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  metadataBase: new URL("https://openbranch.vercel.app"),
  title: {
    template: "%s — openbranch",
    default: "openbranch — The open guide to building software the right way",
  },
  description:
    "A living guide on best practices, contribution workflows, testing patterns, Git strategies, and lessons learned in real projects.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    images: [{ url: "/logo.svg" }],
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
