import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { PlaygroundTransition } from "./PlaygroundTransition"
import { PlaygroundNav } from "./PlaygroundNav"

/**
 * The nav-and-transition shell shared by /playground, /paths and /u.
 *
 * All three had copied the same viewer lookup verbatim; adding the profile
 * route would have made it three. The user read here is always the *viewer* —
 * only the nav avatar depends on it — so every one of these routes renders
 * fine signed out, and a page showing someone else's data still gets the
 * right nav for whoever is looking.
 *
 * `fixed` is the challenge workspace's app-shell layout, where the page owns
 * the viewport and only the inner column scrolls. Everything else scrolls as a
 * normal document.
 */
export const AppShell = async ({
  lang,
  variant = "document",
  children,
}: {
  readonly lang: string
  readonly variant?: "document" | "fixed"
  readonly children: ReactNode
}): Promise<ReactNode> => {
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
    <div
      className={
        variant === "fixed"
          ? "bg-bg text-fg flex h-dvh flex-col overflow-hidden"
          : "bg-bg text-fg min-h-dvh"
      }
    >
      <PlaygroundTransition />
      <PlaygroundNav lang={lang} avatarUrl={avatarUrl} username={username} />
      {variant === "fixed" ? <div className="flex-1 overflow-y-auto">{children}</div> : children}
    </div>
  )
}
