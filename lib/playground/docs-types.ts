export type DocsFile = {
  readonly code: string
  readonly readOnly?: boolean
}

export type DocsCriterion = {
  readonly id: string
  readonly label: string
  readonly check: (content: string) => "pass" | "fail"
}

export type DocsTemplate = {
  readonly files: Record<string, DocsFile>
  readonly editableFile: string
  readonly criteria: readonly DocsCriterion[]
}
