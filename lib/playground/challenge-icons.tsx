import type { ReactNode } from "react"
import { IconPR, IconBug, IconGitMerge, IconFlask, IconBook, IconBranch } from "@/icons"

const CHALLENGE_ICONS: Record<string, ReactNode> = {
  GitPullRequest: <IconPR />,
  Bug: <IconBug />,
  GitMerge: <IconGitMerge />,
  FlaskConical: <IconFlask />,
  BookOpen: <IconBook />,
}

export const getChallengeIcon = (iconName: string | undefined): ReactNode =>
  (iconName !== undefined && CHALLENGE_ICONS[iconName]) || <IconBranch />
