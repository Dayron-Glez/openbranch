import type { BugFixTemplate } from "./sandpack-templates/bug-fix-off-by-one"
import { bugFixOffByOne } from "./sandpack-templates/bug-fix-off-by-one"
import { bugFixEventEmitter } from "./sandpack-templates/bug-fix-event-emitter"

const BUG_FIX_REGISTRY: Record<string, BugFixTemplate> = {
  "bug-fix-off-by-one": bugFixOffByOne,
  "bug-fix-event-emitter": bugFixEventEmitter,
}

export const getSandpackTemplateBySlug = (slug: string): BugFixTemplate | null =>
  BUG_FIX_REGISTRY[slug] ?? null
