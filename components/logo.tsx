import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

function BranchIcon({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="10" x2="18" y2="54" />
        <path d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50" />
        <circle cx="18" cy="10" r="4.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="54" r="4.5" fill="currentColor" stroke="none" />
      </g>
      <circle cx="40" cy="50" r="4.5" fill="#52D473" stroke="none" />
    </svg>
  )
}

export function Logo({ className, iconOnly = false }: Readonly<LogoProps>) {
  if (iconOnly) {
    return <BranchIcon className={cn("size-7", className)} />
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BranchIcon className="size-7 shrink-0" />
      <span className="text-[17px] leading-none tracking-[0]" aria-label="openbranch">
        <span className="font-light opacity-70">open</span>
        <span className="font-semibold">branch</span>
      </span>
    </span>
  )
}
