import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"

type ResultPageProps = {
  readonly params: Promise<{ readonly lang: string; readonly slug: string }>
}

const DIFFICULTY_ORDER: Record<string, number> = { beginner: 0, moderate: 1, demanding: 2 }

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

const SuccessIcon = (): ReactNode => (
  <div className="border-ob-accent/20 bg-ob-accent/10 mb-8 flex size-14 items-center justify-center rounded-full border">
    <svg
      viewBox="0 0 24 24"
      className="text-ob-accent size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  </div>
)

const BadgeIcon = (): ReactNode => (
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

const ArrowIcon = (): ReactNode => (
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

  const { data: completedSession } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("lang", lang)
    .eq("status", "completed")
    .maybeSingle()

  if (completedSession === null) {
    redirect(localizedHref(lang, `/playground/${slug}/active`))
  }

  const { data: badge } = await supabase
    .from("user_badges")
    .select("badge")
    .eq("user_id", user.id)
    .eq("badge", "review-corps")
    .maybeSingle()

  const { data: completedRows } = await supabase
    .from("challenge_sessions")
    .select("challenge_slug")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const completedSlugs = new Set((completedRows ?? []).map((r) => r.challenge_slug as string))

  const allChallenges = playgroundSource
    .getPages(lang)
    .filter((p) => p.data.maturity === "stable" && p.slugs[0] !== slug)

  const nextChallenge =
    allChallenges
      .filter((p) => !completedSlugs.has(p.slugs[0]))
      .sort(
        (a, b) =>
          (DIFFICULTY_ORDER[a.data.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.data.difficulty] ?? 0)
      )[0] ??
    allChallenges.sort(
      (a, b) =>
        (DIFFICULTY_ORDER[a.data.difficulty] ?? 0) - (DIFFICULTY_ORDER[b.data.difficulty] ?? 0)
    )[0]

  const dict = getPlaygroundDict(lang)
  const playgroundPath = localizedHref(lang, "/playground")
  const challengePath = localizedHref(lang, `/playground/${slug}`)

  return (
    <main
      data-pg-main
      className="relative z-1 mx-auto w-full max-w-[580px] px-7 py-20 max-[520px]:px-5"
    >
      <SuccessIcon />

      <p className="text-fg-muted mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.result.eyebrow}
      </p>

      <h1 className="text-fg m-0 mb-4 text-[42px] leading-[1.05] font-medium tracking-[-0.02em] max-[640px]:text-[32px]">
        {dict.result.heading}
      </h1>

      <p className="text-fg-2 m-0 mb-10 text-[16px] leading-[1.6]">{dict.result.body}</p>

      {/* badge */}
      {badge !== null && (
        <div className="bg-bg-card border-line mb-8 flex items-start gap-3 rounded-[var(--r-12)] border p-4">
          <BadgeIcon />
          <div>
            <p className="text-fg-muted mb-1 font-mono text-[10.5px] tracking-[0.08em] uppercase">
              {dict.result.badgeEarnedLabel}
            </p>
            <p className="text-fg mb-0.5 text-[14.5px] font-medium">
              {dict.badges["review-corps"].name}
            </p>
            <p className="text-fg-2 text-[13px]">{dict.badges["review-corps"].description}</p>
          </div>
        </div>
      )}

      {/* next challenge */}
      {nextChallenge !== undefined && (
        <div className="mb-10">
          <p className="text-fg-muted mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
            {dict.result.nextChallengeLabel}
          </p>
          <Link
            href={nextChallenge.url}
            className="bg-bg-card border-line hover:border-line-2 group flex items-center justify-between gap-4 rounded-[var(--r-12)] border p-4 transition-colors duration-(--d-fast) ease-(--ease)"
          >
            <div className="min-w-0">
              <p className="text-fg truncate text-[14.5px] font-medium">
                {nextChallenge.data.title}
              </p>
              <p className="text-fg-muted mt-0.5 font-mono text-[11.5px]">
                {dict.category[nextChallenge.data.category]} ·{" "}
                {dict.difficulty[nextChallenge.data.difficulty]}
              </p>
            </div>
            <span className="text-fg-muted group-hover:text-fg-2 shrink-0 transition-colors duration-(--d-fast)">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      )}

      {/* actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={playgroundPath}
          className="border-line bg-bg-card hover:bg-bg-elev text-fg-2 hover:text-fg inline-flex h-10 items-center rounded-[var(--r-8)] border px-4 font-mono text-[13px] transition-colors duration-(--d-fast) ease-(--ease)"
        >
          {dict.result.backToHub}
        </Link>
        <Link
          href={challengePath}
          className="text-fg-muted hover:text-fg-2 inline-flex h-10 items-center font-mono text-[13px] transition-colors duration-(--d-fast) ease-(--ease)"
        >
          {dict.result.practiceAgain}
        </Link>
      </div>
    </main>
  )
}
