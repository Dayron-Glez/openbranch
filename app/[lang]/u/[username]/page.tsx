import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { profileImageRoute } from "@/lib/shared"
import { localizedHref } from "@/lib/landing-dictionary"
import { canonicalUrl } from "@/lib/seo"
import { playgroundSource } from "@/lib/playground-source"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { pathsDictionary, resolvePathsLocale } from "@/lib/dictionaries/paths"
import { getProfileDict, type ProfileDict } from "@/lib/dictionaries/profile"
import { formatRelativeDate } from "@/lib/relative-date"
import {
  CATEGORY_ORDER,
  getTrackColorToken,
  TOTAL_BADGE_COUNT,
  type CategoryKey,
} from "@/features/playground/domain/manifest"
import type { EngagementStats } from "@/features/playground/server/stats-service"
import { StatsStrip } from "@/features/playground/components/StatsStrip"
import { BadgesSection } from "@/features/playground/components/BadgesSection"
import { getAllPaths } from "@/features/paths/server/path-catalog"
import { buildPathCardItems } from "@/features/paths/server/path-cards"
import {
  getProfileActivityAndBadges,
  getProfileOverview,
  getProfilePathProgress,
  getProfileRank,
  type ProfileActivityEntry,
  type ProfileOverview,
} from "@/features/profiles/server/profile-service"
import { ProfileHeader } from "@/features/profiles/components/ProfileHeader"
import { CompletedPaths } from "@/features/profiles/components/CompletedPaths"
import { ActivityFeed, type ActivityItem } from "@/features/profiles/components/ActivityFeed"

/** The design's cap: a recency signal, not an archive. */
const FEED_LENGTH = 5

const isCategoryKey = (value: string | null): value is CategoryKey =>
  value !== null && (CATEGORY_ORDER as readonly string[]).includes(value)

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/u/[username]">>): Promise<Metadata> {
  const { lang, username } = await params
  const dict = getProfileDict(lang)
  return {
    title: dict.metaTitle(username),
    description: dict.metaDescription(username),
    alternates: { canonical: canonicalUrl(lang, `/u/${username}`) },
    openGraph: {
      images: `${profileImageRoute}/${username}`,
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

/**
 * Derived, not stored: the database already zeroes `current_streak` once the
 * last completion falls outside today-or-yesterday, so a positive streak is live.
 */
const streakStateOf = (overview: ProfileOverview): EngagementStats["streakState"] => {
  if (overview.completedCount === 0) return "none"
  return overview.currentStreak > 0 ? "alive" : "broken"
}

/**
 * `pointsToday` and `nextTrack` are blanked rather than sourced: both address
 * the viewer ("+40 today", "next up: X"), which is wrong on someone else's
 * page. `completedSub` replaces the latter.
 */
const toEngagementStats = (overview: ProfileOverview, tracksStarted: number): EngagementStats => ({
  totalPoints: overview.totalPoints,
  pointsToday: 0,
  completedCount: overview.completedCount,
  currentStreak: overview.currentStreak,
  bestStreak: overview.bestStreak,
  streakState: streakStateOf(overview),
  lastCompletedOn: overview.lastCompletedOn,
  tracksStarted,
  nextTrack: null,
})

/**
 * At this catalogue size someone can finish everything, so "6 of 6" gets its
 * own wording rather than reading as progress with more to do.
 */
const completedSubLine = (
  completedCount: number,
  totalChallenges: number,
  trackLabels: readonly string[],
  dict: ProfileDict
): string => {
  if (completedCount === 0) return dict.completedNone
  if (completedCount >= totalChallenges) return dict.completedAll
  return dict.completedInTracks(trackLabels.join(" · "))
}

const toActivityItems = (
  entries: readonly ProfileActivityEntry[],
  lang: string,
  categoryDict: ReturnType<typeof getPlaygroundDict>["category"],
  dict: ProfileDict
): readonly ActivityItem[] =>
  entries.map((entry) => {
    const category = isCategoryKey(entry.category) ? entry.category : null
    // Titles live in MDX, never in the database — the view carries only slugs.
    const page = playgroundSource.getPage([entry.challengeSlug], lang)
    return {
      challengeSlug: entry.challengeSlug,
      title: page?.data.title ?? entry.challengeSlug,
      trackLabel: category === null ? entry.challengeSlug : categoryDict[category],
      track: category === null ? null : getTrackColorToken(category),
      relativeDate: formatRelativeDate(new Date(entry.completedAt), lang, {
        today: dict.today,
        unknown: dict.unknownDate,
      }),
      points: entry.points,
    }
  })

export default async function ProfilePage({ params }: Readonly<PageProps<"/[lang]/u/[username]">>) {
  const { lang, username } = await params
  const dict = getProfileDict(lang)
  const pathsDict = pathsDictionary[resolvePathsLocale(lang)]
  const playgroundDict = getPlaygroundDict(lang)

  const supabase = await createClient()

  // Nothing below depends on who is looking: all public views, works signed out.
  const overview = await getProfileOverview(supabase, username)
  if (overview === null) notFound()

  const paths = getAllPaths(lang)
  const [{ activity, earnedBadges }, rank, pathProgress] = await Promise.all([
    getProfileActivityAndBadges(supabase, username),
    getProfileRank(supabase, username),
    getProfilePathProgress(supabase, username, paths),
  ])

  const totalChallenges = playgroundSource
    .getPages(lang)
    .filter((page) => page.data.maturity === "stable").length

  const completedCategories = CATEGORY_ORDER.filter((category) =>
    activity.some((entry) => entry.category === category)
  )

  const pathItems = await buildPathCardItems(paths, lang, playgroundDict.category, pathProgress)
  const completedPathItems = pathItems.filter(
    (item) =>
      item.progress !== null &&
      item.progress.total > 0 &&
      item.progress.done === item.progress.total
  )

  return (
    <main data-pg-main className="mx-auto max-w-215 px-7 py-14 max-[520px]:px-5">
      <div className="flex flex-col gap-6.5">
        <ProfileHeader
          overview={overview}
          rank={rank}
          leaderboardHref={localizedHref(lang, "/playground/leaderboard")}
          dict={dict}
          lang={lang}
        />

        <StatsStrip
          dict={dict.stats}
          categoryDict={playgroundDict.category}
          stats={toEngagementStats(overview, completedCategories.length)}
          totalChallenges={totalChallenges}
          lang={lang}
          completedSub={completedSubLine(
            overview.completedCount,
            totalChallenges,
            completedCategories.map((category) => playgroundDict.category[category]),
            dict
          )}
        />

        <BadgesSection
          dict={playgroundDict.badges}
          earnedBadges={earnedBadges}
          showLockMessage={false}
          headingNote={`${earnedBadges.size}/${TOTAL_BADGE_COUNT}`}
        />

        <CompletedPaths
          items={completedPathItems}
          dict={dict}
          cardDict={{
            shape: pathsDict.pathShape,
            stepsDone: pathsDict.stepsDone,
            progressFraction: pathsDict.progressFraction,
            nextStepLabel: pathsDict.nextStepLabel,
            routeComplete: pathsDict.routeComplete,
            stepsCount: pathsDict.stepsCount,
            minutesSuffix: playgroundDict.time.minutes,
          }}
        />

        <ActivityFeed
          items={toActivityItems(
            activity.slice(0, FEED_LENGTH),
            lang,
            playgroundDict.category,
            dict
          )}
          dict={dict}
        />
      </div>
    </main>
  )
}
