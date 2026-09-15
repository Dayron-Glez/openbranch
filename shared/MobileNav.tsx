"use client"

import type { ReactElement } from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSearchContext } from "fumadocs-ui/contexts/search"
import { IconSearch, IconGithub } from "@/icons"
import { Menu } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import { navDictionary, resolveNavLocale } from "@/lib/dictionaries/nav"
import { authDictionary, resolveAuthLocale } from "@/lib/dictionaries/auth"
import { SignOutButton } from "@/shared/SignOutButton"

type MobileNavProps = {
  readonly lang: string
  readonly avatarUrl?: string | null
  readonly username?: string | null
  /**
   * Whether the session is known. Left undefined by the landing nav, which
   * never reads the session — rendering "sign in" there would show it to
   * people who are already signed in.
   */
  readonly signedIn?: boolean
}

const navLinkClass = (active: boolean): string =>
  `text-base transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "text-fg font-medium" : "text-fg-muted hover:text-fg-2"
  }`

export const MobileNav = ({
  lang,
  avatarUrl = null,
  username = null,
  signedIn,
}: MobileNavProps): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const { setOpenSearch } = useSearchContext()
  const dict = navDictionary[resolveNavLocale(lang)]
  const navDict = getLandingDict(lang).nav
  const authDict = authDictionary[resolveAuthLocale(lang)]

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
          className="text-fg-2 border-line bg-bg-elev inline-flex size-8 items-center justify-center rounded-(--r-8) border sm:hidden"
        >
          <Menu className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-bg-card border-line flex w-[280px] flex-col gap-6 sm:max-w-sm"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-fg-muted text-2xs font-mono font-medium tracking-[0.08em] uppercase">
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
            <span className="text-fg text-sm font-medium">{username}</span>
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
          className="border-line bg-bg-elev text-fg-muted inline-flex h-9 items-center gap-2 rounded-(--r-8) border px-3 text-sm [&_svg]:size-3.5 [&_svg]:shrink-0"
        >
          <IconSearch />
          <span className="min-w-0 flex-1 truncate text-left">{navDict.searchPlaceholder}</span>
        </button>

        {/* The challenge page's sign-in sits inside WorkspaceOnly, so below
            900px this sheet was the only place left with room for it. */}
        {signedIn === true && (
          <SignOutButton
            dict={authDict}
            redirectTo={localizedHref(lang, "/playground")}
            className="text-fg-muted hover:text-danger self-start text-base transition-colors duration-(--d-fast) ease-(--ease)"
          />
        )}
        {signedIn === false && (
          <Link
            href={localizedHref(lang, `/login?next=${encodeURIComponent(pathname)}`)}
            onClick={close}
            className="bg-ob-accent text-accent-ink inline-flex h-10 items-center justify-center gap-2 rounded-(--r-8) text-sm font-medium no-underline [&_svg]:size-[15px]"
          >
            <IconGithub />
            {authDict.eyebrow}
          </Link>
        )}
      </SheetContent>
    </Sheet>
  )
}
