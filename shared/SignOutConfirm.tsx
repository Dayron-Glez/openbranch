"use client"

import type { ReactElement } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconLogout } from "@/icons"
import { createClient } from "@/lib/supabase/client"
import type { AuthDictionary } from "@/lib/dictionaries/auth"

/**
 * Controlled rather than self-contained so it can be opened from a dropdown
 * item. A dialog rendered *inside* a DropdownMenu unmounts the moment the menu
 * closes, which is the moment you click the item — so the state is hoisted and
 * this renders as the menu's sibling.
 */
type SignOutConfirmProps = {
  readonly dict: AuthDictionary
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  /**
   * Where to land afterwards, as a full document navigation: every server
   * component on the page read the session, so they all have to re-render
   * against the signed-out one.
   */
  readonly redirectTo: string
}

export const SignOutConfirm = ({
  dict,
  open,
  onOpenChange,
  redirectTo,
}: SignOutConfirmProps): ReactElement => {
  const handleSignOut = async (): Promise<void> => {
    const supabase = createClient()
    await supabase.auth.signOut()
    globalThis.location.assign(redirectTo)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
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
  )
}
