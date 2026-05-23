const GH_STARS_CACHE_TTL = 60 * 60 * 1000

function formatStars(count: number): string {
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
    const value = formatStars(stargazers_count)
    setCached(key, value)
    return value
  } catch {
    return null
  }
}
