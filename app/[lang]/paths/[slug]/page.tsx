import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { localizedHref } from "@/lib/landing-dictionary"
import { source } from "@/lib/source"
import { playgroundSource } from "@/lib/playground-source"
import { getReadingTime, formatReadingTime } from "@/lib/reading-time"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { pathsDictionary, resolvePathsLocale } from "@/lib/dictionaries/paths"
import {
  challengeSlugsOf,
  flattenSteps,
  type LearningPath,
  type PathStep,
} from "@/features/paths/domain/paths"
import { computeStepStatuses, type StepStatus } from "@/features/paths/domain/path-status"
import { PathStepper, type ResolvedPathStep } from "@/features/paths/components/PathStepper"
import { getPathProgress, getChallengePoints } from "@/features/paths/server/path-progress"
import {
  getAllPaths,
  getPath,
  getPathPage,
  toLearningPath,
} from "@/features/paths/server/path-catalog"
import { getMDXComponents } from "@/features/docs/components/mdx"
import { validatePathCatalog } from "@/features/paths/server/path-validation"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { CHALLENGE_TRACKS } from "@/features/playground/domain/manifest"
import { createClient } from "@/lib/supabase/server"
import { IconRoute, IconClock, IconUser } from "@/icons"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

export function generateStaticParams(): { lang: string; slug: string }[] {
  // Runs during `next build` — a broken doc/challenge reference fails here
  // rather than rendering a silently missing step.
  validatePathCatalog()
  return i18n.languages.flatMap((lang) =>
    getAllPaths(lang).map((path) => ({ lang, slug: path.slug }))
  )
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/paths/[slug]">>): Promise<Metadata> {
  const { lang, slug } = await params
  const path = getPath(slug, lang)
  if (path === null) return {}

  return {
    title: `${path.title} · openbranch`,
    description: path.lead,
  }
}

/** One step's display data, plus the minutes it adds to the path's total. */
const resolveStep = async (
  step: PathStep,
  status: StepStatus,
  lang: string,
  playgroundDict: PlaygroundDict,
  pointsBySlug: ReadonlyMap<string, number>
): Promise<{ readonly resolved: ResolvedPathStep; readonly minutes: number } | null> => {
  if (step.type === "doc") {
    const docPage = source.getPage(step.slug.split("/"), lang)
    if (docPage === undefined) return null
    const rawText = await docPage.data.getText("processed")
    const minutes = getReadingTime(rawText)
    return {
      minutes,
      resolved: {
        type: "doc",
        href: docPage.url,
        title: docPage.data.title,
        description: docPage.data.description ?? "",
        readingLabel: formatReadingTime(minutes, lang),
        status,
      },
    }
  }

  const challengePage = playgroundSource.getPage([step.slug], lang)
  if (challengePage === undefined) return null
  const points = pointsBySlug.get(step.slug) ?? 0
  return {
    minutes: challengePage.data.estimated_minutes,
    resolved: {
      type: "challenge",
      href: localizedHref(lang, `/playground/${step.slug}`),
      title: challengePage.data.title,
      description: challengePage.data.description ?? "",
      difficulty: challengePage.data.difficulty,
      difficultyLabel: playgroundDict.difficulty[challengePage.data.difficulty],
      timeLabel: `${challengePage.data.estimated_minutes} ${playgroundDict.time.minutes}`,
      pointsLabel: `+${points} pts`,
      icon: getChallengeIcon(challengePage.data.icon),
      status,
    },
  }
}

type ResolvedSection = {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly steps: readonly ResolvedPathStep[]
  /** Position of this section's first step in the whole path. */
  readonly startIndex: number
}

/**
 * Resolves every step in reading order, then slices the result back into
 * sections. Slicing before dropping unresolved steps is what keeps a section's
 * slice aligned with its own step count — the build-time validator means a
 * `null` should be impossible, but the ordering makes that assumption harmless.
 */
const resolvePathSections = async (
  path: LearningPath,
  statuses: readonly StepStatus[],
  lang: string,
  playgroundDict: PlaygroundDict,
  pointsBySlug: ReadonlyMap<string, number>
): Promise<{
  readonly sections: readonly ResolvedSection[]
  readonly totalMinutes: number
  readonly totalSteps: number
}> => {
  const resolved = await Promise.all(
    flattenSteps(path).map((step, index) =>
      resolveStep(step, statuses[index], lang, playgroundDict, pointsBySlug)
    )
  )

  let cursor = 0
  const sections = path.sections.map((section) => {
    const slice = resolved.slice(cursor, cursor + section.steps.length)
    const startIndex = cursor
    cursor += section.steps.length
    return {
      id: section.id,
      title: section.title,
      description: section.description,
      startIndex,
      steps: slice.filter((r) => r !== null).map((r) => r.resolved),
    }
  })

  const present = resolved.filter((r) => r !== null)
  return {
    sections,
    totalMinutes: present.reduce((sum, r) => sum + r.minutes, 0),
    totalSteps: present.length,
  }
}

