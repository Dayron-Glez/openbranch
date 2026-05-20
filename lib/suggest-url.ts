import { gitConfig } from "@/lib/shared"

export function buildSuggestUrl(sectionName: string): string {
  const owner = process.env.NEXT_PUBLIC_REPO_OWNER ?? gitConfig.user
  const repo = process.env.NEXT_PUBLIC_REPO_NAME ?? gitConfig.repo

  const params = new URLSearchParams({
    template: "new-guide.md",
    title: `[guide] ${sectionName}: `,
  })

  return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`
}
