import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** The card the three auth states share. `centered` is the only thing that varied. */
export const AuthPanel = ({
  children,
  centered = false,
}: {
  readonly children: ReactNode
  readonly centered?: boolean
}): ReactNode => (
  <div
    className={cn(
      "auth-rise bg-bg-card border-line max-tablet:gap-6 max-tablet:p-6 flex flex-col gap-7 rounded-(--r-16) border p-9 shadow-(--sh-3)",
      centered && "items-center text-center"
    )}
  >
    {children}
  </div>
)
