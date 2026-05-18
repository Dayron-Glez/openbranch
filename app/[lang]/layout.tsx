import { RootProvider } from "fumadocs-ui/provider/next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { provider } from "@/lib/i18n.ui"
import { i18n } from "@/lib/i18n"

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params
  return (
    <html
      lang={lang}
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        <RootProvider i18n={provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  )
}