export default async function PathPage({ params }: Readonly<PageProps<"/[lang]/paths/[slug]">>) {
  const { lang, slug } = await params
  const page = getPathPage(slug, lang)
  if (page === undefined) notFound()

  const path = toLearningPath(page)
  const PathProse = page.data.body

  const locale = resolvePathsLocale(lang)
  const dict = pathsDictionary[locale]
  const playgroundDict = getPlaygroundDict(lang)
  const trackMeta = CHALLENGE_TRACKS.find((t) => t.colorToken === path.track)
  const trackLabel =
    trackMeta !== undefined ? playgroundDict.category[trackMeta.category] : path.track

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const challengeSlugs = challengeSlugsOf(path)

  const [completedChallengeSlugs, pointsBySlug] = await Promise.all([
    user !== null ? getPathProgress(supabase, user.id, path) : Promise.resolve(null),
    getChallengePoints(supabase, challengeSlugs),
  ])

  const statuses = computeStepStatuses(flattenSteps(path), completedChallengeSlugs)
  const { sections, totalMinutes, totalSteps } = await resolvePathSections(
    path,
    statuses,
    lang,
    playgroundDict,
    pointsBySlug
  )

  if (totalSteps === 0) notFound()

  const completedCount = challengeSlugs.filter(
    (s) => completedChallengeSlugs?.has(s) === true
  ).length
  const totalChallenges = challengeSlugs.length
  const firstStep = sections.flatMap((section) => section.steps)[0]

  const playgroundHref = localizedHref(lang, "/playground")

  return (
    <main data-pg-main className="mx-auto max-w-[760px] px-7 py-10 max-[520px]:px-5">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
          <li>
            <Link href={playgroundHref} className="hover:text-fg-2 transition-colors">
              {dict.breadcrumbPlayground}
            </Link>
          </li>
          <li className="text-fg-faint" aria-hidden="true">
            /
          </li>
          <li>{dict.breadcrumbPaths}</li>
          <li className="text-fg-faint" aria-hidden="true">
            /
          </li>
          <li className="text-fg-2 max-w-[40ch] truncate" aria-current="page">
            {path.title}
          </li>
        </ol>
      </nav>

      {user === null && (
        <div className="border-line-2 bg-bg-elev mb-6 flex items-center gap-3 rounded-(--r-10) border p-4 text-[13.5px]">
          <IconUser className="text-fg-muted size-4 shrink-0" />
          <div className="text-fg-2">
            <b className="text-fg font-semibold">{dict.guestReading}</b> {dict.guestSignInPrompt}
          </div>
        </div>
      )}

      <div
        data-track={path.track}
        className="mb-4 flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.12em] uppercase"
      >
        <span className="size-2.5 rounded-full bg-(--track) shadow-[0_0_0_3px_var(--track-soft)]" />
        <span className="text-fg-muted">{dict.sectionHeading.replace(/s$/, "")}</span>
        <span className="text-fg-faint">·</span>
        <span className="text-(color:--track)">{trackLabel}</span>
      </div>

      <h1 className="text-fg m-0 mb-4 text-[34px] leading-[1.08] font-medium tracking-[-0.025em] text-balance max-[640px]:text-[27px]">
        {path.title}
      </h1>
      <p className="text-fg-2 m-0 mb-6 max-w-[60ch] text-[16px] leading-[1.6]">{path.lead}</p>

      <div className="pg-prose mb-7">
        <PathProse components={getMDXComponents()} />
      </div>

      <div className="border-line mb-7 flex flex-wrap items-center gap-5 border-b pb-6">
        <span className="text-fg-muted inline-flex items-center gap-2 font-mono text-[12px]">
          <IconRoute className="size-3.5" />
          {dict.stepsCount(totalSteps)}
        </span>
        <span className="text-fg-muted inline-flex items-center gap-2 font-mono text-[12px]">
          <IconClock className="size-3.5" />
          {`~${totalMinutes} min`}
        </span>
        {user !== null && (
          <span className="text-fg-muted inline-flex items-center gap-3 font-mono text-[11.5px] max-[640px]:w-full min-[640px]:ml-auto">
            {dict.practiced(completedCount, totalChallenges)}
            <span className="bg-bg-elev h-[5px] w-[110px] overflow-hidden rounded-full">
              <i
                className="bg-ob-accent block h-full rounded-full"
                style={{
                  width: `${totalChallenges === 0 ? 0 : Math.round((completedCount / totalChallenges) * 100)}%`,
                }}
              />
            </span>
          </span>
        )}
      </div>

      <div
        data-track={path.track}
        className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-(--r-12) border border-(--track-ring) bg-(--track-soft) p-5"
      >
        <div className="text-[14px]">
          <b className="font-semibold text-(color:--track)">{dict.startWithGuide}</b>
          <span className="text-fg-muted mt-0.5 block font-mono text-[11.5px]">
            {dict.stepOf(1, totalSteps)} · {firstStep.title}
          </span>
        </div>
        <Link
          href={firstStep.href}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-(--r-8) bg-(--track) px-4.5 text-[14px] font-semibold text-(color:--track-ink) no-underline hover:brightness-110 max-[520px]:w-full"
        >
          {dict.startThePath}
        </Link>
      </div>

      {sections.map((section, index) => (
        <section key={section.id} className={index === 0 ? "" : "mt-10"}>
          <div className="mb-5">
            <p className="text-fg-muted m-0 mb-2 font-mono text-[11px] tracking-[0.1em] uppercase">
              {dict.sectionOf(index + 1, sections.length)}
            </p>
            <h2 className="text-fg m-0 mb-2 text-[21px] leading-[1.2] font-semibold tracking-[-0.015em]">
              {section.title}
            </h2>
            {section.description !== undefined && (
              <p className="text-fg-muted m-0 max-w-[64ch] text-[14px] leading-[1.6]">
                {section.description}
              </p>
            )}
          </div>

          <PathStepper
            steps={section.steps}
            track={path.track}
            startIndex={section.startIndex}
            totalSteps={totalSteps}
            dict={{
              guideLabel: dict.guideLabel,
              challengeLabel: dict.challengeLabel,
              openGuide: dict.openGuide,
              openChallenge: dict.openChallenge,
              startChallenge: dict.startChallenge,
              youAreHere: dict.youAreHere,
              available: dict.available,
              completed: dict.completed,
              stepOf: dict.stepOf,
              needsWiderScreenTitle: dict.needsWiderScreenTitle,
            }}
          />
        </section>
      ))}
    </main>
  )
}
