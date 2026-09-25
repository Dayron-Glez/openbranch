export const appName = "openbranch"
export const docsRoute = "/docs"
export const docsImageRoute = "/og/docs"
export const profileImageRoute = "/og/u"
export const siteImageRoute = "/og/site"
export const docsContentRoute = "/llms.mdx/docs"

/**
 * The canvas every OG card is rendered at, and the size the head declares for
 * it. Both halves have to agree: a scraper that is told no dimensions has to
 * guess the format before it downloads, and LinkedIn guesses small.
 */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

export const gitConfig = {
  user: "Dayron-Glez",
  repo: "openbranch",
  branch: "main",
}
