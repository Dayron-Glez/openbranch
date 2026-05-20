import "./docs.css"
import { source } from "@/lib/source"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { baseOptions } from "@/lib/layout.shared"
import { Logo } from "@/components/logo"
import { DocsPageTransition } from "@/components/DocsPageTransition"
import { DocsSidebarItem } from "@/components/DocsSidebar"
import { MaturityProvider } from "@/components/MaturityProvider"
import { WantedProvider } from "@/components/WantedProvider"
import { loadWanted } from "@/lib/wanted"
import type { Maturity } from "@/lib/maturity"
import type {
  Node as PageTreeNode,
  Root as PageTreeRoot,
  Item as PageTreeItem,
} from "fumadocs-core/page-tree"

function augmentTree(node: PageTreeNode, wantedNodes: Map<string, PageTreeItem[]>): PageTreeNode {
  if (node.type !== "folder") return node

  const topic = node.index?.url.split("/").at(-1) ?? ""
  const extras = wantedNodes.get(topic) ?? []

  return {
    ...node,
    children: [...node.children.map((child) => augmentTree(child, wantedNodes)), ...extras],
  }
}

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params
  const base = baseOptions()

  const maturityMap: Record<string, Maturity> = Object.fromEntries(
    source.getPages(lang).map((p) => [p.url, p.data.maturity])
  )

  const wanted = loadWanted()

  // Build map: topic slug → virtual page tree items for that topic
  const wantedNodes = new Map<string, PageTreeItem[]>()
  for (const w of wanted) {
    const nodes = wantedNodes.get(w.topic) ?? []
    nodes.push({ type: "page", name: w.title, url: `/_wanted/${w.id}` })
    wantedNodes.set(w.topic, nodes)
  }

  const rawTree = source.pageTree[lang]
  const tree: PageTreeRoot = {
    ...rawTree,
    children: rawTree.children.map((node) => augmentTree(node, wantedNodes)),
  }

  return (
    <MaturityProvider map={maturityMap}>
      <WantedProvider items={wanted}>
        <DocsLayout
          tree={tree}
          {...base}
          nav={{ ...base.nav, title: <Logo /> }}
          containerProps={{ style: { "--fd-sidebar-width": "268px" } as React.CSSProperties }}
          sidebar={{ components: { Item: DocsSidebarItem } }}
        >
          <DocsPageTransition>{children}</DocsPageTransition>
        </DocsLayout>
      </WantedProvider>
    </MaturityProvider>
  )
}
