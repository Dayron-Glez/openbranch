import type { BaseLayoutProps, LinkItemType } from "fumadocs-ui/layouts/shared"
import { appName, gitConfig } from "./shared"

const navLinks: LinkItemType[] = [
  { type: "main", text: "Docs", url: "/docs", active: "url" },
  { type: "main", text: "Git", url: "/docs/git", active: "nested-url" },
  { type: "main", text: "Testing", url: "/docs/testing", active: "nested-url" },
  { type: "main", text: "Contributing", url: "/docs/contributing", active: "nested-url" },
]

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: appName },
    links: navLinks,
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  }
}
