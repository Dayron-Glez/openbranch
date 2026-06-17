"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { LogoMark } from "@/components/shared/LogoMark"
import { IconSearch, IconStar, IconDiscord } from "@/icons"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { localizedHref } from "@/lib/landing-dictionary"
import { fetchGitHubStars } from "@/lib/github-stars"
import { GH_REPO, GH_URL, DISCORD_URL } from "@/lib/constants"

type PlaygroundNavProps = {
  readonly lang: string
  readonly avatarUrl: string | null
  readonly username: string | null
}

const LOCALES = ["es", "en"] as const

const navLinkClass = (active: boolean): string =>
  `font-mono text-[12.5px] transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "text-fg font-medium" : "text-fg-muted hover:text-fg-2"
  }`

export const PlaygroundNav = ({
  lang,
  avatarUrl,
  username,
}: PlaygroundNavProps): React.ReactElement => {
  const { setOpenSearch } = useSearchContext()
  const pathname = usePathname()
  const [stars, setStars] = useState<string | null>(null)
  const current: "es" | "en" = lang === "en" ? "en" : "es"
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  const localeHref: Record<"es" | "en", string> = {
    es: stripped,
    en: stripped === "/" ? "/en" : `/en${stripped}`,
  }
  const homeHref = lang === "en" ? "/en" : "/"
  const inPlayground = pathname.includes("/playground")
  const inDocs = pathname.includes("/docs")

  useEffect(() => {
    fetchGitHubStars(GH_REPO)
      .then(setStars)
      .catch(() => null)
  }, [])

  return (
    <header className="border-line bg-bg/80 z-10 shrink-0 border-b backdrop-blur-xl">
      <div className="mx-auto flex items-center gap-8 px-4 py-3.5 max-[980px]:gap-4 max-[520px]:px-3">
        {/* logo */}
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

        {/* nav links */}
        <nav
          className="flex items-center gap-6 max-[640px]:hidden"
          aria-label="Playground navigation"
        >
          <Link href={localizedHref(lang, "/docs")} className={navLinkClass(inDocs)}>
            Docs
          </Link>
          <Link href={localizedHref(lang, "/playground")} className={navLinkClass(inPlayground)}>
            Playground
          </Link>
        </nav>

        {/* right */}
        <div className="ml-auto flex items-center gap-4 max-[520px]:gap-2">
          {/* search */}
          <button
            onClick={() => setOpenSearch(true)}
            className="border-line bg-bg-elev text-fg-muted hover:border-line-2 hover:text-fg-2 inline-flex h-8 w-60 cursor-pointer items-center gap-2 rounded-(--r-8) border px-3 text-[12.5px] transition-colors duration-(--d-fast) ease-(--ease) max-[980px]:w-40 max-[640px]:hidden [&_svg]:size-3.5 [&_svg]:shrink-0"
            aria-label={lang === "en" ? "Search challenges" : "Buscar retos"}
          >
            <IconSearch />
            <span className="min-w-0 flex-1 truncate text-left">
              {lang === "en" ? "Search challenges..." : "Buscar retos..."}
            </span>
            <Kbd className="border-line bg-bg text-fg-muted gap-0.5 rounded-(--r-6) font-mono text-[10.5px]">
              ⌘ K
            </Kbd>
          </button>

          <TooltipProvider>
            {/* discord */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Discord"
                  className="[&_svg]:size-4"
                >
                  <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                    <IconDiscord className="text-[#5865F2]" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Discord</TooltipContent>
            </Tooltip>

            {/* github stars */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  aria-label="GitHub"
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
              <TooltipContent>GitHub</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* user avatar */}
          {avatarUrl !== null && (
            <img
              src={avatarUrl}
              alt={username ?? "User"}
              className="size-7 rounded-full object-cover ring-1 ring-white/10 max-[520px]:hidden"
            />
          )}

          {/* language toggle */}
          <ToggleGroup
            type="single"
            value={current}
            onValueChange={(val) => {
              if (val !== "" && val !== current)
                globalThis.location.href = localeHref[val as "es" | "en"]
            }}
            className="border-line bg-bg-elev h-8 gap-0.5 rounded-(--r-8) border px-0.5"
            aria-label="Switch language"
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
        </div>
      </div>
    </header>
  )
}
