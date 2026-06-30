"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { LogoMark } from "@/shared/LogoMark"
import { IconSearch, IconStar, IconDiscord, IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { fetchGitHubStars } from "@/lib/github-stars"
import { GH_REPO, GH_URL, DISCORD_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const LOCALES = ["es", "en"] as const

type NavProps = {
  readonly dict: LandingDict["nav"]
  readonly lang: string
}

export function Nav({ dict, lang }: NavProps) {
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [stars, setStars] = useState<string | null>(null)
  const pathname = usePathname()
  const { setOpenSearch } = useSearchContext()
  const current = lang === "en" ? "en" : "es"
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  const localeHref: Record<string, string> = {
    es: stripped,
    en: stripped === "/" ? "/en" : `/en${stripped}`,
  }

  useEffect(() => {
    const onScroll = () => setScrolled(globalThis.scrollY > 8)
    globalThis.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => globalThis.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    fetchGitHubStars(GH_REPO)
      .then(setStars)
      .catch(() => null)
  }, [])

  const homeHref = lang === "en" ? "/en" : "/"

  return (
    <nav
      className={`bg-bg/80 sticky top-0 z-50 border-b backdrop-blur-xl transition-[border-color,background] duration-(--d-base) ease-(--ease) ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-350 items-center gap-8 px-4 py-3.5 max-[980px]:gap-4 max-[520px]:px-3">
        <Link
          href={homeHref}
          className="text-fg flex items-center gap-2.5 no-underline"
          aria-label="openbranch"
        >
          <LogoMark size={22} />
          <span className="text-base tracking-normal">
            <span className="text-fg-2 font-light">open</span>
            <span className="font-semibold">branch</span>
          </span>
        </Link>

        <Link
          href={localizedHref(lang, "/playground")}
          className={`font-mono text-[12.5px] transition-colors duration-(--d-fast) ease-(--ease) max-[640px]:hidden ${
            pathname.includes("/playground")
              ? "text-fg font-medium"
              : "text-fg-muted hover:text-fg-2"
          }`}
        >
          Playground
        </Link>

        <div className="ml-auto flex items-center gap-4 max-[520px]:gap-2">
          <button
            className="border-line bg-bg-elev text-fg-muted hover:border-line-2 hover:text-fg-2 inline-flex h-8 w-60 cursor-pointer items-center gap-2 rounded-(--r-8) border px-3 text-[12.5px] transition-colors duration-(--d-fast) ease-(--ease) max-[980px]:w-40 max-[640px]:hidden [&_svg]:size-3.5 [&_svg]:shrink-0"
            aria-label={dict.searchAria}
            onClick={() => setOpenSearch(true)}
          >
            <IconSearch />
            <span className="min-w-0 flex-1 truncate text-left">{dict.searchPlaceholder}</span>
            <Kbd className="border-line bg-bg text-fg-muted gap-0.5 rounded-(--r-6) font-mono text-[10.5px]">
              ⌘ K
            </Kbd>
          </button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={dict.discordAria}
                  className="[&_svg]:size-4"
                >
                  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                    <IconDiscord className="text-[#5865F2]" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{dict.discordTooltip}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  aria-label={dict.githubStarsAria}
                  className="h-8 gap-1.5 px-2.5 [&_svg]:size-3.5"
                >
                  <a href={GH_URL} target="_blank" rel="noopener noreferrer">
                    <IconStar className="star-spin fill-amber-400 stroke-amber-400" />
                    {stars !== null && (
                      <span className="font-mono text-[11px] tabular-nums max-[520px]:hidden">
                        {stars}
                      </span>
                    )}
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{dict.githubStarsTooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Full-document navigation: switching locale changes <html lang>,
              the i18n provider and the theme script â€” a hard context switch,
              not an in-app route change. */}
          <ToggleGroup
            type="single"
            value={current}
            onValueChange={(val) => {
              if (val && val !== current)
                globalThis.location.href = localeHref[val as typeof current]
            }}
            className="border-line bg-bg-elev h-8 gap-0.5 rounded-(--r-8) border px-0.5"
            aria-label={dict.switchLang}
          >
            {LOCALES.map((l) => (
              <ToggleGroupItem
                key={l}
                value={l}
                className="data-[state=on]:bg-accent-soft data-[state=on]:text-fg data-[state=off]:text-fg-muted h-6 rounded-(--r-6) px-2 font-mono text-[11px] tracking-[0.04em]"
              >
                {l.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button
            asChild
            variant="accent"
            size="nav"
            className="group no-underline max-[520px]:hidden"
          >
            <Link href={localizedHref(lang, "/docs")}>
              {dict.getStarted}
              <IconArrowRight className="transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
