import { i18n } from "@/lib/i18n"
import { source } from "@/lib/source"
import { playgroundSource } from "@/lib/playground-source"
import { flattenSteps, type LearningPath, type PathStep } from "../domain/paths"
import { getAllPaths } from "./path-catalog"

/**
 * Zod validates a path's *shape*; nothing validates that the content it
 * points at exists. Before the MDX move, `docSlug` was a bare string and a
 * typo rendered a silently missing step. This runs from `generateStaticParams`
 * — i.e. during `next build` — so a broken reference fails the build instead.
 */

/** A step's identity for cross-locale comparison. */
const stepKey = (step: PathStep): string => `${step.type}:${step.slug}`

/** The structure a path must share across locales — only the copy may differ. */
const structureKey = (path: LearningPath): string =>
  path.sections.map((section) => `${section.id}[${section.steps.map(stepKey).join(",")}]`).join("|")

const collectBrokenReferences = (path: LearningPath, lang: string): readonly string[] => {
  const problems: string[] = []

  for (const step of flattenSteps(path)) {
    if (step.type === "doc") {
      if (source.getPage(step.slug.split("/"), lang) === undefined) {
        problems.push(`[${lang}] ${path.slug}: doc step "${step.slug}" does not resolve`)
      }
      continue
    }

    const challenge = playgroundSource.getPage([step.slug], lang)
    if (challenge === undefined) {
      problems.push(`[${lang}] ${path.slug}: challenge step "${step.slug}" does not resolve`)
    } else if (challenge.data.maturity !== "stable") {
      problems.push(
        `[${lang}] ${path.slug}: challenge step "${step.slug}" is "${challenge.data.maturity}", not stable`
      )
    }
  }

  return problems
}

const collectDuplicateIds = (path: LearningPath, lang: string): readonly string[] => {
  const seen = new Set<string>()
  const problems: string[] = []
  for (const section of path.sections) {
    if (seen.has(section.id)) {
      problems.push(`[${lang}] ${path.slug}: duplicate section id "${section.id}"`)
    }
    seen.add(section.id)
  }
  return problems
}

/**
 * Throws with every problem at once rather than the first — a single failing
 * build should tell an author everything they need to fix.
 */
export const validatePathCatalog = (): void => {
  const problems: string[] = []
  const structureByPath = new Map<string, { readonly lang: string; readonly key: string }>()

  for (const lang of i18n.languages) {
    for (const path of getAllPaths(lang)) {
      problems.push(...collectBrokenReferences(path, lang))
      problems.push(...collectDuplicateIds(path, lang))

      const key = structureKey(path)
      const previous = structureByPath.get(path.slug)
      if (previous === undefined) {
        structureByPath.set(path.slug, { lang, key })
      } else if (previous.key !== key) {
        problems.push(
          `${path.slug}: section structure diverges between "${previous.lang}" and "${lang}" — ` +
            `${previous.key} vs ${key}`
        )
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Invalid learning path catalog:\n  ${problems.join("\n  ")}`)
  }
}
