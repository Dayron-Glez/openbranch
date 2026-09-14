import type { Metadata } from "next"
import type { ReactElement } from "react"
import { localizedHref } from "@/lib/landing-dictionary"
import { canonicalUrl } from "@/lib/seo"
import { safeNextPath } from "@/lib/safe-next"
import { authDictionary, resolveAuthLocale } from "@/lib/dictionaries/auth"
import { playgroundSource } from "@/lib/playground-source"
import { source } from "@/lib/source"
import { createClient } from "@/lib/supabase/server"
import { CATEGORY_ORDER } from "@/features/playground/domain/manifest"
import { getEngagementStats } from "@/features/playground/server/stats-service"
import { LoginPanel, type AuthErrorReason } from "@/features/auth/components/LoginPanel"
import { StoryPanel, type StoryCounts } from "@/features/auth/components/StoryPanel"
import { AlreadySignedIn } from "@/features/auth/components/AlreadySignedIn"
import { AmbientBackground } from "@/features/home/components/AmbientBackground"

/** The challenge the story panel shows a still of. */
const FEATURED_SLUG = "git-merge-conflict"

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/login">>): Promise<Metadata> {
  const { lang } = await params
  const dict = authDictionary[resolveAuthLocale(lang)]

  return {
    title: `${dict.eyebrow} · openbranch`,
    description: dict.lead,
    // A sign-in screen has nothing to offer a search result, and indexing one
    // only competes with the pages that do.
    robots: { index: false, follow: true },
    alternates: { canonical: canonicalUrl(lang, "/login") },
  }
}

/**
 * Counted from the content itself so the panel cannot claim something that was
 * true when it was written and is not any more.
 *
 * A guide is a page inside a section: the docs root is a welcome page and each
 * section's `index.mdx` is a frontmatter-only stub, so neither is one.
 */
const countStory = (lang: string): StoryCounts => ({
  challenges: playgroundSource.getPages(lang).length,
  tracks: CATEGORY_ORDER.length,
  guides: source.getPages(lang).filter((page) => page.slugs.length >= 2).length,
})

/** Read from the challenge's own frontmatter rather than typed into the mockup. */
const featuredMinutes = (lang: string): number | null => {
  const page = playgroundSource
    .getPages(lang)
    .find((candidate) => candidate.slugs.join("/") === FEATURED_SLUG)
  const minutes = (page?.data as { estimated_minutes?: number } | undefined)?.estimated_minutes
  return typeof minutes === "number" ? minutes : null
}

/** The in-progress slug comes from the database; its title comes from content. */
const challengeTitleOf = (lang: string, slug: string): string => {
  const page = playgroundSource
    .getPages(lang)
    .find((candidate) => candidate.slugs.join("/") === slug)
  return (page?.data as { title?: string } | undefined)?.title ?? slug
}

const readErrorReason = (raw: string | undefined): AuthErrorReason | null => {
  if (raw === undefined || raw.length === 0) return null
  if (raw === "access_denied") return "access_denied"
  if (raw === "exchange_failed") return "exchange_failed"
  return "unknown"
}

export default async function LoginPage({
  params,
  searchParams,
}: Readonly<PageProps<"/[lang]/login">>): Promise<ReactElement> {
  const { lang } = await params
  const query = await searchParams
  const dict = authDictionary[resolveAuthLocale(lang)]

  const playgroundHref = localizedHref(lang, "/playground")
  const rawNext = typeof query.next === "string" ? query.next : null
  const next = safeNextPath(rawNext, playgroundHref)
  const errorReason = readErrorReason(typeof query.error === "string" ? query.error : undefined)
  const errorCode = typeof query.error_code === "string" ? query.error_code : null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user !== null) {
    const [{ data: profile }, { data: openSession }, stats] = await Promise.all([
      supabase.from("users").select("username, avatar_url").eq("id", user.id).maybeSingle(),
      supabase
        .from("challenge_sessions")
        .select("challenge_slug")
        .eq("user_id", user.id)
        .eq("status", "in_progress")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      getEngagementStats(supabase, user.id),
    ])

    const username = (profile?.username as string | null) ?? null
    const openSlug = (openSession?.challenge_slug as string | null) ?? null

    // Without a username there is no identity to confirm, so the signed-in
    // screen has nothing to say — fall through to the normal sign-in view.
    if (username !== null) {
      return (
        <main data-pg-main className="bg-bg text-fg relative min-h-dvh">
          <AmbientBackground />
          <div className="relative z-1 mx-auto grid min-h-dvh max-w-[1440px] grid-cols-[640px_minmax(0,1fr)] max-[1100px]:grid-cols-[minmax(0,520px)_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:px-6 max-[760px]:py-7">
            <AlreadySignedIn
              dict={dict}
              username={username}
              avatarUrl={(profile?.avatar_url as string | null) ?? null}
              streak={stats?.currentStreak ?? 0}
              openChallengeTitle={openSlug === null ? null : challengeTitleOf(lang, openSlug)}
              continueHref={
                openSlug === null ? next : localizedHref(lang, `/playground/${openSlug}`)
              }
              next={next}
            />
            <div className="auth-rise-late flex p-5 pl-0 max-[760px]:hidden">
              <StoryPanel
                dict={dict}
                counts={countStory(lang)}
                challengeMinutes={featuredMinutes(lang)}
              />
            </div>
          </div>
        </main>
      )
    }
  }

  return (
    <main data-pg-main className="bg-bg text-fg relative min-h-dvh">
      <AmbientBackground />
      <div className="relative z-1 mx-auto grid min-h-dvh max-w-[1440px] grid-cols-[640px_minmax(0,1fr)] max-[1100px]:grid-cols-[minmax(0,520px)_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:px-6 max-[760px]:py-7">
        <LoginPanel
          dict={dict}
          next={next}
          nextLabel={next}
          initialError={errorReason}
          errorCode={errorCode}
        />
        <div className="auth-rise-late flex p-5 pl-0 max-[760px]:hidden">
          <StoryPanel
            dict={dict}
            counts={countStory(lang)}
            challengeMinutes={featuredMinutes(lang)}
          />
        </div>
      </div>
    </main>
  )
}
