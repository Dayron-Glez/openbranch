import type { TemplateFile } from "./template"

export type { TemplateFile as DocsFile }

export type DocsCriterion = {
  readonly id: string
  readonly label: string
  readonly check: (content: string) => "pass" | "fail"
}

// Serializable subset — safe to pass as Server Component props to a Client Component.
export type DocsTemplateData = {
  readonly files: Record<string, TemplateFile>
  readonly editableFile: string
  readonly hints: readonly string[]
}

// Full template including check functions — only used server-side or imported directly in client modules.
export type DocsTemplate = DocsTemplateData & {
  readonly criteria: readonly DocsCriterion[]
  readonly hintsByLang?: Partial<Record<string, readonly string[]>>
}
