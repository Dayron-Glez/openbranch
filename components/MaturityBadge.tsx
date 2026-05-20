import { MATURITY_CLASSES, MATURITY_LABEL, MATURITY_SIZE_CLASSES } from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"

type MaturityBadgeProps = {
  maturity: Maturity
  size?: "xs" | "md" | "lg"
}

export function MaturityBadge({ maturity, size = "md" }: MaturityBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
        MATURITY_SIZE_CLASSES[size],
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </span>
  )
}
