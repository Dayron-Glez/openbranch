"use client"

import type React from "react"
import { useState } from "react"
import { IconFlame, IconGithub } from "@/icons"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

type SignInNudgeProps = {
  readonly dict: PlaygroundDict["nudge"]
  readonly redirectPath: string
}

export const SignInNudge = ({ dict, redirectPath }: SignInNudgeProps): React.ReactElement => {
  const [loading, setLoading] = useState<boolean>(false)

  const handleGitHubSignIn = async (): Promise<void> => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    })
  }

  return (
    <div className="bg-bg-card border-line flex items-center gap-[18px] rounded-(--r-12) border px-[22px] py-4 max-[640px]:flex-col max-[640px]:items-start">
      <span
        aria-hidden
        className="border-accent-ring bg-accent-soft text-ob-accent inline-grid size-9 shrink-0 place-items-center rounded-(--r-10) border [&_svg]:size-[17px]"
      >
        <IconFlame />
      </span>
      <p className="text-fg-2 m-0 text-[14px] leading-[1.55]">
        {dict.lead} <span className="text-fg-muted">{dict.sub}</span>
      </p>
      <Button
        onClick={handleGitHubSignIn}
        disabled={loading}
        className="bg-ob-accent text-accent-ink ml-auto h-9 shrink-0 gap-2 rounded-(--r-8) text-[13px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60 max-[640px]:ml-0 max-[640px]:w-full"
      >
        <IconGithub className="size-[15px]" />
        {dict.cta}
      </Button>
    </div>
  )
}
