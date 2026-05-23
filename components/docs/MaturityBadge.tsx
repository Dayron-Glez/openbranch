import { MATURITY_CLASSES, MATURITY_LABEL } from "@/lib/maturity"
import type { Maturity } from "@/lib/maturity"
import { Badge } from "@/components/ui/badge"

type MaturityBadgeProps = {
  maturity: Maturity
}

export function MaturityBadge({ maturity }: Readonly<MaturityBadgeProps>) {
  return (
    <Badge
      variant="outline"
      className={[
        "gap-1.5 font-mono tracking-[0.02em] whitespace-nowrap",
        MATURITY_CLASSES[maturity],
      ].join(" ")}
      aria-label={`Maturity: ${maturity}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {MATURITY_LABEL[maturity]}
    </Badge>
  )
}
