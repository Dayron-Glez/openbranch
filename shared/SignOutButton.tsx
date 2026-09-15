"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { SignOutConfirm } from "@/shared/SignOutConfirm"
import type { AuthDictionary } from "@/lib/dictionaries/auth"

type SignOutButtonProps = {
  readonly dict: AuthDictionary
  readonly className?: string
  readonly redirectTo: string
}

/** A plain trigger for the places that do not already own the dialog's state. */
export const SignOutButton = ({
  dict,
  className,
  redirectTo,
}: SignOutButtonProps): ReactElement => {
  const [confirming, setConfirming] = useState<boolean>(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={
          className ??
          "text-fg-muted hover:text-danger text-2xs font-mono transition-colors duration-(--d-fast) ease-(--ease)"
        }
      >
        {dict.signOut}
      </button>
      <SignOutConfirm
        dict={dict}
        open={confirming}
        onOpenChange={setConfirming}
        redirectTo={redirectTo}
      />
    </>
  )
}
