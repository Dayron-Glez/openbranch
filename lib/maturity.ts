import { z } from "zod"

export const MATURITY_VALUES = [
  "draft",
  "rfc",
  "field-tested",
  "battle-tested",
  "archived",
] as const

export type Maturity = (typeof MATURITY_VALUES)[number]

export const maturitySchema = z.enum(MATURITY_VALUES).default("draft")

export const MATURITY_LABEL: Record<Maturity, string> = {
  draft: "draft",
  rfc: "rfc",
  "field-tested": "field-tested",
  "battle-tested": "battle-tested",
  archived: "archived",
}

export const MATURITY_SHORT_LABEL: Record<Maturity, string> = {
  draft: "draft",
  rfc: "rfc",
  "field-tested": "field",
  "battle-tested": "battle",
  archived: "archived",
}

export const MATURITY_CLASSES: Record<Maturity, string> = {
  draft: "text-fg-muted border-line bg-transparent",
  rfc: "text-info border-info/30 bg-info/8",
  "field-tested": "text-warn border-warn/30 bg-warn/8",
  "battle-tested": "text-ob-accent border-ob-accent/30 bg-accent-soft",
  archived: "text-fg-faint border-line bg-transparent line-through decoration-fg-faint",
}

export const MATURITY_SIZE_CLASSES: Record<"xs" | "md" | "lg", string> = {
  xs: "px-1.5 py-0.5 text-[length:var(--text-2xs)]",
  md: "px-2.5 py-1 text-[length:var(--text-xs)]",
  lg: "px-3 py-1.5 text-[length:var(--text-sm)]",
}
