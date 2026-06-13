import { RequestOpts } from "./types"

// PR #214 — adds AbortController so slow upstreams no longer hang forever.
export const fetchUpstream = async (
  url: string,
  opts: RequestOpts = {}
): Promise<Response | null> => {
  const { headers = {}, timeoutMs = 5000 } = opts
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  console.log(`[DEBUG] fetching ${url}`)

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    })
    return response
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return null
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
