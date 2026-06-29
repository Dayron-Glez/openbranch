import { codeReviewNoisyPrDiff } from "./diffs/code-review-noisy-pr"
import { createChallengeRegistry } from "./create-registry"

export const getDiffBySlug = createChallengeRegistry({
  "code-review-noisy-pr": codeReviewNoisyPrDiff,
})
