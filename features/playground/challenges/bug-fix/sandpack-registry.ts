import { bugFixOffByOne } from "./sandpack-templates/bug-fix-off-by-one"
import { bugFixEventEmitter } from "./sandpack-templates/bug-fix-event-emitter"
import { createChallengeRegistry } from "../../registry/create-registry"

export const getSandpackTemplateBySlug = createChallengeRegistry({
  "bug-fix-off-by-one": bugFixOffByOne,
  "bug-fix-event-emitter": bugFixEventEmitter,
})
