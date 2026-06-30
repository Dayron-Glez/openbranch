import { getPageImage, getPageGitHubUrl, getPageMarkdownUrl, source } from "@/lib/source"
import { SITE_URL } from "@/lib/constants"
import { getReadingTime, formatReadingTime } from "@/lib/reading-time"
import { SuggestGuideButton } from "@/features/docs/components/SuggestGuideButton"
import { IconClock } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/docs/page"
import { DocsOpenButton } from "@/features/docs/components/DocsOpenButton"
import { notFound } from "next/navigation"
import { getMDXComponents } from "@/features/docs/components/mdx"
import { DocsScrollReveal } from "@/features/docs/components/DocsScrollReveal"
import { SectionCards } from "@/features/docs/components/SectionCards"
import type { Metadata } from "next"
import { createRelativeLink } from "fumadocs-ui/mdx"
import { findNeighbour } from "fumadocs-core/page-tree"

export default async function Page(props: Readonly<PageProps<"/[lang]/docs/[[...slug]]">>) {
  const { lang, slug } = await props.params
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MdxContent = page.data.body
  const markdownUrl = getPageMarkdownUrl(page).url
  const githubUrl = getPageGitHubUrl(page)
  const pageUrl = `${SITE_URL}${page.url}`
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
      <div className="flex flex-col gap-2">
        <DocsTitle className="leading-tight">{page.data.title}</DocsTitle>
        {!isSectionPage && (
          <Badge
            variant="outline"
            className="bg-accent-soft text-ob-accent w-fit gap-1.5 border-transparent font-mono"
          >
            <IconClock className="size-3" />
            {formatReadingTime(readingMinutes, lang)}
          </Badge>
        )}
      </div>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-wrap items-center gap-2 border-b pb-6">
        <MarkdownCopyButton
          markdownUrl={markdownUrl}
          className={isSectionPage ? "max-[520px]:hidden" : undefined}
        />
        <DocsOpenButton pageUrl={pageUrl} markdownUrl={markdownUrl} githubUrl={githubUrl} />
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
