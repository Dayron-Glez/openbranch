import { readFileSync } from "fs"
import { join } from "path"
import { load as yamlLoad } from "js-yaml"
import { z } from "zod"

export const WantedSchema = z.array(
  z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, "id must be kebab-case"),
    title: z.string().min(3, "title must be at least 3 characters"),
    topic: z.string(),
    requested_count: z.number().int().nonnegative("requested_count must be >= 0"),
    description: z
      .string()
      .min(20, "description must be at least 20 characters")
      .max(180, "description must be at most 180 characters"),
    est_minutes: z.number().int().positive("est_minutes must be > 0").optional(),
  })
)

export type Wanted = z.infer<typeof WantedSchema>[number]

let _cache: Wanted[] | null = null

export function loadWanted(): Wanted[] {
  if (_cache) return _cache

  const raw = readFileSync(join(process.cwd(), "content/wanted.yml"), "utf-8")
  const parsed = yamlLoad(raw)
  const result = WantedSchema.safeParse(parsed)

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - [${i.path.join(".")}] ${i.message}`)
      .join("\n")
    throw new Error(`content/wanted.yml validation failed:\n${errors}`)
  }

  _cache = result.data
  return _cache
}

export function wantedByTopic(topic: string): Wanted[] {
  return loadWanted()
    .filter((w) => w.topic === topic)
    .sort((a, b) => b.requested_count - a.requested_count)
}
