import { gitConfig } from "@/lib/shared"

export type Revision = {
  sha: string
  shortSha: string
  message: string
  authorLogin: string
  authorName: string
  authoredAt: string
  url: string
  version?: string
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d`
  const diffWk = Math.floor(diffDay / 7)
  if (diffWk < 4) return `${diffWk}w`
  const diffMo = Math.floor(diffDay / 30)
  if (diffMo < 12) return `${diffMo}mo`
  return `${Math.floor(diffDay / 365)}y`
}

const VERSION_RE = /^(v\d+\.\d+(?:\.\d+)?):\s*([^\r\n]+)/

function parseCommitMessage(raw: string): { message: string; version?: string } {
  const firstLine = raw.split("\n")[0].trim()
  const match = VERSION_RE.exec(firstLine)
  if (match) return { version: match[1], message: match[2] }
  return { message: firstLine }
}

export async function getRevisions(slug: string): Promise<Revision[] | null> {
  const { user, repo } = gitConfig
  const path = `content/docs/${slug}.mdx`
  const url = new URL(`https://api.github.com/repos/${user}/${repo}/commits`)
  url.searchParams.set("path", path)
  url.searchParams.set("per_page", "5")

  const res = await fetch(url.toString(), {
    headers: {
      ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: {
      revalidate: 3600,
      tags: [`revisions:${slug}`],
    },
  })

  if (res.status === 403) {
    console.warn(`[revisions] rate-limited for ${slug}, returning null`)
    return null
  }
  if (!res.ok) {
    console.error(`[revisions] GitHub API error ${res.status} for ${slug}`)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await res.json()

  return data.map((item) => {
    const raw: string = item.commit.message ?? ""
    const { message, version } = parseCommitMessage(raw)
    return {
      sha: item.sha as string,
      shortSha: (item.sha as string).slice(0, 7),
      message,
      version,
      authorLogin: (item.author?.login ?? item.commit.author?.name ?? "unknown") as string,
      authorName: (item.commit.author?.name ?? item.author?.login ?? "unknown") as string,
      authoredAt: (item.commit.author?.date ?? "") as string,
      url: (item.html_url ?? "") as string,
    }
  })
}
