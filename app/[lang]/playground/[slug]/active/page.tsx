import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { getDiffBySlug } from "@/features/playground/challenges/code-review/diff-registry"
import { getSandpackTemplateBySlug } from "@/features/playground/challenges/bug-fix/sandpack-registry"
import { getTestingTemplateBySlug } from "@/features/playground/challenges/testing/testing-registry"
import { getGitTemplateBySlug } from "@/features/playground/challenges/git/git-registry"
import { getDocsTemplateBySlug } from "@/features/playground/challenges/documentation/docs-registry"
import { ActiveChallengeView } from "@/features/playground/components/ActiveChallengeView"
import { BugFixChallengeView } from "@/features/playground/components/BugFixChallengeView"
import { TestingChallengeView } from "@/features/playground/components/testing/TestingChallengeView"
import { GitChallengeView } from "@/features/playground/components/git/GitChallengeView"
import { DocumentationChallengeView } from "@/features/playground/components/documentation/DocumentationChallengeView"
import { WorkspaceOnly } from "@/shared/WorkspaceOnly"
import { NeedsWiderScreenNote } from "@/shared/NeedsWiderScreenNote"
import type {
  ReviewSnapshot,
  BugFixSnapshot,
  TestingSnapshot,
  GitSnapshot,
  GitBlockResolution,
  DocsSnapshot,
} from "@/features/playground/domain/review-types"

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

  const { data: sessionRows } = await supabase
    .from("challenge_sessions")
    .select("snapshot")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)

  const session = sessionRows?.[0] ?? null

  if (session === null) {
    redirect(localizedHref(lang, `/playground/${slug}`))
  }

  const dict = getPlaygroundDict(lang)
  const playgroundPath = localizedHref(lang, "/playground")
  const challengePath = localizedHref(lang, `/playground/${slug}`)
  const category = page.data.category as string

  const narrow = (
    <div className="mx-auto max-w-[520px] px-5 py-16">
      <NeedsWiderScreenNote
        title={dict.detail.needsWiderScreenTitle}
        body={dict.detail.needsWiderScreenBody}
        secondaryHref={challengePath}
        secondaryLabel={page.data.title}
      />
    </div>
  )

  if (category === "bug-fix") {
    const template = getSandpackTemplateBySlug(slug)
    if (template === null) notFound()
    const bugFixSnapshot = session.snapshot as BugFixSnapshot | null
    return (
      <WorkspaceOnly
        wide={
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
        }
        narrow={narrow}
      />
    )
  }

  if (category === "testing") {
    const template = getTestingTemplateBySlug(slug)
    if (template === null) notFound()
    const testingSnapshot = session.snapshot as TestingSnapshot | null
    return (
      <WorkspaceOnly
        wide={
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
        }
        narrow={narrow}
      />
    )
  }

  if (category === "git") {
    const template = getGitTemplateBySlug(slug)
    if (template === null) notFound()
    const gitSnapshot = session.snapshot as GitSnapshot | null
    return (
      <WorkspaceOnly
        wide={
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
        }
        narrow={narrow}
      />
    )
  }

  if (category === "documentation") {
    const docsTemplate = getDocsTemplateBySlug(slug)
    if (docsTemplate === null) notFound()
    const docsSnapshot = session.snapshot as DocsSnapshot | null
    // Pass only the serializable subset — criteria contain functions and cannot be
    // sent as Server Component props to a Client Component.
    const docsHints = docsTemplate.hintsByLang?.[lang] ?? docsTemplate.hints
    const docsTemplateData = {
      files: docsTemplate.files,
      editableFile: docsTemplate.editableFile,
      hints: docsHints,
    }
    return (
      <WorkspaceOnly
        wide={
          <DocumentationChallengeView
            title={page.data.title}
            template={docsTemplateData}
            initialContent={docsSnapshot?.content ?? null}
            slug={slug}
            lang={lang}
            playgroundPath={playgroundPath}
            challengePath={challengePath}
            dict={dict}
          />
        }
        narrow={narrow}
      />
    )
  }

  // default: code-review
  const snapshot = session.snapshot as ReviewSnapshot | null
  const initialComments = snapshot?.comments ?? []
  const initialDecision = snapshot?.decision ?? null
  const diffFiles = getDiffBySlug(slug)

  return (
    <WorkspaceOnly
      wide={
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
      }
      narrow={narrow}
    />
  )
}
