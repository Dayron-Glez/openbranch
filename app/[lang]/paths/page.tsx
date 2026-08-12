import type { Metadata } from "next"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"
import { pathsDictionary, resolvePathsLocale } from "@/lib/dictionaries/paths"
import { getAllPaths } from "@/features/paths/server/path-catalog"
import { loadPathProgress } from "@/features/paths/server/path-progress"
import { buildPathCardItems } from "@/features/paths/server/path-cards"
import { PathCard, PATH_CARD_GRID } from "@/features/paths/components/PathCard"
import { createClient } from "@/lib/supabase/server"

export function generateStaticParams(): { lang: string }[] {
  return i18n.languages.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: Readonly<PageProps<"/[lang]/paths">>): Promise<Metadata> {
  const { lang } = await params
  const dict = pathsDictionary[resolvePathsLocale(lang)]
  return {
    title: `${dict.sectionHeading} · openbranch`,
    description: dict.indexIntro,
  }
}

export default async function PathsIndexPage({ params }: Readonly<PageProps<"/[lang]/paths">>) {
  const { lang } = await params
  const dict = pathsDictionary[resolvePathsLocale(lang)]
  const playgroundDict = getPlaygroundDict(lang)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const paths = getAllPaths(lang)
  const progress = user === null ? null : await loadPathProgress(supabase, user.id, paths)

  const items = buildPathCardItems(paths, lang, playgroundDict.category, progress)

  return (
    <main data-pg-main className="mx-auto max-w-[1000px] px-7 py-14 max-[520px]:px-5">
      <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.indexEyebrow}
      </p>
      <h1 className="text-fg m-0 mt-2 mb-4 text-[38px] leading-[1.08] font-medium tracking-[-0.025em] text-balance max-[640px]:text-[28px]">
        {dict.indexHeading}
      </h1>
      <p className="text-fg-2 m-0 mb-10 max-w-[62ch] text-[16px] leading-[1.6]">
        {dict.indexIntro}
      </p>

      <div className={PATH_CARD_GRID}>
        {items.map((item) => (
          <PathCard
            key={item.href}
            item={item}
            dict={{ shape: dict.pathShape, stepsDone: dict.stepsDone }}
          />
        ))}
      </div>
    </main>
  )
}
