import type { ReactNode } from "react"
import { PlaygroundTransition } from "@/components/playground/PlaygroundTransition"
import { PlaygroundNav } from "@/components/playground/PlaygroundNav"
import { createClient } from "@/lib/supabase/server"
import "./playground.css"

export default async function PlaygroundLayout({
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
    <div className="bg-bg text-fg flex h-dvh flex-col overflow-hidden">
      <PlaygroundTransition />
      <PlaygroundNav lang={lang} avatarUrl={avatarUrl} username={username} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
