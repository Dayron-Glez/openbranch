import { testingFetchUpstream } from "./testing-fetchupstream"
import { createChallengeRegistry } from "../../registry/create-registry"

export const getTestingTemplateBySlug = createChallengeRegistry({
  "testing-fetchupstream": testingFetchUpstream,
})
