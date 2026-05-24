import { getPageImage, getPageMarkdownUrl, source } from "@/lib/source"
import { getReadingTime, formatReadingTime } from "@/lib/reading-time"
import { SuggestGuideButton } from "@/components/docs/SuggestGuideButton"
import { IconClock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page"
import { notFound } from "next/navigation"
import { getMDXComponents } from "@/components/docs/mdx"
import { DocsScrollReveal } from "@/components/docs/DocsScrollReveal"
import { SectionCards } from "@/components/docs/SectionCards"
import type { Metadata } from "next"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { findNeighbour } from "fumadocs-core/page-tree"

export default async function Page(props: Readonly<PageProps<"/[lang]/docs/[[...slug]]">>) {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MdxContent = page.data.body
  const markdownUrl = getPageMarkdownUrl(page).url
  const isSectionPage = slug?.length === 1

  const tree = source.pageTree[lang]
  const neighbours = findNeighbour(tree, page.url)

  const sectionSlug = slug?.[0]
  const sectionChildren = isSectionPage
    ? source.getPages(lang).filter((p) => p.slugs[0] === sectionSlug && p.slugs.length === 2)
    : []

  const rawText = isSectionPage ? "" : await page.data.getText("processed")
  const readingMinutes = isSectionPage ? 0 : getReadingTime(rawText)

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{ style: "clerk" }}
      tableOfContentPopover={{ style: "clerk" }}
      footer={{ items: neighbours }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <DocsTitle className="leading-tight">{page.data.title}</DocsTitle>
        {!isSectionPage && (
          <Badge
            variant="outline"
            className="bg-accent-soft text-ob-accent gap-1.5 border-transparent font-mono"
          >
            <IconClock className="size-3" />
            {formatReadingTime(readingMinutes, lang)}
          </Badge>
        )}
      </div>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        {isSectionPage && <SuggestGuideButton sectionName={page.data.title} />}
      </div>
      <DocsBody>
        <DocsScrollReveal>
          <MdxContent
            components={getMDXComponents({
              a: createRelativeLink(source, page),
            })}
          />
        </DocsScrollReveal>
        <SectionCards pages={sectionChildren} />
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
