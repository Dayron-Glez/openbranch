import type { ReactNode } from "react"
import { PlaygroundTransition } from "@/features/playground/components/PlaygroundTransition"
import { PlaygroundNav } from "@/features/playground/components/PlaygroundNav"
import { createClient } from "@/lib/supabase/server"
import "../playground/playground.css"

export default async function PathsLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let avatarUrl: string | null = null
  let username: string | null = null

  if (user !== null) {
    const { data: profile } = await supabase
      .from("users")
      .select("avatar_url, username")
      .eq("id", user.id)
      .maybeSingle()
    avatarUrl = (profile?.avatar_url as string | null) ?? null
    username = (profile?.username as string | null) ?? null
  }

  return (
    <div className="bg-bg text-fg min-h-dvh">
      <PlaygroundTransition />
      <PlaygroundNav lang={lang} avatarUrl={avatarUrl} username={username} />
      {children}
    </div>
  )
}
