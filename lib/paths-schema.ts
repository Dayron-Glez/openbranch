import { z } from "zod"

/**
 * Zod-only, relative imports, no `@/` alias: `source.config.ts` pulls this in
 * and is bundled outside Next's bundler, so it cannot resolve path aliases.
 * The track literals are duplicated from `features/playground/domain/manifest`
 * for the same reason; `features/paths/domain/paths.ts` asserts at compile time
 * that the two lists stay identical.
 */
export const PATH_TRACKS = ["git", "review", "docs", "bugfix", "test"] as const

export type PathTrack = (typeof PATH_TRACKS)[number]

export const PATH_STEP_TYPES = ["doc", "challenge"] as const

export type PathStepType = (typeof PATH_STEP_TYPES)[number]

/**
 * Slugs are not resolved here — the build-time validator does that, so a bad
 * reference fails `next build` rather than rendering an empty step.
 */
export const pathStepSchema = z.object({
  type: z.enum(PATH_STEP_TYPES),
  slug: z.string().min(1),
})

export const pathSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(pathStepSchema).min(1),
})

/** Frontmatter fields a path adds on top of fumadocs' own `pageSchema`. */
export const pathFrontmatterFields = {
  track: z.enum(PATH_TRACKS),
  lead: z.string().min(1),
  sections: z.array(pathSectionSchema).min(1),
}
