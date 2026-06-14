import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"
import { maturitySchema } from "./lib/maturity"

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      maturity: maturitySchema,
      authors: z.array(z.string()).optional(),
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export const playground = defineDocs({
  dir: "content/playground",
  docs: {
    files: ["*.md", "*.mdx"],
    schema: pageSchema.extend({
      icon: z.string().optional(),
      maturity: z.enum(["draft", "stable"]).default("draft"),
      authors: z.array(z.string()).optional(),
      category: z.enum(["code-review", "bug-fix", "testing", "git", "documentation"]),
      difficulty: z.enum(["beginner", "moderate", "demanding"]),
      estimated_minutes: z.number(),
      validation: z.enum(["checklist", "jest", "typecheck"]),
      sandbox_template: z.string(),
    }),
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
