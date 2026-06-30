import type { ReactNode } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { getMDXComponents } from "@/components/docs/mdx"
import { StartChallengeButton } from "@/components/playground/StartChallengeButton"
import { PrPreviewCard } from "@/components/playground/PrPreviewCard"
import { createClient } from "@/lib/supabase/server"
import { getChallengeIcon } from "@/lib/playground/challenge-icons"

const DIFFICULTY_LEVEL: Record<string, number> = { beginner: 1, moderate: 2, demanding: 3 }

type DifficultyBarsProps = { readonly level: number; readonly label: string }

const DifficultyBars = ({ level, label }: DifficultyBarsProps): ReactNode => (
  <span className="inline-flex items-center gap-2">
    <span className="inline-flex h-3 items-end gap-[3px]">
      <i
        className={`block h-[5px] w-[3px] rounded-[1px] not-italic ${level >= 1 ? "bg-ob-accent" : "bg-fg-faint"}`}
      />
      <i
        className={`block h-2 w-[3px] rounded-[1px] not-italic ${level >= 2 ? "bg-ob-accent" : "bg-fg-faint"}`}
      />
      <i
        className={`block h-3 w-[3px] rounded-[1px] not-italic ${level >= 3 ? "bg-ob-accent" : "bg-fg-faint"}`}
      />
    </span>
    <span className="text-fg text-[13.5px]">{label}</span>
  </span>
)

const CheckIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="text-ob-accent size-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
)

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) =>
    playgroundSource
      .getPages(lang)
      .filter((page) => page.data.maturity === "stable")
      .map((page) => ({ lang, slug: page.slugs[0] }))
  )
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/playground/[slug]">>): Promise<Metadata> {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) return {}

  return {
    title: `${page.data.title} · openbranch`,
    description: page.data.description,
  }
}

