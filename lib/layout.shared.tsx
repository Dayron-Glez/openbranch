import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import { appName, gitConfig } from "./shared"

// No `links` on purpose: they render into the docs sidebar, duplicating the
// page tree it already shows.
export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
