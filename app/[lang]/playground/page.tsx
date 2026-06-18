import { Suspense } from "react"
import type { ReactNode } from "react"
import type { Metadata } from "next"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { ChallengeCard } from "@/components/playground/ChallengeCard"
import { StartingLine } from "@/components/playground/StartingLine"
import { BadgesSection } from "@/components/playground/BadgesSection"
import { FilterBar } from "@/components/playground/FilterBar"
import { PlaygroundGridTransition } from "@/components/playground/PlaygroundGridTransition"
import { IconPR, IconBug, IconFlask, IconBook, IconBranch } from "@/icons"
import { getChallengeIcon } from "@/lib/playground/challenge-icons"

const CATEGORY_ORDER = ["code-review", "bug-fix", "testing", "git", "documentation"] as const

type CategoryKey = (typeof CATEGORY_ORDER)[number]

const CATEGORY_ICONS: Record<CategoryKey, ReactNode> = {
  "code-review": <IconPR />,
  "bug-fix": <IconBug />,
  testing: <IconFlask />,
  git: <IconBranch />,
  documentation: <IconBook />,
}

const DIFFICULTY_SORT: Record<string, number> = { beginner: 0, moderate: 1, demanding: 2 }

const VALID_SORTS = [
  "recommended",
  "difficulty-asc",
  "difficulty-desc",
  "duration-asc",
  "duration-desc",
] as const
type SortKey = (typeof VALID_SORTS)[number]

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

  const applySort = (arr: typeof challenges): typeof challenges => {
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
    return arr
  }

  const startingChallenge = [...challenges].sort(
    (a, b) =>
      (DIFFICULTY_SORT[a.data.difficulty] ?? 0) - (DIFFICULTY_SORT[b.data.difficulty] ?? 0) ||
      a.data.estimated_minutes - b.data.estimated_minutes
  )[0]

  const basePath = localizedHref(lang, "/playground")
  const startingLineBody = dict.startingLine.body.replace("{count}", String(challenges.length))

  const filterCategories = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: dict.category[cat],
    count: challenges.filter((c) => c.data.category === cat).length,
    icon: CATEGORY_ICONS[cat],
  })).filter(({ count }) => count > 0)

  const filteredChallenges =
    activeCategory !== undefined
      ? applySort(challenges.filter((c) => c.data.category === activeCategory))
      : activeSort !== "recommended"
        ? applySort(challenges)
        : []

  const showFlatGrid =
    activeCategory !== undefined || (activeSort !== "recommended" && activeSort !== undefined)

  return (
    <main data-pg-main className="relative z-1 mx-auto max-w-275 px-8 py-25 max-[520px]:px-5">
      <Suspense fallback={null}>
        <PlaygroundGridTransition />
      </Suspense>

      <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.hub.eyebrow}
      </p>
      <h1 className="m-0 mb-[18px] text-[42px] leading-[1.05] font-medium tracking-[0] text-balance max-[980px]:text-[32px]">
        {dict.hub.heading} <span className="text-fg-2 font-light">{dict.hub.headingAccent}</span>
      </h1>
      <p className="text-fg-2 m-0 mb-10 max-w-[56ch] text-base leading-[1.55]">{dict.hub.intro}</p>

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
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.url}
              href={challenge.url}
              title={challenge.data.title}
              description={challenge.data.description ?? ""}
              difficulty={challenge.data.difficulty}
              estimatedMinutes={challenge.data.estimated_minutes}
              icon={getChallengeIcon(challenge.data.icon)}
              difficultyLabel={dict.difficulty[challenge.data.difficulty]}
              statusLabel={dict.status.notStarted}
              minutesLabel={dict.time.minutes}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {CATEGORY_ORDER.map((cat) => {
            const categoryChallenges = applySort(challenges.filter((c) => c.data.category === cat))
            if (categoryChallenges.length === 0) return null
            return (
              <div key={cat}>
                <div className="text-fg-muted border-line mb-4 border-b pb-2.5 font-mono text-[11px] font-semibold tracking-[0.12em] uppercase">
                  {dict.category[cat]}
                </div>
                <div className="grid grid-cols-3 gap-4 max-[980px]:grid-cols-2 max-[640px]:grid-cols-1">
                  {categoryChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.url}
                      href={challenge.url}
                      title={challenge.data.title}
                      description={challenge.data.description ?? ""}
                      difficulty={challenge.data.difficulty}
                      estimatedMinutes={challenge.data.estimated_minutes}
                      icon={getChallengeIcon(challenge.data.icon)}
                      difficultyLabel={dict.difficulty[challenge.data.difficulty]}
                      statusLabel={dict.status.notStarted}
                      minutesLabel={dict.time.minutes}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeCategory === undefined && activeSort === "recommended" && (
        <div className="mt-14">
          <BadgesSection dict={dict.badges} />
        </div>
      )}
    </main>
  )
}
