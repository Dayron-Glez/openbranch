export const CATEGORY_ORDER = ["code-review", "bug-fix", "testing", "git", "documentation"] as const

export type CategoryKey = (typeof CATEGORY_ORDER)[number]

/** Identity hue tokens on the OKLCH ring — see specs/color-tokens-badges.md. */
export const TRACK_COLOR_TOKENS = ["git", "review", "docs", "bugfix", "test"] as const

export type TrackColorToken = (typeof TRACK_COLOR_TOKENS)[number]

export type ChallengeTrackMeta = {
  readonly category: CategoryKey
  /** Value of the `icon` field in MDX frontmatter. */
  readonly iconName: string
  /** Badge awarded when any challenge in this track is completed. */
  readonly badgeKey: string
  /** Common slug prefix shared by all challenges in this track. */
  readonly slugPrefix: string
  /** `data-track` value resolving this track's identity hue. */
  readonly colorToken: TrackColorToken
}

export const CHALLENGE_TRACKS: readonly ChallengeTrackMeta[] = [
  {
    category: "code-review",
    iconName: "GitPullRequest",
    badgeKey: "review-corps",
    slugPrefix: "code-review-",
    colorToken: "review",
  },
  {
    category: "bug-fix",
    iconName: "Bug",
    badgeKey: "ship-it",
    slugPrefix: "bug-fix-",
    colorToken: "bugfix",
  },
  {
    category: "testing",
    iconName: "FlaskConical",
    badgeKey: "coverage-hero",
    slugPrefix: "testing-",
    colorToken: "test",
  },
  {
    category: "git",
    iconName: "GitMerge",
    badgeKey: "first-merge",
    slugPrefix: "git-",
    colorToken: "git",
  },
  {
    category: "documentation",
    iconName: "BookOpen",
    badgeKey: "doc-writer",
    slugPrefix: "docs-",
    colorToken: "docs",
  },
]

export const TRACK_BY_CATEGORY: ReadonlyMap<CategoryKey, ChallengeTrackMeta> = new Map(
  CHALLENGE_TRACKS.map((t) => [t.category, t])
)

export const TRACK_BY_BADGE_KEY: ReadonlyMap<string, ChallengeTrackMeta> = new Map(
  CHALLENGE_TRACKS.map((t) => [t.badgeKey, t])
)

export const inferCategoryBadge = (slug: string): string | null => {
  for (const track of CHALLENGE_TRACKS) {
    if (slug.startsWith(track.slugPrefix)) return track.badgeKey
  }
  return null
}
