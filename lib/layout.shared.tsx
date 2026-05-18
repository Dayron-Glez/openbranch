import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { appName, gitConfig } from "./shared"

// No `links`: the docs sidebar should show only the Fumadocs page tree
// (like fumadocs.dev itself). Top-level nav links here duplicated the tree
// and cluttered the sidebar.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
