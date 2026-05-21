import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { maturitySchema } from "./lib/maturity"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({ maturity: maturitySchema }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    // MDX options
  },
})
