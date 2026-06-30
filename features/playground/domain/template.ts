// Shared file shape used across all challenge templates (bug-fix, docs, testing, git).
export type TemplateFile = {
  readonly code: string
  readonly readOnly?: boolean
}
