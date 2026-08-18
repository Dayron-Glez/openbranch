import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { ConfettiEffect } from "@/features/playground/components/ConfettiEffect"
import { DiffBars } from "@/shared/DiffBars"
import { getChallengeIcon } from "@/features/playground/domain/challenge-icons"
import { formatElapsed } from "@/features/playground/domain/format-elapsed"
import { inferCategoryBadge } from "@/features/playground/domain/manifest"
import { getCompletionReward } from "@/features/playground/server/reward-service"
import { RewardMoment, type PathRecap } from "@/features/playground/components/RewardMoment"
import { BadgeUnlockDialog } from "@/features/playground/components/badges/BadgeUnlockDialog"
import { CheckIcon, ClockIcon } from "@/features/playground/components/ResultIcons"
import { source } from "@/lib/source"
import { buildPathRecap, type RecapStep } from "@/features/paths/domain/path-recap"
import { pathForChallenge } from "@/features/paths/server/path-catalog"
import { getReadDocSlugs } from "@/features/paths/server/doc-reads"
import { pathsDictionary, resolvePathsLocale } from "@/lib/dictionaries/paths"
import { LogoMark } from "@/shared/LogoMark"

type ResultPageProps = {
  readonly params: Promise<{ readonly lang: string; readonly slug: string }>
}

const DIFFICULTY_ORDER: Record<string, number> = { beginner: 0, moderate: 1, demanding: 2 }

type PlaygroundPage = ReturnType<typeof playgroundSource.getPages>[number]

/** Gentlest next step from a candidate set — null when nothing is left. */
const easiestOf = (candidates: readonly PlaygroundPage[]): PlaygroundPage | null =>
  [...candidates].sort(
    (a, b) =>
      (DIFFICULTY_ORDER[a.data.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.data.difficulty] ?? 0)
  )[0] ?? null

const titleOfStep = (step: RecapStep, lang: string): string =>
  step.type === "doc"
    ? (source.getPage(step.slug.split("/"), lang)?.data.title ?? step.slug)
    : (playgroundSource.getPage([step.slug], lang)?.data.title ?? step.slug)

const hrefOfStep = (step: RecapStep, lang: string): string =>
  step.type === "doc"
    ? (source.getPage(step.slug.split("/"), lang)?.url ?? localizedHref(lang, `/docs/${step.slug}`))
    : localizedHref(lang, `/playground/${step.slug}`)

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) =>
    playgroundSource
      .getPages(lang)
      .filter((page) => page.data.maturity === "stable")
      .map((page) => ({ lang, slug: page.slugs[0] }))
  )
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) return {}
  return { title: `${page.data.title} · openbranch` }
}

/* ── small icons ── */

const BranchIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="5" cy="4" r="1.5" />
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="11" cy="12" r="1.5" />
    <path d="M5 5.5v5" />
    <path d="M11 10.5V8a2 2 0 0 0-2-2H5" />
  </svg>
)

const TrackIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="10" width="3" height="4" rx="0.5" />
    <rect x="6.5" y="6" width="3" height="8" rx="0.5" />
    <rect x="11" y="2" width="3" height="12" rx="0.5" />
  </svg>
)

const ArrowRightIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

const ArrowLeftIcon = (): ReactNode => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
)

const BadgeStarIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="text-ob-accent size-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

const ChartIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="text-fg-muted size-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="12" width="4" height="9" rx="0.5" />
    <rect x="10" y="7" width="4" height="14" rx="0.5" />
    <rect x="17" y="3" width="4" height="18" rx="0.5" />
  </svg>
)

