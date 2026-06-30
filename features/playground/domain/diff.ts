export type DiffLineType = "added" | "removed" | "context" | "hunk"

export type DiffLine = {
  readonly type: DiffLineType
  readonly content: string
}

export type DiffFile = {
  readonly filename: string
  readonly additions: number
  readonly deletions: number
  readonly lines: readonly DiffLine[]
}
