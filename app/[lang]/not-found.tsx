import type { ReactNode } from "react"
import Link from "next/link"
import { Nav } from "@/shared/Nav"
import { Footer } from "@/shared/Footer"
import { ScrollReveal } from "@/shared/ScrollReveal"
import { LogoMark } from "@/shared/LogoMark"
import { AmbientBackground } from "@/features/home/components/AmbientBackground"
import { IconArrowLeft, IconArrowRight, IconBook, IconFlask, IconRoute } from "@/icons"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import { getNotFoundDict } from "@/lib/dictionaries/not-found"

export default async function NotFound({
  params,
}: {
  readonly params?: Promise<{ readonly lang?: string }>
}): Promise<ReactNode> {
  const lang = (await params)?.lang ?? "es"
  const landingDict = getLandingDict(lang)
  const dict = getNotFoundDict(lang)

  const destinations = [
    {
      href: localizedHref(lang, "/docs"),
      title: dict.destDocsTitle,
      body: dict.destDocsBody,
      icon: <IconBook />,
    },
    {
      href: localizedHref(lang, "/playground"),
      title: dict.destPlaygroundTitle,
      body: dict.destPlaygroundBody,
      icon: <IconFlask />,
    },
    {
      href: localizedHref(lang, "/paths"),
      title: dict.destPathsTitle,
      body: dict.destPathsBody,
      icon: <IconRoute />,
    },
  ]

  const homeHref = lang === "en" ? "/en" : "/"

  return (
    <>
      <div className="notfound-ambient">
        <AmbientBackground />
      </div>
      <ScrollReveal />
      <Nav dict={landingDict.nav} lang={lang} />

      <main className="relative z-1 flex flex-1 items-center justify-center px-8 py-11 max-[520px]:px-5 max-[520px]:py-9">
        <div className="flex max-w-[600px] flex-col items-center text-center">
          <div
            className="border-accent-ring after:border-line relative mb-6 grid size-22 shrink-0 place-items-center rounded-(--r-full) border after:absolute after:-inset-[7px] after:rounded-(--r-full) after:border after:content-['']"
            style={{
              background:
                "radial-gradient(ellipse 100% 100% at 50% 20%, var(--color-accent-soft), transparent 75%), var(--color-bg-elev)",
            }}
          >
            <LogoMark size={48} broken />
          </div>

          <p className="text-fg-muted mb-3.5 inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase">
            <span className="bg-accent-soft text-ob-accent rounded-(--r-6) px-2 py-0.5 tracking-[0.1em]">
              {dict.eyebrowCode}
            </span>
            {dict.eyebrowLabel}
          </p>

          <h1 className="text-fg m-0 mb-3.5 max-w-[16ch] text-[36px] leading-[1.08] font-normal tracking-[-0.03em] text-balance max-[520px]:text-[28px]">
            {dict.headingLead} <span className="text-fg-2 font-light">{dict.headingQuiet}</span>
          </h1>

          <p className="text-fg-2 mx-auto mb-7 max-w-[46ch] text-[15.5px] leading-[1.55] text-pretty max-[520px]:text-[14.5px]">
            {dict.lead}
          </p>

          <div className="mb-5 grid w-full grid-cols-3 gap-3 max-[520px]:grid-cols-1">
            {destinations.map((dest) => (
              <Link
                key={dest.href}
                href={dest.href}
                className="group border-line bg-bg-card hover:border-line-2 hover:bg-bg-hover flex flex-col items-start gap-2 rounded-(--r-12) border p-3.5 text-left text-inherit no-underline transition-[border-color,background,transform] duration-(--d-base) ease-(--ease) hover:-translate-y-0.5 max-[520px]:flex-row max-[520px]:items-center max-[520px]:gap-3.5"
              >
                <span className="border-line bg-bg-elev text-fg-2 group-hover:border-accent-ring group-hover:bg-accent-soft group-hover:text-ob-accent inline-grid size-9 shrink-0 place-items-center rounded-(--r-8) border transition-colors duration-(--d-base) ease-(--ease) [&_svg]:size-[19px]">
                  {dest.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[15px] font-medium tracking-[-0.01em]">
                    {dest.title}
                    <IconArrowRight className="text-fg-faint group-hover:text-fg-2 ml-auto size-3.5 shrink-0 transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75 max-[520px]:hidden" />
                  </span>
                  <span className="text-fg-muted mt-0.5 block text-[12.5px] leading-[1.5] max-[520px]:hidden">
                    {dest.body}
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <Link
            href={homeHref}
            className="group text-fg-muted hover:text-fg hover:bg-bg-elev inline-flex items-center gap-1.75 rounded-(--r-6) px-2.5 py-1.5 font-mono text-[12.5px] no-underline transition-colors duration-(--d-fast) ease-(--ease)"
          >
            <IconArrowLeft className="size-3.25 transition-transform duration-(--d-fast) ease-(--ease) group-hover:-translate-x-0.75" />
            {dict.back}
          </Link>
        </div>
      </main>

      <Footer dict={landingDict.footer} lang={lang} compact />
    </>
  )
}
