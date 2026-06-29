import type { ReactNode } from "react"
import { IconPR, IconBug, IconGitMerge, IconFlask, IconBook, IconBranch } from "@/icons"
import { CHALLENGE_TRACKS, type CategoryKey } from "./domain/manifest"

const ICON_BY_NAME: ReadonlyMap<string, ReactNode> = new Map<string, ReactNode>([
  ["GitPullRequest", <IconPR />],
  ["Bug", <IconBug />],
  ["GitMerge", <IconGitMerge />],
  ["FlaskConical", <IconFlask />],
  ["BookOpen", <IconBook />],
])

const DEFAULT_ICON: ReactNode = <IconBranch />

export const getChallengeIcon = (iconName: string | undefined): ReactNode =>
  (iconName !== undefined && ICON_BY_NAME.get(iconName)) || DEFAULT_ICON

const CATEGORY_ICON_MAP: ReadonlyMap<CategoryKey, ReactNode> = new Map(
  CHALLENGE_TRACKS.map((t) => [t.category, ICON_BY_NAME.get(t.iconName) ?? DEFAULT_ICON])
)

export const getCategoryIcon = (category: CategoryKey): ReactNode =>
  CATEGORY_ICON_MAP.get(category) ?? DEFAULT_ICON
