import type { Metadata } from "next"
import type { ReactElement } from "react"
import { redirect } from "next/navigation"
import { localizedHref } from "@/lib/landing-dictionary"
import { safeNextPath } from "@/lib/safe-next"
import { authDictionary, resolveAuthLocale } from "@/lib/dictionaries/auth"
import { createClient } from "@/lib/supabase/server"
import { StoryPanel } from "@/features/auth/components/StoryPanel"
import { WelcomePanel } from "@/features/auth/components/WelcomePanel"
import { AuthShell } from "@/features/auth/components/AuthShell"
import { AmbientBackground } from "@/features/home/components/AmbientBackground"
import { countStory, featuredMinutes } from "../story-data"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
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
    <AuthShell
      background={<AmbientBackground />}
      panel={
        <StoryPanel
          dict={dict}
          counts={countStory(lang)}
          challengeMinutes={featuredMinutes(lang)}
        />
      }
    >
      <WelcomePanel
        dict={dict}
        username={username}
        profileHref={localizedHref(lang, `/u/${username}`)}
        continueHref={next}
      />
    </AuthShell>
  )
}
