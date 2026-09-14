import type { Metadata } from "next"
import type { ReactElement } from "react"
import { redirect } from "next/navigation"
import { localizedHref } from "@/lib/landing-dictionary"
import { safeNextPath } from "@/lib/safe-next"
import { authDictionary, resolveAuthLocale } from "@/lib/dictionaries/auth"
import { playgroundSource } from "@/lib/playground-source"
import { source } from "@/lib/source"
import { createClient } from "@/lib/supabase/server"
import { CATEGORY_ORDER } from "@/features/playground/domain/manifest"
import { StoryPanel, type StoryCounts } from "@/features/auth/components/StoryPanel"
import { WelcomePanel } from "@/features/auth/components/WelcomePanel"
import { AmbientBackground } from "@/features/home/components/AmbientBackground"

const FEATURED_SLUG = "git-merge-conflict"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const countStory = (lang: string): StoryCounts => ({
  challenges: playgroundSource.getPages(lang).length,
  tracks: CATEGORY_ORDER.length,
  guides: source.getPages(lang).filter((page) => page.slugs.length >= 2).length,
})

const featuredMinutes = (lang: string): number | null => {
  const page = playgroundSource
    .getPages(lang)
    .find((candidate) => candidate.slugs.join("/") === FEATURED_SLUG)
  const minutes = (page?.data as { estimated_minutes?: number } | undefined)?.estimated_minutes
  return typeof minutes === "number" ? minutes : null
}

/**
 * Reached only from the callback, on the request that created the account.
 * It is not defended against being opened directly — landing here signed in
 * just shows a greeting, and landing here signed out goes to `/login`.
 */
export default async function WelcomePage({
  params,
  searchParams,
}: Readonly<PageProps<"/[lang]/login/welcome">>): Promise<ReactElement> {
  const { lang } = await params
  const query = await searchParams
  const dict = authDictionary[resolveAuthLocale(lang)]

  const playgroundHref = localizedHref(lang, "/playground")
  const next = safeNextPath(typeof query.next === "string" ? query.next : null, playgroundHref)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user === null) redirect(localizedHref(lang, "/login"))

  const { data: profile } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  const username = (profile?.username as string | null) ?? null
  // The trigger fills this row on signup; without it there is no identity to
  // greet, so fall through to the normal signed-in screen rather than invent one.
  if (username === null) redirect(localizedHref(lang, "/login"))

  return (
    <main data-pg-main className="bg-bg text-fg relative min-h-dvh">
      <AmbientBackground />
      <div className="relative z-1 mx-auto grid min-h-dvh max-w-[1440px] grid-cols-[640px_minmax(0,1fr)] max-[1100px]:grid-cols-[minmax(0,520px)_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:px-6 max-[760px]:py-7">
        <WelcomePanel
          dict={dict}
          username={username}
          profileHref={localizedHref(lang, `/u/${username}`)}
          continueHref={next}
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
