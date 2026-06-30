import { gitMergeConflict } from "./git-templates/git-merge-conflict"
import { createChallengeRegistry } from "../../registry/create-registry"

export const getGitTemplateBySlug = createChallengeRegistry({
  "git-merge-conflict": gitMergeConflict,
})
