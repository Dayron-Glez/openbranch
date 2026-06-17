import type { DiffFile } from "@/components/playground/DiffViewer"
import { codeReviewNoisyPrDiff } from "./diffs/code-review-noisy-pr"

const DIFF_REGISTRY: Record<string, readonly DiffFile[]> = {
  "code-review-noisy-pr": codeReviewNoisyPrDiff,
}

export const getDiffBySlug = (slug: string): readonly DiffFile[] | null =>
  DIFF_REGISTRY[slug] ?? null
