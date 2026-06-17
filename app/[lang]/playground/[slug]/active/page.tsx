import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { getDiffBySlug } from "@/lib/playground/diff-registry"
import { ActiveChallengeView } from "@/components/playground/ActiveChallengeView"
import type { ReviewSnapshot } from "@/lib/playground/review-types"

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

  const snapshot = session.snapshot as ReviewSnapshot | null
  const initialComments = snapshot?.comments ?? []
  const initialDecision = snapshot?.decision ?? null

  const dict = getPlaygroundDict(lang)
  const diffFiles = getDiffBySlug(slug)
  const playgroundPath = localizedHref(lang, "/playground")
  const challengePath = localizedHref(lang, `/playground/${slug}`)

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
