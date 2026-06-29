import { testingFetchUpstream } from "./sandpack-templates/testing-fetchupstream"
import { createChallengeRegistry } from "./create-registry"

export const getTestingTemplateBySlug = createChallengeRegistry({
  "testing-fetchupstream": testingFetchUpstream,
})
