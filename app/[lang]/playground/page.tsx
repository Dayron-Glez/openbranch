import { Suspense, type ReactNode } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict, type PlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { ChallengeCard } from "@/features/playground/components/ChallengeCard"
import { StartingLine } from "@/features/playground/components/StartingLine"
import { BadgesSection } from "@/features/playground/components/BadgesSection"
import { StatsStrip } from "@/features/playground/components/StatsStrip"
import { SignInNudge } from "@/features/playground/components/SignInNudge"
import { getEngagementStats } from "@/features/playground/server/stats-service"
import { FilterBar } from "@/features/playground/components/FilterBar"
import { PlaygroundGridTransition } from "@/features/playground/components/PlaygroundGridTransition"
import { getChallengeIcon, getCategoryIcon } from "@/features/playground/domain/challenge-icons"
import {
  CATEGORY_ORDER,
  type CategoryKey,
  inferCategoryBadge,
  getTrackColorToken,
} from "@/features/playground/domain/manifest"

const DIFFICULTY_SORT: Record<string, number> = { beginner: 0, moderate: 1, demanding: 2 }

const VALID_SORTS = [
  "recommended",
  "difficulty-asc",
  "difficulty-desc",
  "duration-asc",
  "duration-desc",
] as const
type SortKey = (typeof VALID_SORTS)[number]

type PlaygroundPage = ReturnType<typeof playgroundSource.getPages>[number]

const applySort = (arr: readonly PlaygroundPage[], activeSort: SortKey): PlaygroundPage[] => {
  if (activeSort === "difficulty-asc") {
    return [...arr].sort(
      (a, b) =>
        (DIFFICULTY_SORT[a.data.difficulty] ?? 0) - (DIFFICULTY_SORT[b.data.difficulty] ?? 0)
    )
  }
  if (activeSort === "difficulty-desc") {
    return [...arr].sort(
      (a, b) =>
        (DIFFICULTY_SORT[b.data.difficulty] ?? 0) - (DIFFICULTY_SORT[a.data.difficulty] ?? 0)
    )
  }
  if (activeSort === "duration-asc") {
    return [...arr].sort((a, b) => a.data.estimated_minutes - b.data.estimated_minutes)
  }
  if (activeSort === "duration-desc") {
    return [...arr].sort((a, b) => b.data.estimated_minutes - a.data.estimated_minutes)
  }
  return [...arr]
}

type SessionStatus = "in_progress" | "completed"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

const loadUserPlaygroundData = async (
  supabase: SupabaseServerClient,
  userId: string
): Promise<{ slugToStatus: Map<string, SessionStatus>; earnedBadges: Set<string> }> => {
  const [{ data: sessions }, { data: badges }] = await Promise.all([
    supabase
      .from("challenge_sessions")
      .select("challenge_slug, status")
      .eq("user_id", userId)
      .in("status", ["in_progress", "completed"]),
    supabase.from("user_badges").select("badge").eq("user_id", userId),
  ])

  const slugToStatus = new Map<string, SessionStatus>()
  for (const s of sessions ?? []) {
    const slug = s.challenge_slug as string
    const status = s.status as SessionStatus
    if (slugToStatus.get(slug) !== "completed") slugToStatus.set(slug, status)
  }

  const earnedBadges = new Set<string>()
  for (const b of badges ?? []) earnedBadges.add(b.badge as string)
  for (const [slug, status] of slugToStatus) {
    if (status !== "completed") continue
    const badge = inferCategoryBadge(slug)
    if (badge !== null) earnedBadges.add(badge)
  }

  return { slugToStatus, earnedBadges }
}

const getStatusLabel = (s: SessionStatus | null, statusDict: PlaygroundDict["status"]): string => {
  if (s === "completed") return statusDict.completed
  if (s === "in_progress") return statusDict.inProgress
  return statusDict.notStarted
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/playground">>): Promise<Metadata> {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  }
}

