import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source"
import { MaturityBadge } from "@/components/MaturityBadge"
import { MaturityFilter } from "@/components/MaturityFilter"
import type { FilterPage } from "@/components/MaturityFilter"
import { getRevisions } from "@/lib/changelog"
import { RevisionsFooter } from "@/components/RevisionsFooter"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/docs/page"
import { notFound } from "next/navigation"
import { getMDXComponents } from "@/components/mdx"
import { DocsScrollReveal } from "@/components/DocsScrollReveal"
import type { Metadata } from "next"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { gitConfig } from "@/lib/shared"

export default async function Page(props: Readonly<PageProps<"/[lang]/docs/[[...slug]]">>) {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MdxContent = page.data.body
  const markdownUrl = getPageMarkdownUrl(page).url
  const slugString = page.slugs.join("/")
  const revisions = await getRevisions(slugString)

  // Build child-page list for section-index pages (slug has exactly one segment).
  // Leaf pages and the root index do not render the filter.
  let sectionPages: FilterPage[] | null = null
  if (slug?.length === 1) {
    const children = source
      .getPages(lang)
      .filter((p) => p.slugs[0] === slug[0] && p.slugs.length > 1)
    if (children.length > 0) {
      sectionPages = children.map((p) => ({
        title: p.data.title,
        url: p.url,
        description: p.data.description,
        maturity: p.data.maturity,
      }))
    }
  }

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ style: "clerk" }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MaturityBadge maturity={page.data.maturity} size="md" />
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        {sectionPages && <MaturityFilter pages={sectionPages} />}
        <DocsScrollReveal>
          <MdxContent
            components={getMDXComponents({
              // this allows you to link to other pages with relative file paths
              a: createRelativeLink(source, page),
            })}
          />
        </DocsScrollReveal>
        <RevisionsFooter revisions={revisions} slug={slugString} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<"/[lang]/docs/[[...slug]]">
): Promise<Metadata> {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  }
}
