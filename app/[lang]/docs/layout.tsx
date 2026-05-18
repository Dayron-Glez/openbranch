import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/logo"

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()
  return (
    <DocsLayout
      tree={source.pageTree[lang]}
      {...base}
      nav={{ ...base.nav, title: <Logo /> }}
      containerProps={{ style: { "--fd-sidebar-width": "268px" } as React.CSSProperties }}
    >
      {children}
    </DocsLayout>
  )
}
