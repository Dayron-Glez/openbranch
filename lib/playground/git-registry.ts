import type { GitTemplate } from "./git-templates/git-merge-conflict"
import { gitMergeConflict } from "./git-templates/git-merge-conflict"

const GIT_REGISTRY: Record<string, GitTemplate> = {
  "git-merge-conflict": gitMergeConflict,
}

export const getGitTemplateBySlug = (slug: string): GitTemplate | null => GIT_REGISTRY[slug] ?? null
