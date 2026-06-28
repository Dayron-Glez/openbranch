import type { DocsTemplate } from "./docs-types"
import { docsGatewayModule } from "./docs-templates/docs-gateway-module"

const DOCS_REGISTRY: Record<string, DocsTemplate> = {
  "docs-gateway-module": docsGatewayModule,
}

export const getDocsTemplateBySlug = (slug: string): DocsTemplate | null =>
  DOCS_REGISTRY[slug] ?? null
