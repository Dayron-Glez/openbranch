import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { localizedHref } from "@/lib/landing-dictionary"
import { source } from "@/lib/source"
import { playgroundSource } from "@/lib/playground-source"
import { getReadingTime, formatReadingTime } from "@/lib/reading-time"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { pathsDictionary, type PathsLocale } from "@/lib/dictionaries/paths"
import { LEARNING_PATHS, PATH_BY_SLUG } from "@/features/paths/domain/paths"
import { computeStepStatuses } from "@/features/paths/domain/path-status"
import { PathStepper, type ResolvedPathStep } from "@/features/paths/components/PathStepper"
import { getPathProgress, getChallengePoints } from "@/features/paths/server/path-progress"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { CHALLENGE_TRACKS } from "@/features/playground/domain/manifest"
import { createClient } from "@/lib/supabase/server"
import { IconRoute, IconClock, IconUser } from "@/icons"

export function generateStaticParams(): { lang: string; slug: string }[] {
  return i18n.languages.flatMap((lang) => LEARNING_PATHS.map((p) => ({ lang, slug: p.slug })))
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/paths/[slug]">>): Promise<Metadata> {
  const { lang, slug } = await params
  const path = PATH_BY_SLUG.get(slug)
  if (path === undefined) return {}

  const locale = (lang as PathsLocale) in pathsDictionary ? (lang as PathsLocale) : "es"
  return {
    title: `${path.title[locale]} · openbranch`,
    description: path.lead[locale],
  }
}

export default async function PathPage({ params }: Readonly<PageProps<"/[lang]/paths/[slug]">>) {
  const { lang, slug } = await params
  const path = PATH_BY_SLUG.get(slug)
  if (path === undefined) notFound()

  const locale = (lang as PathsLocale) in pathsDictionary ? (lang as PathsLocale) : "es"
  const dict = pathsDictionary[locale]
  const playgroundDict = getPlaygroundDict(lang)
  const trackMeta = CHALLENGE_TRACKS.find((t) => t.colorToken === path.track)
  const trackLabel =
    trackMeta !== undefined ? playgroundDict.category[trackMeta.category] : path.track

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const challengeSlugs = path.steps
    .filter((s) => s.type === "challenge")
    .map((s) => s.challengeSlug)

  const [completedChallengeSlugs, pointsBySlug] = await Promise.all([
    user !== null ? getPathProgress(supabase, user.id, path) : Promise.resolve(null),
    getChallengePoints(supabase, challengeSlugs),
  ])

  const statuses = computeStepStatuses(path.steps, completedChallengeSlugs)

  const resolvedSteps: ResolvedPathStep[] = []
  let totalMinutes = 0

  for (const [index, step] of path.steps.entries()) {
    const status = statuses[index]
    if (step.type === "doc") {
      const docPage = source.getPage(step.docSlug.split("/"), lang)
      if (docPage === undefined) continue
      const rawText = await docPage.data.getText("processed")
      const minutes = getReadingTime(rawText)
      totalMinutes += minutes
      resolvedSteps.push({
        type: "doc",
        href: docPage.url,
        title: docPage.data.title,
        description: docPage.data.description ?? "",
        readingLabel: formatReadingTime(minutes, lang),
        status,
      })
    } else {
      const challengePage = playgroundSource.getPage([step.challengeSlug], lang)
      if (challengePage === undefined) continue
      const points = pointsBySlug.get(step.challengeSlug) ?? 0
      totalMinutes += challengePage.data.estimated_minutes
      resolvedSteps.push({
        type: "challenge",
        href: localizedHref(lang, `/playground/${step.challengeSlug}`),
        title: challengePage.data.title,
        description: challengePage.data.description ?? "",
        difficulty: challengePage.data.difficulty,
        difficultyLabel: playgroundDict.difficulty[challengePage.data.difficulty],
        timeLabel: `${challengePage.data.estimated_minutes} ${playgroundDict.time.minutes}`,
        pointsLabel: `+${points} pts`,
        icon: getChallengeIcon(challengePage.data.icon),
        status,
      })
    }
  }

  if (resolvedSteps.length === 0) notFound()

  const completedCount = challengeSlugs.filter(
    (s) => completedChallengeSlugs?.has(s) === true
  ).length
  const totalChallenges = challengeSlugs.length
  const firstStep = resolvedSteps[0]

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
            {path.title[locale]}
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
        {path.title[locale]}
      </h1>
      <p className="text-fg-2 m-0 mb-6 max-w-[60ch] text-[16px] leading-[1.6]">
        {path.lead[locale]}
      </p>

      <div className="border-line mb-7 flex flex-wrap items-center gap-5 border-b pb-6">
        <span className="text-fg-muted inline-flex items-center gap-2 font-mono text-[12px]">
          <IconRoute className="size-3.5" />
          {resolvedSteps.length} {locale === "es" ? "pasos" : "steps"}
        </span>
        <span className="text-fg-muted inline-flex items-center gap-2 font-mono text-[12px]">
          <IconClock className="size-3.5" />
          {`~${totalMinutes} min`}
        </span>
        {user !== null && (
          <span className="text-fg-muted ml-auto inline-flex items-center gap-3 font-mono text-[11.5px]">
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
            {dict.stepOf(1, resolvedSteps.length)} · {firstStep.title}
          </span>
        </div>
        <Link
          href={firstStep.href}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-(--r-8) bg-(--track) px-4.5 text-[14px] font-semibold text-(color:--track-ink) no-underline hover:brightness-110"
        >
          {dict.startThePath}
        </Link>
      </div>

      <PathStepper
        steps={resolvedSteps}
        track={path.track}
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
        }}
      />
    </main>
  )
}
