/**
 * Tells IndexNow which pages changed, so participating engines fetch them in
 * minutes instead of waiting for the next sitemap crawl. Bing, Yandex, Naver,
 * Seznam and Yep share submissions between them; Google never adopted the
 * protocol, so nothing here affects Google.
 *
 * Candidates derived from changed files are intersected with the live sitemap
 * before anything is sent: the sitemap is the single source of truth for what
 * is public, so a renamed or unpublished page can never be submitted.
 *
 * Usage:
 *   bun run scripts/indexnow.ts --since <sha>      — URLs that commit touched
 *   bun run scripts/indexnow.ts --files a.mdx b... — URLs for these files
 *   bun run scripts/indexnow.ts --all              — every URL in the sitemap
 *   …with --dry-run to print the submission without sending it
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { execFileSync } from "node:child_process"
import { SITE_URL } from "../lib/constants"

/** Public by design: it only proves control of the host that serves it. */
const KEY = "b18c943a0e5ce30bdf9196688be621a9"

const ENDPOINT = "https://api.indexnow.org/indexnow"

/** Content directory → the route its pages live under. */
const CONTENT_ROUTES: Readonly<Record<string, string>> = {
  "content/docs": "/docs",
  "content/paths": "/paths",
  "content/playground": "/playground",
}

const fail: (message: string) => never = (message) => {
  console.error(`✗ ${message}`)
  process.exit(1)
}

/**
 * A locale suffix picks the language; a bare `.mdx` is the default one, which
 * `hideLocale: "default-locale"` serves without a prefix.
 */
const toUrlPath = (file: string): string | null => {
  const normalized = file.replaceAll("\\", "/")
  const entry = Object.entries(CONTENT_ROUTES).find(([dir]) => normalized.startsWith(`${dir}/`))
  if (entry === undefined) return null

  const [dir, route] = entry
  const match = /^(.+?)(?:\.(en|es))?\.mdx$/.exec(normalized.slice(dir.length + 1))
  if (match === null) return null

  const [, slugPath, locale] = match
  const slug = slugPath.replace(/(^|\/)index$/, "")
  const path = slug === "" ? route : `${route}/${slug}`
  return locale === "en" ? `/en${path}` : path
}

const changedFiles = (sha: string): string[] =>
  execFileSync("git", ["diff", "--name-only", `${sha}^`, sha], { encoding: "utf8" })
    .split("\n")
    .filter((line) => line !== "")

const sitemapUrls = async (): Promise<Set<string>> => {
  const response = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!response.ok) fail(`the sitemap answered ${response.status}`)
  const xml = await response.text()
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
}

const submit = async (urlList: string[]): Promise<void> => {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(SITE_URL).host, key: KEY, urlList }),
  })
  // 202 means accepted while the key file is still being validated, which is
  // the normal answer to a first submission — not an error.
  if (response.status !== 200 && response.status !== 202) {
    fail(`IndexNow answered ${response.status}: ${await response.text()}`)
  }
  console.log(`✓ submitted ${urlList.length} URL(s) — HTTP ${response.status}`)
}

const main = async (): Promise<void> => {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")

  const keyFile = join(process.cwd(), "public", `${KEY}.txt`)
  if (!existsSync(keyFile) || readFileSync(keyFile, "utf8").trim() !== KEY) {
    fail(`public/${KEY}.txt must exist and contain exactly the key`)
  }

  const published = await sitemapUrls()
  let urls: string[]

  if (args.includes("--all")) {
    urls = [...published]
  } else {
    const sinceIndex = args.indexOf("--since")
    const filesIndex = args.indexOf("--files")
    let files: string[]
    if (sinceIndex !== -1) {
      files = changedFiles(args[sinceIndex + 1] ?? fail("--since needs a commit"))
    } else if (filesIndex !== -1) {
      files = args.slice(filesIndex + 1).filter((arg) => !arg.startsWith("--"))
    } else {
      fail("pass one of --since <sha>, --files <paths…> or --all")
    }

    const candidates = new Set(
      files
        .map(toUrlPath)
        .filter((path): path is string => path !== null)
        .map((path) => `${SITE_URL}${path}`)
    )
    urls = [...candidates].filter((url) => published.has(url))
  }

  if (urls.length === 0) {
    console.log("· no published URLs changed, nothing to submit")
    return
  }

  urls.forEach((url) => console.log(`  ${url}`))
  if (dryRun) {
    console.log(`· dry run — ${urls.length} URL(s) not submitted`)
    return
  }
  await submit(urls)
}

await main()
