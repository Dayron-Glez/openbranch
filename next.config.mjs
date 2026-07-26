import { createMDX } from "fumadocs-mdx/next"

const withMDX = createMDX()

/**
 * The three v1 learning paths were one guide plus one challenge, paired by
 * track name rather than by skill. They are replaced by a single path that
 * follows one breaking change end to end, so their slugs 404 without this.
 */
const RETIRED_PATH_SLUGS = [
  "master-git-workflows",
  "review-like-a-maintainer",
  "test-with-confidence",
]

const CURRENT_PATH_SLUG = "the-life-of-a-breaking-change"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
  async redirects() {
    return RETIRED_PATH_SLUGS.flatMap((slug) => [
      { source: `/paths/${slug}`, destination: `/paths/${CURRENT_PATH_SLUG}`, permanent: true },
      {
        source: `/en/paths/${slug}`,
        destination: `/en/paths/${CURRENT_PATH_SLUG}`,
        permanent: true,
      },
    ])
  },
}

export default withMDX(config)
