const GH_STARS_CACHE_TTL = 60 * 60 * 1000

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return String(count)
}

function getCached(key: string): string | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { value, ts } = JSON.parse(raw) as { value: string; ts: number }
    return Date.now() - ts < GH_STARS_CACHE_TTL ? value : null
  } catch {
    return null
  }
}

function setCached(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }))
  } catch {
    // quota exceeded or storage unavailable
  }
}

export async function fetchGitHubStars(repo: string): Promise<string | null> {
  const key = `gh_stars_${repo}`
  const cached = getCached(key)
  if (cached) return cached

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
    if (!res.ok) return null
    const { stargazers_count } = (await res.json()) as { stargazers_count: number }
    const value = formatCount(stargazers_count)
    setCached(key, value)
    return value
  } catch {
    return null
  }
}

export async function fetchGitHubContributors(repo: string): Promise<string | null> {
  const key = `gh_contributors_${repo}`
  const cached = getCached(key)
  if (cached) return cached

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=1&anon=0`, {
      headers: { Accept: "application/vnd.github+json" },
    })
    if (!res.ok) return null

    const link = res.headers.get("link")
    let count: number

    if (link) {
      // Link header contains rel="last" with the total page count = total contributors
      const match = /[?&]page=(\d+)>;\s*rel="last"/.exec(link)
      count = match ? Number.parseInt(match[1], 10) : 1
    } else {
      // Fewer contributors than per_page — only one page exists
      count = ((await res.json()) as unknown[]).length
    }

    const value = formatCount(count)
    setCached(key, value)
    return value
  } catch {
    return null
  }
}
