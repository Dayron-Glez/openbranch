export type InlineComment = {
  readonly id: string
  readonly filename: string
  readonly lineIndex: number
  readonly content: string
}

export type ReviewDecision = "approve" | "comment" | "request-changes" | null

export type ReviewSnapshot = {
  readonly comments: InlineComment[]
  readonly decision: ReviewDecision
}

export type BugFixSnapshot = {
  readonly code: string
}

export type TestingSnapshot = {
  readonly testCode: string
}
