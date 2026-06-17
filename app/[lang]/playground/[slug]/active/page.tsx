import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import { DiffViewer } from "@/components/playground/DiffViewer"
import { ChallengeChecklist } from "@/components/playground/ChallengeChecklist"
import { getDiffBySlug } from "@/lib/playground/diff-registry"

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
}: Readonly<PageProps<"/[lang]/playground/[slug]/active">>): Promise<Metadata> {
  const { lang, slug } = await params
  const page = playgroundSource.getPage([slug], lang)
  if (!page) return {}
  return { title: `${page.data.title} · openbranch` }
}

export default async function ActiveChallengePage({
  params,
}: Readonly<PageProps<"/[lang]/playground/[slug]/active">>) {
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

  const { data: session } = await supabase
    .from("challenge_sessions")
    .select("snapshot")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("lang", lang)
    .eq("status", "in_progress")
    .maybeSingle()

  if (session === null) {
    redirect(localizedHref(lang, `/playground/${slug}`))
  }

  const snapshot = session.snapshot as { checkedItems?: string[] } | null
  const initialChecked = snapshot?.checkedItems ?? []

  const dict = getPlaygroundDict(lang)
  const challengePath = localizedHref(lang, `/playground/${slug}`)
  const playgroundPath = localizedHref(lang, "/playground")
  const checklist = page.data.checklist ?? []
  const diffFiles = getDiffBySlug(slug)

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
              <Link href={playgroundPath} className="hover:text-fg-2 transition-colors">
                Playground
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <Link href={challengePath} className="hover:text-fg-2 transition-colors">
                {page.data.title}
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="size-[6px] rounded-full bg-amber-400" />
                {dict.status.inProgress}
              </span>
            </li>
          </ol>
        </nav>

        {/* two-column layout */}
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-[900px]:grid-cols-1">
          {/* ── left column: diff viewer ── */}
          <div className="min-w-0 min-[901px]:overflow-y-auto min-[901px]:pb-10">
            {diffFiles !== null ? (
              <DiffViewer files={diffFiles} />
            ) : (
              <div className="border-line bg-bg-elev flex h-full min-h-[200px] items-center justify-center rounded-[var(--r-12)] border border-dashed">
                <p className="text-fg-muted font-mono text-[12px]">Diff not available</p>
              </div>
            )}
          </div>

          {/* ── right column: checklist ── */}
          <aside className="max-[900px]:order-first min-[901px]:overflow-y-auto min-[901px]:pb-10">
            <div className="flex flex-col gap-6">
              {/* title + exit */}
              <div>
                <h1 className="text-fg mb-2 text-[20px] leading-[1.2] font-medium tracking-[-0.02em]">
                  {page.data.title}
                </h1>
                <Link
                  href={challengePath}
                  className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 3L5 8l5 5" />
                  </svg>
                  {dict.active.exitLabel}
                </Link>
              </div>

              <div className="border-line border-t" />

              {/* checklist */}
              {checklist.length > 0 ? (
                <ChallengeChecklist
                  items={checklist}
                  initialChecked={initialChecked}
                  slug={slug}
                  lang={lang}
                  dict={{
                    checklistHeading: dict.active.checklistHeading,
                    progress: dict.active.progress,
                    submitButton: dict.active.submitButton,
                    submitHint: dict.active.submitHint,
                  }}
                />
              ) : (
                <p className="text-fg-muted font-mono text-[12px]">{dict.status.inProgress}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
