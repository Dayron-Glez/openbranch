import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/shared/Logo"
import { DocsPageTransition } from "@/features/docs/components/DocsPageTransition"
import { DocsSidebarItem } from "@/features/docs/components/DocsSidebar"
import { DocsUIProvider } from "@/features/docs/components/DocsUIProvider"
import { docsDictionary } from "@/lib/dictionaries/docs"
import type { DocsLocale } from "@/lib/dictionaries/docs"

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()

  const locale = (lang as DocsLocale) in docsDictionary ? (lang as DocsLocale) : "es"

  return (
    <DocsUIProvider dict={docsDictionary[locale]}>
      <DocsLayout
        tree={source.pageTree[lang]}
        {...base}
        nav={{ ...base.nav, title: <Logo /> }}
        containerProps={{}}
        sidebar={{ components: { Item: DocsSidebarItem } }}
      >
        <DocsPageTransition>{children}</DocsPageTransition>
      </DocsLayout>
    </DocsUIProvider>
  )
}
