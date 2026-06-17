import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { playgroundSource } from "@/lib/playground-source"
import { localizedHref } from "@/lib/landing-dictionary"

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

  const dict = getPlaygroundDict(lang)
  const challengePath = localizedHref(lang, `/playground/${slug}`)

  return (
    <main
      data-pg-main
      className="relative z-1 mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[1320px] flex-col px-7 pt-12 pb-16 max-[520px]:px-5"
    >
      {/* back link */}
      <Link
        href={challengePath}
        className="text-fg-muted hover:text-fg-2 mb-10 inline-flex w-fit items-center gap-1.5 font-mono text-[12px] transition-colors duration-(--d-fast) ease-(--ease)"
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
        {dict.detail.back}
      </Link>

      {/* status + title */}
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-[3px] font-mono text-[11px] text-amber-400">
          <span className="size-[6px] rounded-full bg-amber-400" />
          {dict.status.inProgress}
        </span>
      </div>

      <h1 className="text-fg m-0 mb-4 text-[32px] leading-[1.08] font-medium tracking-[-0.02em] text-balance max-[640px]:text-[26px]">
        {page.data.title}
      </h1>

      {/* placeholder content area */}
      <div className="border-line bg-bg-elev mt-4 flex flex-1 flex-col items-center justify-center gap-4 rounded-[var(--r-12)] border border-dashed">
        <svg
          viewBox="0 0 24 24"
          className="text-fg-faint size-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <p className="text-fg-muted max-w-[42ch] text-center font-mono text-[12px] leading-[1.7]">
          {dict.status.inProgress}
        </p>
      </div>
    </main>
  )
}
