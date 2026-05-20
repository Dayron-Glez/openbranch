"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { LogoMark } from "@/components/LogoMark"
import { IconSearch, IconGithub, IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"

const navButton =
  "inline-flex h-[34px] items-center gap-2 rounded-[var(--r-8)] border border-transparent bg-ob-accent px-3.5 text-[13px] font-medium leading-none tracking-[0] text-accent-ink no-underline transition-[filter] duration-[var(--d-fast)] ease-[var(--ease)] hover:brightness-[1.06] [&_svg]:size-3.5"

const langSeg =
  "rounded-[var(--r-6)] px-2 py-1 font-mono text-[11px] tracking-[0.04em] transition-colors duration-[var(--d-fast)] ease-[var(--ease)]"

const LOCALES = ["es", "en"] as const

type NavProps = {
  readonly dict: LandingDict["nav"]
  readonly lang: string
}

export function Nav({ dict, lang }: NavProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { setOpenSearch } = useSearchContext()
  const current = lang === "en" ? "en" : "es"
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  const localeHref = {
    es: stripped,
    en: stripped === "/" ? "/en" : `/en${stripped}`,
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function isActiveExact(href: string) {
    return pathname === href
  }

  function isActivePrefix(href: string) {
    return pathname.startsWith(href)
  }

  const homeHref = lang === "en" ? "/en" : "/"

  return (
    <nav
      className={`bg-bg/80 sticky top-0 z-50 border-b backdrop-blur-xl transition-[border-color,background] duration-[var(--d-base)] ease-[var(--ease)] ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-8 px-8 py-3.5 max-[980px]:gap-4 max-[520px]:px-4">
        <Link
          href={homeHref}
          className="text-fg flex items-center gap-2.5 no-underline"
          aria-label="openbranch"
        >
          <LogoMark size={22} />
          <span className="text-base tracking-[0]">
            <span className="text-fg-2 font-light">open</span>
            <span className="font-semibold">branch</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 max-[980px]:hidden">
          {dict.links.map(({ path, label, exact }) => {
            const href = localizedHref(lang, path)
            return (
              <Link
                key={path}
                href={href}
                className={`hover:bg-bg-elev hover:text-fg rounded-[var(--r-6)] px-3 py-1.5 text-[13.5px] no-underline transition-colors duration-[var(--d-fast)] ease-[var(--ease)] ${
                  (exact ? isActiveExact(href) : isActivePrefix(href))
                    ? "bg-accent-soft text-fg"
                    : "text-fg-muted"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            className="border-line bg-bg-elev text-fg-muted hover:border-line-2 hover:text-fg-2 inline-flex h-8 w-60 cursor-pointer items-center gap-2 rounded-[var(--r-8)] border px-3 text-[12.5px] transition-colors duration-[var(--d-fast)] ease-[var(--ease)] max-[980px]:w-40 max-[640px]:hidden [&_svg]:size-3.5 [&_svg]:shrink-0"
            aria-label={dict.searchAria}
            onClick={() => setOpenSearch(true)}
          >
            <IconSearch />
            <span className="min-w-0 flex-1 truncate text-left">{dict.searchPlaceholder}</span>
            <span className="border-line bg-bg text-fg-muted inline-flex items-center gap-0.5 rounded-[var(--r-6)] border px-[5px] py-px font-mono text-[10.5px]">
              ⌘ K
            </span>
          </button>
          <a
            className="text-fg-muted hover:border-line hover:bg-bg-elev hover:text-fg inline-flex size-8 items-center justify-center rounded-[var(--r-8)] border border-transparent no-underline transition-[background,border-color,color] duration-[var(--d-fast)] ease-[var(--ease)] [&_svg]:size-4"
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.githubAria}
          >
            <IconGithub />
          </a>
          <fieldset className="border-line bg-bg-elev flex items-center gap-0.5 rounded-[var(--r-8)] border p-0.5">
            <legend className="sr-only">{dict.switchLang}</legend>
            {LOCALES.map((l) =>
              l === current ? (
                <span
                  key={l}
                  aria-current="true"
                  className={`${langSeg} bg-accent-soft text-fg cursor-default`}
                >
                  {l.toUpperCase()}
                </span>
              ) : (
                // Full-document navigation: switching locale changes <html lang>,
                // the i18n provider and the theme script — a hard context switch,
                // not an in-app route change. A soft <Link> transition would
                // remount <html>/RootProvider on the client and warn.
                <a
                  key={l}
                  href={localeHref[l]}
                  className={`${langSeg} text-fg-muted hover:bg-bg-hover hover:text-fg`}
                >
                  {l.toUpperCase()}
                </a>
              )
            )}
          </fieldset>
          <Link
            href={localizedHref(lang, "/docs")}
            className={`${navButton} group max-[520px]:hidden`}
          >
            {dict.getStarted}
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </Link>
        </div>
      </div>
    </nav>
  )
}
