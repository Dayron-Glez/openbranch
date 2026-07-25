"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { IconSearch, IconStar, IconDiscord, IconArrowRight } from "@/icons"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import { navDictionary, resolveNavLocale } from "@/lib/dictionaries/nav"
import { GH_URL, DISCORD_URL } from "@/lib/constants"

const LOCALES = ["es", "en"] as const

type MobileNavProps = {
  readonly lang: string
  readonly stars: string | null
  readonly showGetStarted?: boolean
  readonly avatarUrl?: string | null
  readonly username?: string | null
}

const navLinkClass = (active: boolean): string =>
  `text-[15px] transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "text-fg font-medium" : "text-fg-muted hover:text-fg-2"
  }`

const Divider = (): ReactElement => <div className="bg-line -mx-6 h-px" />

export const MobileNav = ({
  lang,
  stars,
  showGetStarted = false,
  avatarUrl = null,
  username = null,
}: MobileNavProps): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const { setOpenSearch } = useSearchContext()
  const dict = navDictionary[resolveNavLocale(lang)]
  const navDict = getLandingDict(lang).nav

  const current: "es" | "en" = lang === "en" ? "en" : "es"
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/"
  const localeHref: Record<"es" | "en", string> = {
    es: stripped,
    en: stripped === "/" ? "/en" : `/en${stripped}`,
  }

  const inDocs = pathname.includes("/docs")
  const inPlayground = pathname.includes("/playground")

  const close = (): void => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={dict.menuAria}
          aria-expanded={open}
          className="text-fg-2 border-line bg-bg-elev inline-flex size-8 items-center justify-center rounded-(--r-8) border min-[641px]:hidden"
        >
          <Menu className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-bg-card border-line flex w-[300px] flex-col gap-6 sm:max-w-sm"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-fg-muted font-mono text-[11px] font-medium tracking-[0.1em] uppercase">
            {dict.menuTitle}
          </SheetTitle>
        </SheetHeader>

        {(avatarUrl !== null || username !== null) && (
          <div className="flex items-center gap-2.5">
            {avatarUrl !== null && (
              <img
                src={avatarUrl}
                alt={username ?? "User"}
                className="size-8 rounded-full object-cover ring-1 ring-white/10"
              />
            )}
            {username !== null && (
              <span className="text-fg text-[14px] font-medium">{username}</span>
            )}
          </div>
        )}

        <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
          <Link
            href={localizedHref(lang, "/docs")}
            className={navLinkClass(inDocs)}
            onClick={close}
          >
            {dict.docsLabel}
          </Link>
          <Link
            href={localizedHref(lang, "/playground")}
            className={navLinkClass(inPlayground)}
            onClick={close}
          >
            {dict.playgroundLabel}
          </Link>
        </nav>

        <Divider />

        <button
          type="button"
          onClick={() => {
            close()
            setOpenSearch(true)
          }}
          className="border-line bg-bg-elev text-fg-muted inline-flex h-9 items-center gap-2 rounded-(--r-8) border px-3 text-[13px] [&_svg]:size-3.5 [&_svg]:shrink-0"
        >
          <IconSearch />
          <span className="min-w-0 flex-1 truncate text-left">{navDict.searchPlaceholder}</span>
        </button>

        <Divider />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={navDict.discordAria}
              className="text-fg-muted hover:text-fg-2 inline-flex size-8 items-center justify-center [&_svg]:size-4"
            >
              <IconDiscord className="text-[#5865F2]" />
            </a>
            <a
              href={GH_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={navDict.githubStarsAria}
              className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-1.5 text-[12px] [&_svg]:size-3.5"
            >
              <IconStar className="star-spin fill-amber-400 stroke-amber-400" />
              {stars !== null && <span className="font-mono tabular-nums">{stars}</span>}
            </a>
          </div>

          <ToggleGroup
            type="single"
            value={current}
            onValueChange={(val) => {
              if (val !== "" && val !== current)
                globalThis.location.href = localeHref[val as "es" | "en"]
            }}
            className="border-line bg-bg-elev h-8 w-fit gap-0.5 rounded-(--r-8) border px-0.5"
            aria-label={navDict.switchLang}
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

        {showGetStarted && (
          <Button asChild variant="accent" size="nav" className="group mt-auto w-full no-underline">
            <Link href={localizedHref(lang, "/docs")} onClick={close}>
              {navDict.getStarted}
              <IconArrowRight className="transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
            </Link>
          </Button>
        )}
      </SheetContent>
    </Sheet>
  )
}
