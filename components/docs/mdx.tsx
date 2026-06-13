import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"
import { CopyTemplate } from "@/components/docs/CopyTemplate"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    CopyTemplate,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
