import type { ReactNode } from "react"
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
import { flattenSteps, locateStep } from "@/features/paths/domain/paths"
import { pathsForDoc } from "@/features/paths/server/path-catalog"
import { pathsDictionary, resolvePathsLocale } from "@/lib/dictionaries/paths"
import { PartOfPathChip } from "@/features/paths/components/PartOfPathChip"
import { NextInPath } from "@/features/paths/components/NextInPath"
import { playgroundSource } from "@/lib/playground-source"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { localizedHref } from "@/lib/landing-dictionary"

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

  const pathsLocale = resolvePathsLocale(lang)
  const pathsDict = pathsDictionary[pathsLocale]
  const currentDocSlug = (slug ?? []).join("/")
  const primaryPath = isSectionPage ? undefined : pathsForDoc(currentDocSlug, lang)[0]
  const docLocation =
    primaryPath === undefined
      ? null
      : locateStep(primaryPath, (s) => s.type === "doc" && s.slug === currentDocSlug)
  const stepIndex = docLocation?.flatIndex
  const nextStep =
    primaryPath !== undefined && docLocation !== null
      ? flattenSteps(primaryPath)[docLocation.flatIndex + 1]
      : undefined

  let nextInPathBlock: ReactNode = null
  if (primaryPath !== undefined && nextStep?.type === "challenge") {
    const challengePage = playgroundSource.getPage([nextStep.slug], lang)
    if (challengePage !== undefined) {
      const playgroundDict = getPlaygroundDict(lang)
      nextInPathBlock = (
        <NextInPath
          track={primaryPath.track}
          href={localizedHref(lang, `/playground/${nextStep.slug}`)}
          title={challengePage.data.title}
          meta={`${playgroundDict.difficulty[challengePage.data.difficulty]} · ${challengePage.data.estimated_minutes}m`}
          icon={getChallengeIcon(challengePage.data.icon)}
          label={pathsDict.nextInPath}
          cta={pathsDict.startChallenge}
        />
      )
    }
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="bg-accent-soft text-ob-accent w-fit gap-1.5 border-transparent font-mono"
            >
              <IconClock className="size-3" />
              {formatReadingTime(readingMinutes, lang)}
            </Badge>
            {primaryPath !== undefined && stepIndex !== undefined && stepIndex >= 0 && (
              <PartOfPathChip
                path={primaryPath}
                href={localizedHref(lang, `/paths/${primaryPath.slug}`)}
                label={pathsDict.partOfPath}
                stepOf={pathsDict.stepOf}
                stepIndex={stepIndex}
              />
            )}
          </div>
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
        {nextInPathBlock}
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
