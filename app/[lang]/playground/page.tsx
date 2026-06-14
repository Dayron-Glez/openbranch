import type { Metadata } from "next"
import { i18n } from "@/lib/i18n"
import { getPlaygroundDict } from "@/lib/playground-dictionary"

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
}: Readonly<PageProps<"/[lang]/playground">>) {
  const { lang } = await params
  const dict = getPlaygroundDict(lang)

  return (
    <main className="relative z-1 mx-auto max-w-275 px-8 py-25 max-[520px]:px-5">
      <p className="text-fg-muted font-mono text-[11px] tracking-[0.08em] uppercase">
        {dict.hub.eyebrow}
      </p>
      <h1 className="m-0 mb-[18px] text-[42px] leading-[1.05] font-medium tracking-[0] text-balance max-[980px]:text-[32px]">
        {dict.hub.heading} <span className="text-fg-2 font-light">{dict.hub.headingAccent}</span>
      </h1>
      <p className="text-fg-2 m-0 max-w-[56ch] text-base leading-[1.55]">{dict.hub.intro}</p>
    </main>
  )
}
