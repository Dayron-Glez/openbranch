import { gitMergeConflict } from "./git-templates/git-merge-conflict"
import { createChallengeRegistry } from "./create-registry"

export const getGitTemplateBySlug = createChallengeRegistry({
  "git-merge-conflict": gitMergeConflict,
})
