import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * The small monospace label that introduces a panel, a section or a block of
 * detail. One tracking for the whole role: the app had reached eight values
 * for what is visually one device.
 *
 * Not covered here, because they are different devices rather than variants:
 * `SectionLabel` (the bordered divider heading) and the `0.04em` meta labels
 * on the challenge detail page.
 */
const eyebrowVariants = cva("font-mono tracking-[0.08em] uppercase", {
  variants: {
    tone: {
      muted: "text-fg-muted",
      accent: "text-ob-accent",
      track: "text-(color:--track)",
    },
    size: {
      sm: "text-2xs",
      xs: "text-3xs",
    },
  },
  defaultVariants: { tone: "muted", size: "sm" },
})

type EyebrowProps = VariantProps<typeof eyebrowVariants> & {
  readonly children: ReactNode
  readonly className?: string
  /** Defaults to `p`; pass `span` where the label sits inline in a flex row. */
  readonly as?: "p" | "span" | "div"
}

export const Eyebrow = ({ children, className, tone, size, as = "p" }: EyebrowProps): ReactNode => {
  const Tag = as
  return <Tag className={cn(eyebrowVariants({ tone, size }), className)}>{children}</Tag>
}
