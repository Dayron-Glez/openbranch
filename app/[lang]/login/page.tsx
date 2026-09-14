import type { Metadata } from "next"
import type { ReactElement } from "react"
import { localizedHref } from "@/lib/landing-dictionary"
import { canonicalUrl } from "@/lib/seo"
import { safeNextPath } from "@/lib/safe-next"
import { authDictionary, resolveAuthLocale } from "@/lib/dictionaries/auth"
import { createClient } from "@/lib/supabase/server"
import { getEngagementStats } from "@/features/playground/server/stats-service"
import { LoginPanel, type AuthErrorReason } from "@/features/auth/components/LoginPanel"
import { StoryPanel } from "@/features/auth/components/StoryPanel"
import { AlreadySignedIn } from "@/features/auth/components/AlreadySignedIn"
import { AuthShell } from "@/features/auth/components/AuthShell"
import { AmbientBackground } from "@/features/home/components/AmbientBackground"
import { countStory, featuredMinutes, challengeTitleOf } from "./story-data"

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

  const panel = (
    <StoryPanel dict={dict} counts={countStory(lang)} challengeMinutes={featuredMinutes(lang)} />
  )

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
        <AuthShell background={<AmbientBackground />} panel={panel}>
          <AlreadySignedIn
            dict={dict}
            username={username}
            avatarUrl={(profile?.avatar_url as string | null) ?? null}
            streak={stats?.currentStreak ?? 0}
            openChallengeTitle={openSlug === null ? null : challengeTitleOf(lang, openSlug)}
            continueHref={openSlug === null ? next : localizedHref(lang, `/playground/${openSlug}`)}
            next={next}
          />
        </AuthShell>
      )
    }
  }

  return (
    <AuthShell background={<AmbientBackground />} panel={panel}>
      <LoginPanel
        dict={dict}
        next={next}
        nextLabel={next}
        initialError={errorReason}
        errorCode={errorCode}
      />
    </AuthShell>
  )
}
