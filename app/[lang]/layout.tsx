import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { I18nRootProvider } from "@/components/shared/I18nRootProvider"
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
        <I18nRootProvider i18n={provider(lang)}>{children}</I18nRootProvider>
      </body>
    </html>
  )
}
