"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { IconSearch } from "@/icons"
import { Menu } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import { navDictionary, resolveNavLocale } from "@/lib/dictionaries/nav"

type MobileNavProps = {
  readonly lang: string
  readonly avatarUrl?: string | null
  readonly username?: string | null
}

const navLinkClass = (active: boolean): string =>
  `text-[15px] transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "text-fg font-medium" : "text-fg-muted hover:text-fg-2"
  }`

export const MobileNav = ({
  lang,
  avatarUrl = null,
  username = null,
}: MobileNavProps): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const { setOpenSearch } = useSearchContext()
  const dict = navDictionary[resolveNavLocale(lang)]
  const navDict = getLandingDict(lang).nav

  const inDocs = pathname.includes("/docs")
  const inPlayground = pathname.includes("/playground")
  const inPaths = pathname.includes("/paths")

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
        className="bg-bg-card border-line flex w-[280px] flex-col gap-6 sm:max-w-sm"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-fg-muted font-mono text-[11px] font-medium tracking-[0.1em] uppercase">
            {dict.menuTitle}
          </SheetTitle>
        </SheetHeader>

        {avatarUrl !== null && username !== null && (
          <Link
            href={localizedHref(lang, `/u/${username}`)}
            onClick={close}
            className="flex items-center gap-2.5 text-inherit no-underline"
          >
            <img
              src={avatarUrl}
              alt={username}
              className="size-8 rounded-full object-cover ring-1 ring-white/10"
            />
            <span className="text-fg text-[14px] font-medium">{username}</span>
          </Link>
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
          <Link
            href={localizedHref(lang, "/paths")}
            className={navLinkClass(inPaths)}
            onClick={close}
          >
            {dict.pathsLabel}
          </Link>
        </nav>

        <div className="bg-line -mx-6 h-px" />

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
      </SheetContent>
    </Sheet>
  )
}
