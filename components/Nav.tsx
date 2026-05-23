"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { LogoMark } from "@/components/LogoMark"
import { IconSearch, IconGithub, IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Kbd } from "@/components/ui/kbd"

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
            <Kbd className="border-line bg-bg text-fg-muted gap-0.5 rounded-[var(--r-6)] font-mono text-[10.5px]">
              ⌘ K
            </Kbd>
          </button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={dict.githubAria}
            className="[&_svg]:size-4"
          >
            <a
              href="https://github.com/Dayron-Glez/openbranch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGithub />
            </a>
          </Button>
          {/* Full-document navigation: switching locale changes <html lang>,
              the i18n provider and the theme script — a hard context switch,
              not an in-app route change. */}
          <ToggleGroup
            type="single"
            value={current}
            onValueChange={(val) => {
              if (val && val !== current) window.location.href = localeHref[val as typeof current]
            }}
            className="border-line bg-bg-elev gap-0.5 rounded-[var(--r-8)] border p-0.5"
            aria-label={dict.switchLang}
          >
            {LOCALES.map((l) => (
              <ToggleGroupItem
                key={l}
                value={l}
                className="data-[state=on]:bg-accent-soft data-[state=on]:text-fg data-[state=off]:text-fg-muted h-auto rounded-[var(--r-6)] px-2 py-1 font-mono text-[11px] tracking-[0.04em]"
              >
                {l.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button
            asChild
            variant="accent"
            size="sm"
            className="group no-underline max-[520px]:hidden"
          >
            <Link href={localizedHref(lang, "/docs")}>
              {dict.getStarted}
              <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
