import type { SandpackChallengeTemplate } from "./sandpack-templates/bug-fix-off-by-one"
import { bugFixOffByOneSandpack } from "./sandpack-templates/bug-fix-off-by-one"

const SANDPACK_REGISTRY: Record<string, SandpackChallengeTemplate> = {
  "bug-fix-off-by-one": bugFixOffByOneSandpack,
}

export const getSandpackTemplateBySlug = (slug: string): SandpackChallengeTemplate | null =>
  SANDPACK_REGISTRY[slug] ?? null
