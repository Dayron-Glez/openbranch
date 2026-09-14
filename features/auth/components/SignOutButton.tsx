"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconLogout } from "@/icons"
import { createClient } from "@/lib/supabase/client"
import type { AuthDictionary } from "@/lib/dictionaries/auth"

type SignOutButtonProps = {
  readonly dict: AuthDictionary
  readonly className?: string
  /**
   * Where to land afterwards. A full document navigation, not a router push —
   * every server component on the page read the session, so they all have to
   * re-render against the signed-out one.
   */
  readonly redirectTo: string
}

export const SignOutButton = ({
  dict,
  className,
  redirectTo,
}: SignOutButtonProps): ReactElement => {
  const [confirming, setConfirming] = useState<boolean>(false)

  const handleSignOut = async (): Promise<void> => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.assign(redirectTo)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          className ??
          "text-fg-muted hover:text-danger font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
        }
      >
        {dict.signOut}
      </button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        icon={
          <span
            aria-hidden
            className="border-line bg-bg-elev text-fg-muted inline-grid size-9 place-items-center rounded-(--r-10) border [&_svg]:size-[17px]"
          >
            <IconLogout />
          </span>
        }
        title={dict.signOutTitle}
        description={dict.signOutBody}
        confirmLabel={dict.signOutConfirm}
        cancelLabel={dict.signOutCancel}
        onConfirm={handleSignOut}
      />
    </>
  )
}
