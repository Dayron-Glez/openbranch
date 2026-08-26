import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"
import { maturitySchema } from "./lib/maturity"
import { pathFrontmatterFields } from "./lib/paths-schema"

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
      // Reader-facing label only — the engine is selected by `category`.
      validation: z.enum(["checklist", "jest", "typecheck"]),
      skills: z.array(z.string()).optional(),
      recommended_first: z.string().optional(),
      pr_preview: z
        .object({
          number: z.number(),
          status: z.string().default("Open"),
          title: z.string(),
          branch: z.string(),
          base: z.string().default("main"),
          files: z.number(),
          additions: z.number(),
          deletions: z.number(),
          comments: z.number().default(0),
          check_warning: z.string().optional(),
        })
        .optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
})

export const paths = defineDocs({
  dir: "content/paths",
  docs: {
    files: ["*.md", "*.mdx"],
    schema: pageSchema.extend(pathFrontmatterFields),
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
