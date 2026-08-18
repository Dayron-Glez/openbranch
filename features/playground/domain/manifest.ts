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

export const MILESTONE_BADGE_KEYS = ["streak-7", "all-tracks"] as const

const MILESTONE_BADGE_KEY_SET: ReadonlySet<string> = new Set(MILESTONE_BADGE_KEYS)

// Badges backed by a server action that awards them on challenge completion.
const AWARDED_BADGE_KEYS = [
  "first-merge",
  "review-corps",
  "coverage-hero",
  "ship-it",
  "doc-writer",
  "streak-7",
  "all-tracks",
] as const

// Badges planned for future tracks/features — displayed as locked teasers, not yet awardable.
const PLANNED_BADGE_KEYS = [] as const

/**
 * Lives here, not in `BadgesSection.tsx`, so it stays importable from server
 * components — a `"use client"` file's plain-value exports (as opposed to
 * its component exports) aren't safe to import into server code.
 */
export const BADGE_KEYS = [...AWARDED_BADGE_KEYS, ...PLANNED_BADGE_KEYS] as const

export type BadgeKey = (typeof BADGE_KEYS)[number]

/** Denominator for a "N of TOTAL" caption, derived so it cannot drift. */
export const TOTAL_BADGE_COUNT: number = BADGE_KEYS.length

/** Every category in CATEGORY_ORDER has exactly one track in CHALLENGE_TRACKS. */
export const getTrackColorToken = (category: CategoryKey): TrackColorToken =>
  TRACK_BY_CATEGORY.get(category)!.colorToken

export const inferCategoryBadge = (slug: string): string | null => {
  for (const track of CHALLENGE_TRACKS) {
    if (slug.startsWith(track.slugPrefix)) return track.badgeKey
  }
  return null
}

export const resolveEarnedBadges = ({
  completedChallengeSlugs,
  persistedBadges,
}: {
  readonly completedChallengeSlugs: Iterable<string>
  readonly persistedBadges: Iterable<string>
}): ReadonlySet<string> => {
  const earnedBadges = new Set<string>()

  for (const slug of completedChallengeSlugs) {
    const badge = inferCategoryBadge(slug)
    if (badge !== null) earnedBadges.add(badge)
  }

  for (const badge of persistedBadges) {
    if (MILESTONE_BADGE_KEY_SET.has(badge)) earnedBadges.add(badge)
  }

  return earnedBadges
}
