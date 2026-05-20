import { gitConfig } from "@/lib/shared"
import type { Wanted } from "@/lib/wanted"

function buildIssueBody(wanted: Wanted): string {
  return `## Guide request

**Topic:** \`${wanted.topic}\`
**Estimated time:** ${wanted.est_minutes ? `~${wanted.est_minutes} min` : "unknown"}
**Requested by:** ${wanted.requested_count} readers

### Description

${wanted.description}

### Suggested outline

- Why it works
- What it looks like
- When not to use it
- Failure modes

---
_To contribute this guide, comment below and open a branch from this issue._`
}

export function buildIssueUrl(wanted: Wanted): string {
  const owner = process.env.NEXT_PUBLIC_REPO_OWNER ?? gitConfig.user
  const repo = process.env.NEXT_PUBLIC_REPO_NAME ?? gitConfig.repo

  const params = new URLSearchParams({
    title: `[guide] ${wanted.title}`,
    body: buildIssueBody(wanted),
    labels: "guide-wanted",
  })

  return `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`
}
