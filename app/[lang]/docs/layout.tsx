import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/logo"
import { DocsPageTransition } from "@/components/DocsPageTransition"
import { DocsSidebarItem } from "@/components/DocsSidebar"
import { MaturityProvider } from "@/components/MaturityProvider"
import type { Maturity } from "@/lib/maturity"

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()

  const maturityMap: Record<string, Maturity> = Object.fromEntries(
    source.getPages(lang).map((p) => [p.url, p.data.maturity])
  )

  return (
    <MaturityProvider map={maturityMap}>
      <DocsLayout
        tree={source.pageTree[lang]}
        {...base}
        nav={{ ...base.nav, title: <Logo /> }}
        containerProps={{ style: { "--fd-sidebar-width": "268px" } as React.CSSProperties }}
        sidebar={{ components: { Item: DocsSidebarItem } }}
      >
        <DocsPageTransition>{children}</DocsPageTransition>
      </DocsLayout>
    </MaturityProvider>
  )
}
