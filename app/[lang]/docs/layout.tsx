import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/logo"
import { DocsPageTransition } from "@/components/DocsPageTransition"
import { DocsSidebarItem } from "@/components/DocsSidebar"
import { MaturityProvider } from "@/components/MaturityProvider"
import { DocsUIProvider } from "@/components/DocsUIProvider"
import { docsDictionary } from "@/lib/dictionaries/docs"
import type { DocsLocale } from "@/lib/dictionaries/docs"
import type { Maturity } from "@/lib/maturity"
import type {
  Node as PageTreeNode,
  Root as PageTreeRoot,
  Item as PageTreeItem,
} from "fumadocs-core/page-tree"

function augmentTree(node: PageTreeNode): PageTreeNode {
  if (node.type !== "folder") return node

  const topic = node.index?.url.split("/").at(-1) ?? node.name?.toString() ?? ""
  const suggestItem: PageTreeItem = {
    type: "page",
    name: "Suggest a guide",
    url: `/_suggest/${encodeURIComponent(topic)}`,
  }

  return {
    ...node,
    children: [...node.children.map(augmentTree), suggestItem],
  }
}

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()

  const maturityMap: Record<string, Maturity> = Object.fromEntries(
    source.getPages(lang).map((p) => [p.url, p.data.maturity])
  )

  const rawTree = source.pageTree[lang]
  const tree: PageTreeRoot = {
    ...rawTree,
    children: rawTree.children.map(augmentTree),
  }

  const locale = (lang as DocsLocale) in docsDictionary ? (lang as DocsLocale) : "es"
  const dict = docsDictionary[locale]

  return (
    <MaturityProvider map={maturityMap}>
      <DocsUIProvider dict={dict}>
        <DocsLayout
          tree={tree}
          {...base}
          nav={{ ...base.nav, title: <Logo /> }}
          containerProps={{ style: { "--fd-sidebar-width": "268px" } as React.CSSProperties }}
          sidebar={{ components: { Item: DocsSidebarItem } }}
        >
          <DocsPageTransition>{children}</DocsPageTransition>
        </DocsLayout>
      </DocsUIProvider>
    </MaturityProvider>
  )
}