export default async function ChallengePage({
  params,
}: Readonly<PageProps<"/[lang]/playground/[slug]">>) {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) notFound()

  const dict = getPlaygroundDict(lang)
  const MdxContent = page.data.body
  const playgroundHref = localizedHref(lang, "/playground")
  const challengePath = localizedHref(lang, `/playground/${slug}`)
  const activePath = localizedHref(lang, `/playground/${slug}/active`)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = user !== null
  const authUser =
    user !== null
      ? {
          username: (user.user_metadata?.user_name as string | undefined) ?? null,
          avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        }
      : null

  let sessionStatus: "in_progress" | "completed" | null = null
  if (user !== null) {
    const { data: sessions } = await supabase
      .from("challenge_sessions")
      .select("status")
      .eq("user_id", user.id)
      .eq("challenge_slug", slug)
      .in("status", ["in_progress", "completed"])
    const statuses = new Set((sessions ?? []).map((s) => s.status as string))
    if (statuses.has("in_progress")) {
      sessionStatus = "in_progress"
    } else if (statuses.has("completed")) {
      sessionStatus = "completed"
    }
  }

  const categoryLabel = dict.category[page.data.category]
  const difficultyLabel = dict.difficulty[page.data.difficulty]
  const difficultyLevel = DIFFICULTY_LEVEL[page.data.difficulty] ?? 1
  const icon = getChallengeIcon(page.data.icon)
  const skills = page.data.skills ?? []

  let sessionStatusBadge: React.ReactNode
  if (sessionStatus === "in_progress") {
    sessionStatusBadge = (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-amber-400">
        <span className="size-[6px] rounded-full bg-amber-400" />
        {dict.status.inProgress}
      </span>
    )
  } else if (sessionStatus === "completed") {
    sessionStatusBadge = (
      <span className="text-ob-accent inline-flex items-center gap-1.5 font-mono text-[11.5px]">
        <span className="bg-ob-accent size-[6px] rounded-full" />
        {dict.status.completed}
      </span>
    )
  } else {
    sessionStatusBadge = (
      <span className="text-fg-muted inline-flex items-center gap-1.5 font-mono text-[11.5px]">
        <span className="border-fg-faint size-[9px] rounded-full border-[1.5px]" />
        {dict.status.notStarted}
      </span>
    )
  }

  return (
    <main
      data-pg-main
      className="relative z-1 flex h-[calc(100dvh-48px)] flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col px-7 pt-10 max-[900px]:flex-none max-[900px]:pb-10 max-[520px]:px-5">
        {/* breadcrumb */}
        <nav className="mb-[22px] shrink-0" aria-label="Breadcrumb">
          <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
            <li>
              <Link href={playgroundHref} className="hover:text-fg-2 transition-colors">
                Playground
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <Link
                href={`${playgroundHref}?category=${page.data.category}`}
                className="hover:text-fg-2 transition-colors"
              >
                {categoryLabel}
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li className="text-fg-2 max-w-[40ch] truncate" aria-current="page">
              {page.data.title}
            </li>
          </ol>
        </nav>

        {/* two-column layout */}
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-[900px]:grid-cols-1">
          {/* ── left column ── */}
          <div className="pg-left-scroll min-[901px]:overflow-y-auto min-[901px]:pb-10">
            {/* category tag + status */}
            <div className="mb-3.5 flex items-center gap-3">
              <span className="border-accent-ring bg-accent-soft text-ob-accent inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[11px] [&_svg]:size-3 [&_svg]:shrink-0">
                {icon}
                {categoryLabel}
              </span>
              {sessionStatusBadge}
            </div>

            {/* title */}
            <h1 className="text-fg m-0 mb-3 text-[32px] leading-[1.08] font-medium tracking-[-0.02em] text-balance max-[640px]:text-[26px]">
              {page.data.title}
            </h1>

            {/* description / lead */}
            {page.data.description !== undefined && (
              <p className="text-fg-2 m-0 mb-6 max-w-[60ch] text-[16px] leading-[1.6]">
                {page.data.description}
              </p>
            )}

            {/* skill tags */}
            {skills.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-[7px]">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="border-line-2 bg-bg-elev text-fg-2 inline-flex items-center rounded-full border px-[9px] py-[3px] font-mono text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* PR preview card (code-review challenges) */}
            {page.data.pr_preview !== undefined && <PrPreviewCard data={page.data.pr_preview} />}

            {/* MDX prose body */}
            <div className="pg-prose">
              <MdxContent components={getMDXComponents()} />
            </div>

            {/* recommended first */}
            {page.data.recommended_first !== undefined && (
              <div className="mt-6">
                <p className="text-fg-muted mb-2 font-mono text-[11px] tracking-[0.08em] uppercase">
                  {dict.detail.recommendedFirst}
                </p>
                <div className="flex items-center gap-2.5">
                  <CheckIcon />
                  <span className="text-fg-2 text-[13.5px]">{page.data.recommended_first}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── sidebar ── */}
          <aside className="max-[900px]:order-first">
            <div className="flex flex-col gap-4">
              <div className="bg-bg-card border-line rounded-(--r-12) border p-[18px]">
                <StartChallengeButton
                  dict={dict.detail}
                  isAuthenticated={isAuthenticated}
                  sessionStatus={sessionStatus}
                  challengePath={challengePath}
                  activePath={activePath}
                  slug={slug}
                  lang={lang}
                  authUser={authUser}
                />

                <p className="text-fg-muted mt-2.5 mb-4 text-center font-mono text-[11px]">
                  {dict.detail.sandboxNote}
                </p>

                {/* kv metadata */}
                <div>
                  <div className="border-line flex items-center justify-between gap-3 border-b py-3">
                    <span className="text-fg-muted font-mono text-[11.5px] tracking-[0.04em] uppercase">
                      {dict.detail.metaCategory}
                    </span>
                    <span className="text-fg [&_svg]:text-fg-2 inline-flex items-center gap-2 text-[13.5px] [&_svg]:size-[15px] [&_svg]:shrink-0">
                      {icon}
                      {categoryLabel}
                    </span>
                  </div>

                  <div className="border-line flex items-center justify-between gap-3 border-b py-3">
                    <span className="text-fg-muted font-mono text-[11.5px] tracking-[0.04em] uppercase">
                      {dict.detail.metaDifficulty}
                    </span>
                    <DifficultyBars level={difficultyLevel} label={difficultyLabel} />
                  </div>

                  <div className="border-line flex items-center justify-between gap-3 border-b py-3">
                    <span className="text-fg-muted font-mono text-[11.5px] tracking-[0.04em] uppercase">
                      {dict.detail.metaTime}
                    </span>
                    <span className="text-fg inline-flex items-center gap-2 text-[13.5px]">
                      <svg
                        viewBox="0 0 24 24"
                        className="text-fg-2 size-[15px] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3.5 2" />
                      </svg>
                      {page.data.estimated_minutes} {dict.time.minutes}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-3">
                    <span className="text-fg-muted font-mono text-[11.5px] tracking-[0.04em] uppercase">
                      {dict.detail.metaValidation}
                    </span>
                    <span className="text-fg inline-flex items-center gap-2 text-[13.5px]">
                      <svg
                        viewBox="0 0 24 24"
                        className="text-fg-2 size-[15px] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <circle cx="12" cy="12" r="5" />
                        <circle cx="12" cy="12" r="1.2" />
                      </svg>
                      {page.data.validation}
                    </span>
                  </div>
                </div>
              </div>

              {/* card: You'll practice */}
              {skills.length > 0 && (
                <div className="bg-bg-card border-line rounded-(--r-12) border px-[18px] py-4">
                  <p className="text-fg-muted mb-3 font-mono text-[11px] tracking-[0.08em] uppercase">
                    {dict.detail.youllPractice}
                  </p>
                  <div className="flex flex-col gap-[11px]">
                    {skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-fg-2 text-[13.5px]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