/* ── page ── */
export default async function ResultPage({ params }: ResultPageProps) {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user === null) {
    redirect(localizedHref(lang, `/playground/${slug}`))
  }

  const { data: completedSessions } = await supabase
    .from("challenge_sessions")
    .select("id, started_at, completed_at")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("lang", lang)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(1)

  const completedSession = completedSessions?.[0] ?? null

  if (completedSession === null) {
    redirect(localizedHref(lang, `/playground/${slug}/active`))
  }

  /* elapsed time */
  const startedAt =
    completedSession.started_at === null ? null : new Date(completedSession.started_at as string)
  const completedAt =
    completedSession.completed_at === null
      ? null
      : new Date(completedSession.completed_at as string)
  const elapsedSeconds =
    startedAt === null || completedAt === null
      ? null
      : Math.max(0, Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000))
  const elapsedDisplay = elapsedSeconds === null ? null : formatElapsed(elapsedSeconds)

  /* badge, next-challenge candidates, and reward — independent reads, run together */
  const badgeKey = inferCategoryBadge(slug)
  const [badgeResult, completedRowsResult, reward] = await Promise.all([
    badgeKey === null
      ? Promise.resolve({ data: null })
      : supabase
          .from("user_badges")
          .select("badge")
          .eq("user_id", user.id)
          .eq("badge", badgeKey)
          .maybeSingle(),
    supabase
      .from("challenge_sessions")
      .select("challenge_slug")
      .eq("user_id", user.id)
      .eq("status", "completed"),
    getCompletionReward(supabase, user.id, slug),
  ])

  const badge = badgeResult.data
  const completedSlugs = new Set(
    (completedRowsResult.data ?? []).map((r) => r.challenge_slug as string)
  )

  const allOthers = playgroundSource
    .getPages(lang)
    .filter((p) => p.data.maturity === "stable" && p.slugs[0] !== slug)

  const uncompleted = allOthers.filter((p) => !completedSlugs.has(p.slugs[0]))
  const buildsOnChallenge = easiestOf(
    uncompleted.filter((p) => p.data.category === page.data.category)
  )
  const newTrackChallenge = easiestOf(
    uncompleted.filter((p) => p.data.category !== page.data.category)
  )

  const dict = getPlaygroundDict(lang)
  const playgroundPath = localizedHref(lang, "/playground")
  const challengeBranch = page.data.pr_preview?.branch ?? null

  /* path recap — the completed challenge may sit anywhere in the path, so the
     model decides whether this finished it or merely advanced it. */
  const pathsLocale = resolvePathsLocale(lang)
  const pathsDict = pathsDictionary[pathsLocale]
  const matchedPath = pathForChallenge(slug, lang)

  let pathRecap: PathRecap | null = null
  if (matchedPath !== null) {
    // Guides count towards the recap now, so the read set is needed as well as
    // the completed challenges the page already loaded.
    const readDocSlugs = await getReadDocSlugs(supabase, user.id)
    const model = buildPathRecap(matchedPath, slug, {
      completedChallengeSlugs: completedSlugs,
      readDocSlugs,
    })
    const nextStep = model.nextStepIndex === null ? null : model.steps[model.nextStepIndex]

    pathRecap = {
      track: matchedPath.track,
      pathHref: localizedHref(lang, `/paths/${matchedPath.slug}`),
      pathTitle: matchedPath.title,
      otherPathsHref: playgroundPath,
      steps: model.steps.map((step) => ({
        type: step.type,
        title: titleOfStep(step, lang),
        status: step.status,
      })),
      doneCount: model.doneCount,
      totalSteps: model.totalSteps,
      nextStep:
        nextStep === undefined || nextStep === null
          ? null
          : { title: titleOfStep(nextStep, lang), href: hrefOfStep(nextStep, lang) },
    }
  }

  const badgeInfo =
    badge === null || badgeKey === null
      ? null
      : (dict.badges[badgeKey as keyof typeof dict.badges] as {
          readonly name: string
          readonly description: string
        })

  // The animated reveal takes over from the quiet static card above whenever
  // this completion actually earned something — track badge or milestone,
  // covers all 7 keys unlike `badgeInfo`, which only ever knows this
  // challenge's own track.
  const newlyEarnedKey = reward?.newlyEarnedBadgeKey ?? null
  const newlyEarnedInfo = newlyEarnedKey === null ? null : dict.badges[newlyEarnedKey]

  return (
    <main data-pg-main className="relative z-1 min-h-full overflow-x-hidden">
      {/* ambient glow — centered on the logo ring, not at the very top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 28%, color-mix(in oklab, var(--color-ob-accent) 11%, transparent), transparent 65%)",
        }}
      />

      <ConfettiEffect />

      {newlyEarnedInfo !== null && newlyEarnedKey !== null && (
        <BadgeUnlockDialog
          badgeKey={newlyEarnedKey}
          name={newlyEarnedInfo.name}
          description={newlyEarnedInfo.description}
          eyebrow={dict.reward.badgeUnlockedEyebrow}
          continueLabel={dict.reward.badgeUnlockedContinue}
          newTag={dict.reward.badgeNewTag}
        />
      )}

      <div className="relative mx-auto max-w-[900px] px-7 pt-12 pb-20 max-[520px]:px-5">
        {/* ── hero ── */}
        <div className="mb-16 text-center">
          {/* logo ring */}
          <div className="mb-8 flex justify-center">
            <div className="border-ob-accent/30 bg-ob-accent/[0.07] flex size-[80px] items-center justify-center rounded-full border-[1.5px]">
              <LogoMark size={36} />
            </div>
          </div>

          {/* heading */}
          <h1 className="text-fg mx-auto mb-4 max-w-[520px] text-[52px] leading-[1.08] font-semibold tracking-[-0.03em] max-[640px]:text-[38px]">
            {dict.result.heading}{" "}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #5EE39A 0%, #3ACC82 45%, #22C55E 100%)",
              }}
            >
              {dict.result.headingAccent}
            </span>
          </h1>

          {/* body */}
          <p className="text-fg-2 mx-auto mb-8 max-w-[500px] text-[16px] leading-[1.6]">
            {dict.result.body}
          </p>

          {/* stat chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* completed */}
            <span className="bg-ob-accent/[0.12] border-ob-accent/40 text-ob-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px]">
              <CheckIcon />
              {dict.result.statCompleted}
            </span>

            {/* time */}
            {elapsedDisplay !== null && (
              <span className="bg-bg-card border-line text-fg-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px]">
                <ClockIcon />
                {elapsedDisplay} {dict.result.statTimeTaken}
              </span>
            )}

            {/* branch */}
            {challengeBranch !== null && (
              <span className="bg-bg-card border-line text-fg-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px]">
                <BranchIcon />
                <code className="font-mono">{challengeBranch}</code>
                {dict.result.statChallengeBranch}
              </span>
            )}

            {/* track */}
            <span className="bg-bg-card border-line text-fg-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[12px]">
              <TrackIcon />
              {dict.category[page.data.category]} {dict.result.trackSuffix}
            </span>
          </div>

          <RewardMoment
            reward={reward}
            currentElapsedDisplay={elapsedDisplay}
            dict={dict.reward}
            pathRecap={pathRecap}
            pathDict={pathsDict}
          />

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {(buildsOnChallenge ?? newTrackChallenge) !== null && (
              <Link
                href={(buildsOnChallenge ?? newTrackChallenge)!.url}
                className="bg-ob-accent text-accent-ink inline-flex h-11 items-center gap-2 rounded-(--r-8) px-5 text-[14.5px] font-medium transition-[filter] hover:brightness-105"
              >
                {dict.result.nextChallengeCta}
                <ArrowRightIcon />
              </Link>
            )}
            <Link
              href={playgroundPath}
              className="bg-bg-card border-line hover:bg-bg-elev text-fg-2 hover:text-fg inline-flex h-11 items-center rounded-(--r-8) border px-5 text-[14.5px] font-medium transition-colors duration-(--d-fast) ease-(--ease)"
            >
              {dict.result.backToHub}
            </Link>
          </div>
        </div>

        {/* ── sections ── */}
        <div className="flex flex-col gap-4">
          {/* A newly earned badge is celebrated by the unlock dialog instead, so
              this quiet reference only stands in when the badge was already held. */}
          {badgeInfo !== null && badgeKey !== newlyEarnedKey && (
            <div className="bg-bg-card border-line flex items-start gap-3 rounded-(--r-12) border p-4">
              <BadgeStarIcon />
              <div>
                <p className="text-fg-muted mb-1 font-mono text-[10.5px] tracking-[0.08em] uppercase">
                  {dict.result.badgeEarnedLabel}
                </p>
                <p className="text-fg mb-0.5 text-[14.5px] font-medium">{badgeInfo.name}</p>
                <p className="text-fg-2 text-[13px]">{badgeInfo.description}</p>
              </div>
            </div>
          )}

          {/* detailed scoring coming soon */}
          <div className="bg-bg-card border-line flex items-start gap-4 rounded-(--r-12) border p-5">
            <div className="bg-bg-elev border-line flex size-9 shrink-0 items-center justify-center rounded-(--r-8) border">
              <ChartIcon />
            </div>
            <div>
              <p className="text-fg mb-1 text-[15px] font-medium">
                {dict.result.detailedScoringHeading}
              </p>
              <p className="text-fg-2 text-[13.5px] leading-[1.6]">
                {dict.result.detailedScoringBody}
              </p>
            </div>
          </div>

          {/* keep going */}
          {(buildsOnChallenge !== null || newTrackChallenge !== null) && (
            <div>
              <p className="text-fg-muted mt-4 mb-4 font-mono text-[11px] tracking-[0.1em] uppercase">
                {dict.result.keepGoing}
              </p>
              <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                {buildsOnChallenge !== null && (
                  <Link
                    href={buildsOnChallenge.url}
                    className="bg-bg-card border-line hover:border-line-2 group flex flex-col rounded-(--r-12) border p-5 transition-colors duration-(--d-fast) ease-(--ease)"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="bg-bg-elev border-line [&_svg]:text-fg-muted flex size-9 shrink-0 items-center justify-center rounded-(--r-8) border [&_svg]:size-[18px]">
                        {getChallengeIcon(buildsOnChallenge.data.icon)}
                      </div>
                      <span className="bg-bg-elev border-line text-fg-muted shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px]">
                        {dict.result.buildsOnThis}
                      </span>
                    </div>
                    <p className="text-fg mb-1.5 text-[15.5px] leading-[1.3] font-medium">
                      {buildsOnChallenge.data.title}
                    </p>
                    <p className="text-fg-2 mb-5 flex-1 text-[13px] leading-[1.55]">
                      {buildsOnChallenge.data.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-ob-accent flex items-center gap-2 font-mono text-[12px]">
                        <DiffBars difficulty={buildsOnChallenge.data.difficulty} />
                        {dict.difficulty[buildsOnChallenge.data.difficulty]}
                      </span>
                      <span className="text-fg-muted flex items-center gap-1 font-mono text-[12px]">
                        <ClockIcon />
                        {buildsOnChallenge.data.estimated_minutes}
                        {dict.time.minutes}
                      </span>
                    </div>
                  </Link>
                )}

                {newTrackChallenge !== null && (
                  <Link
                    href={newTrackChallenge.url}
                    className="bg-bg-card border-line hover:border-line-2 group flex flex-col rounded-(--r-12) border p-5 transition-colors duration-(--d-fast) ease-(--ease)"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="bg-bg-elev border-line [&_svg]:text-fg-muted flex size-9 shrink-0 items-center justify-center rounded-(--r-8) border [&_svg]:size-[18px]">
                        {getChallengeIcon(newTrackChallenge.data.icon)}
                      </div>
                      <span className="bg-bg-elev border-line text-fg-muted shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px]">
                        {dict.result.newTrack}
                      </span>
                    </div>
                    <p className="text-fg mb-1.5 text-[15.5px] leading-[1.3] font-medium">
                      {newTrackChallenge.data.title}
                    </p>
                    <p className="text-fg-2 mb-5 flex-1 text-[13px] leading-[1.55]">
                      {newTrackChallenge.data.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-ob-accent flex items-center gap-2 font-mono text-[12px]">
                        <DiffBars difficulty={newTrackChallenge.data.difficulty} />
                        {dict.difficulty[newTrackChallenge.data.difficulty]}
                      </span>
                      <span className="text-fg-muted flex items-center gap-1 font-mono text-[12px]">
                        <ClockIcon />
                        {newTrackChallenge.data.estimated_minutes}
                        {dict.time.minutes}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* all challenges */}
          <div className="mt-4 text-center">
            <Link
              href={playgroundPath}
              className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-2 font-mono text-[13px] transition-colors duration-(--d-fast) ease-(--ease)"
            >
              <ArrowLeftIcon />
              {dict.result.allChallenges}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
