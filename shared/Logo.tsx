import type { ReactElement } from "react"
import { cn } from "@/lib/utils"
import { LogoMark } from "./LogoMark"

type LogoProps = {
  readonly className?: string
  readonly iconOnly?: boolean
}

export const Logo = ({ className, iconOnly = false }: LogoProps): ReactElement => {
  if (iconOnly) {
    return <LogoMark size={28} className={cn("size-7", className)} />
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={28} className="size-7 shrink-0" />
      <span className="text-[17px] leading-none tracking-[0]" aria-label="openbranch">
        <span className="font-light opacity-70">open</span>
        <span className="font-semibold">branch</span>
      </span>
    </span>
  )
}
