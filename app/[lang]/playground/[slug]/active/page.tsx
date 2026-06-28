import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { getDiffBySlug } from "@/lib/playground/diff-registry"
import { getSandpackTemplateBySlug } from "@/lib/playground/sandpack-registry"
import { getTestingTemplateBySlug } from "@/lib/playground/testing-registry"
import { getGitTemplateBySlug } from "@/lib/playground/git-registry"
import { getDocsTemplateBySlug } from "@/lib/playground/docs-registry"
import { ActiveChallengeView } from "@/components/playground/ActiveChallengeView"
import { BugFixChallengeView } from "@/components/playground/BugFixChallengeView"
import { TestingChallengeView } from "@/components/playground/testing/TestingChallengeView"
import { GitChallengeView } from "@/components/playground/git/GitChallengeView"
import { DocumentationChallengeView } from "@/components/playground/documentation/DocumentationChallengeView"
import type {
  ReviewSnapshot,
  BugFixSnapshot,
  TestingSnapshot,
  GitSnapshot,
  GitBlockResolution,
  DocsSnapshot,
} from "@/lib/playground/review-types"

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) =>
    playgroundSource
      .getPages(lang)
      .filter((page) => page.data.maturity === "stable")
      .map((page) => ({ lang, slug: page.slugs[0] }))
  )
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/playground/[slug]/active">>): Promise<Metadata> {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) return {}
  return { title: `${page.data.title} · openbranch` }
}

export default async function ActiveChallengePage({
  params,
}: Readonly<PageProps<"/[lang]/playground/[slug]/active">>) {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user === null) {
    redirect(localizedHref(lang, `/playground/${slug}`))
  }

  const { data: session } = await supabase
    .from("challenge_sessions")
    .select("snapshot")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("lang", lang)
    .eq("status", "in_progress")
    .maybeSingle()

  if (session === null) {
    redirect(localizedHref(lang, `/playground/${slug}`))
  }

  const dict = getPlaygroundDict(lang)
  const playgroundPath = localizedHref(lang, "/playground")
  const challengePath = localizedHref(lang, `/playground/${slug}`)
  const category = page.data.category as string

  if (category === "bug-fix") {
    const template = getSandpackTemplateBySlug(slug)
    if (template === null) notFound()
    const bugFixSnapshot = session.snapshot as BugFixSnapshot | null
    return (
      <BugFixChallengeView
        title={page.data.title}
        template={template}
        initialCode={bugFixSnapshot?.code ?? null}
        slug={slug}
        lang={lang}
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        dict={dict}
      />
    )
  }

  if (category === "testing") {
    const template = getTestingTemplateBySlug(slug)
    if (template === null) notFound()
    const testingSnapshot = session.snapshot as TestingSnapshot | null
    return (
      <TestingChallengeView
        title={page.data.title}
        template={template}
        initialTestCode={testingSnapshot?.testCode ?? null}
        slug={slug}
        lang={lang}
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        dict={dict}
      />
    )
  }

  if (category === "git") {
    const template = getGitTemplateBySlug(slug)
    if (template === null) notFound()
    const gitSnapshot = session.snapshot as GitSnapshot | null
    return (
      <GitChallengeView
        title={page.data.title}
        template={template}
        initialResolutions={(gitSnapshot?.resolutions ?? null) as GitBlockResolution[] | null}
        slug={slug}
        lang={lang}
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        dict={dict}
      />
    )
  }

  if (category === "documentation") {
    const template = getDocsTemplateBySlug(slug)
    if (template === null) notFound()
    const docsSnapshot = session.snapshot as DocsSnapshot | null
    return (
      <DocumentationChallengeView
        title={page.data.title}
        template={template}
        initialContent={docsSnapshot?.content ?? null}
        slug={slug}
        lang={lang}
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        dict={dict}
      />
    )
  }

  // default: code-review
  const snapshot = session.snapshot as ReviewSnapshot | null
  const initialComments = snapshot?.comments ?? []
  const initialDecision = snapshot?.decision ?? null
  const diffFiles = getDiffBySlug(slug)

  return (
    <ActiveChallengeView
      title={page.data.title}
      diffFiles={diffFiles}
      initialComments={initialComments}
      initialDecision={initialDecision}
      slug={slug}
      lang={lang}
      playgroundPath={playgroundPath}
      challengePath={challengePath}
      dict={dict}
    />
  )
}
