import { docsGatewayModule } from "./docs-templates/docs-gateway-module"
import { createChallengeRegistry } from "../../registry/create-registry"

export const getDocsTemplateBySlug = createChallengeRegistry({
  "docs-gateway-module": docsGatewayModule,
})
