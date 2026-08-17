import type { Metadata } from "next"
import Link from "next/link"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { createClient } from "@/lib/supabase/server"
import {
  LeaderboardTable,
  getLeaderboardSub,
} from "@/features/playground/components/LeaderboardTable"
import { getLeaderboard } from "@/features/playground/server/leaderboard-service"

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/playground/leaderboard">>): Promise<Metadata> {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)

  return {
    title: dict.leaderboard.metaTitle,
    description: dict.leaderboard.metaDescription,
  }
}

export default async function LeaderboardPage({
  params,
}: Readonly<PageProps<"/[lang]/playground/leaderboard">>) {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)
  const hubPath = localizedHref(lang, "/playground")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const leaderboard = await getLeaderboard(supabase, user?.id ?? null)
  const sub = getLeaderboardSub(dict.leaderboard, leaderboard)

  return (
    <main data-pg-main className="relative z-1 mx-auto max-w-275 px-8 pt-10 pb-12 max-[520px]:px-5">
      <div className="mx-auto max-w-[980px]">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
            <li>
              <Link href={hubPath} className="hover:text-fg-2 transition-colors">
                Playground
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li className="text-fg">{dict.leaderboard.title}</li>
          </ol>
        </nav>

        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5">
          <h1 className="m-0 text-[26px] leading-[1.1] font-medium tracking-[-0.01em] max-[640px]:text-[22px]">
            {dict.leaderboard.title}{" "}
            <span className="text-fg-2 font-light">— {dict.leaderboard.titleAccent}</span>
          </h1>
          {sub !== null && <p className="text-fg-muted m-0 text-[13px] leading-[1.5]">{sub}</p>}
        </div>

        <LeaderboardTable
          dict={dict.leaderboard}
          data={leaderboard}
          hubPath={hubPath}
          lang={lang}
        />

        <div className="mt-5 flex justify-center">
          <Link
            href={hubPath}
            className="text-fg-2 hover:text-fg inline-flex items-center gap-1.5 text-[13.5px] transition-colors"
          >
            <span aria-hidden>←</span> {dict.leaderboard.back}
          </Link>
        </div>
      </div>
    </main>
  )
}