export default async function PlaygroundPage({
  params,
  searchParams,
}: Readonly<PageProps<"/[lang]/playground">> & {
  readonly searchParams: Promise<{ readonly category?: string; readonly sort?: string }>
}) {
  const { lang } = await params
  const { category, sort } = await searchParams
  const dict = getPlaygroundDict(lang)

  const challenges = playgroundSource
    .getPages(lang)
    .filter((page) => page.data.maturity === "stable")

  const validCategories = new Set<string>(CATEGORY_ORDER)
  const activeCategory =
    category !== undefined && validCategories.has(category) ? (category as CategoryKey) : undefined

  const activeSort: SortKey =
    sort !== undefined && (VALID_SORTS as ReadonlyArray<string>).includes(sort)
      ? (sort as SortKey)
      : "recommended"

  const startingChallenge = [...challenges].sort(
    (a, b) =>
      (DIFFICULTY_SORT[a.data.difficulty] ?? 0) - (DIFFICULTY_SORT[b.data.difficulty] ?? 0) ||
      a.data.estimated_minutes - b.data.estimated_minutes
  )[0]

  const basePath = localizedHref(lang, "/playground")
  const startingLineBody = dict.startingLine.body.replace("{count}", String(challenges.length))

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const engagementStatsPromise = user === null ? null : getEngagementStats(supabase, user.id)

  const { slugToStatus, earnedBadges } =
    user === null
      ? { slugToStatus: new Map<string, SessionStatus>(), earnedBadges: new Set<string>() }
      : await loadUserPlaygroundData(supabase, user.id)

  const engagementStats = engagementStatsPromise === null ? null : await engagementStatsPromise

  const filterCategories = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: dict.category[cat],
    count: challenges.filter((c) => c.data.category === cat).length,
    icon: getCategoryIcon(cat),
    colorToken: getTrackColorToken(cat),
  })).filter(({ count }) => count > 0)

  const filteredChallenges =
    activeCategory !== undefined
      ? applySort(
          challenges.filter((c) => c.data.category === activeCategory),
          activeSort
        )
      : activeSort !== "recommended"
        ? applySort(challenges, activeSort)
        : []

  const showFlatGrid =
    activeCategory !== undefined || (activeSort !== "recommended" && activeSort !== undefined)

  const renderChallengeCard = (challenge: PlaygroundPage): ReactNode => {
    const slug = challenge.url.split("/").pop() ?? ""
    const status = slugToStatus.get(slug) ?? null
    return (
      <ChallengeCard
        key={challenge.url}
        href={challenge.url}
        title={challenge.data.title}
        description={challenge.data.description ?? ""}
        difficulty={challenge.data.difficulty}
        estimatedMinutes={challenge.data.estimated_minutes}
        icon={getChallengeIcon(challenge.data.icon)}
        colorToken={getTrackColorToken(challenge.data.category)}
        difficultyLabel={dict.difficulty[challenge.data.difficulty]}
        statusLabel={getStatusLabel(status, dict.status)}
        sessionStatus={status}
        minutesLabel={dict.time.minutes}
      />
    )
  }

  return (
    <main data-pg-main className="relative z-1 mx-auto max-w-275 px-8 py-25 max-[520px]:px-5">
      <Suspense fallback={null}>
        <PlaygroundGridTransition />
      </Suspense>

      <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.hub.eyebrow}
      </p>
      <div className="mb-[18px] flex items-baseline justify-between gap-8">
        <h1 className="m-0 text-[42px] leading-[1.05] font-medium tracking-[0] text-balance max-[980px]:text-[32px]">
          {dict.hub.heading} <span className="text-fg-2 font-light">{dict.hub.headingAccent}</span>
        </h1>
        <Link
          href={localizedHref(lang, "/playground/leaderboard")}
          className="text-fg-2 hover:text-fg inline-flex shrink-0 items-center gap-1.5 text-[13.5px] transition-colors"
        >
          {dict.hub.boardLink}
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <p className="text-fg-2 m-0 mb-10 max-w-[56ch] text-base leading-[1.55]">{dict.hub.intro}</p>

      {user === null ? (
        <div className="mb-10">
          <SignInNudge dict={dict.nudge} redirectPath={basePath} />
        </div>
      ) : (
        engagementStats !== null && (
          <div className="mb-10">
            <StatsStrip
              dict={dict.stats}
              categoryDict={dict.category}
              stats={engagementStats}
              totalChallenges={challenges.length}
              lang={lang}
            />
          </div>
        )
      )}

      {startingChallenge !== undefined && (
        <StartingLine
          href={startingChallenge.url}
          challengeTitle={startingChallenge.data.title}
          challengeIcon={getChallengeIcon(startingChallenge.data.icon)}
          challengeCategoryLabel={dict.category[startingChallenge.data.category]}
          challengeMinutes={startingChallenge.data.estimated_minutes}
          eyebrow={dict.startingLine.eyebrow}
          heading={dict.startingLine.heading}
          body={startingLineBody}
          cta={dict.startingLine.cta}
          minutesLabel={dict.time.minutes}
        />
      )}

      <FilterBar
        basePath={basePath}
        active={activeCategory}
        activeSort={activeSort}
        categories={filterCategories}
        total={challenges.length}
        allLabel={dict.hub.filterAll}
        sortDict={dict.hub.sort}
      />

      {showFlatGrid ? (
        <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
          {filteredChallenges.map(renderChallengeCard)}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {CATEGORY_ORDER.map((cat) => {
            const categoryChallenges = applySort(
              challenges.filter((c) => c.data.category === cat),
              activeSort
            )
            if (categoryChallenges.length === 0) return null
            return (
              <div key={cat}>
                <div className="text-fg-muted border-line mb-4 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
                  {dict.category[cat]}
                </div>
                <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
                  {categoryChallenges.map(renderChallengeCard)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeCategory === undefined && activeSort === "recommended" && (
        <div className="mt-14">
          <BadgesSection dict={dict.badges} earnedBadges={earnedBadges} />
        </div>
      )}
    </main>
  )
}
