import type { TestingTemplate } from "./sandpack-templates/testing-fetchupstream"
import { testingFetchUpstream } from "./sandpack-templates/testing-fetchupstream"

const TESTING_REGISTRY: Record<string, TestingTemplate> = {
  "testing-fetchupstream": testingFetchUpstream,
}

export const getTestingTemplateBySlug = (slug: string): TestingTemplate | null =>
  TESTING_REGISTRY[slug] ?? null
