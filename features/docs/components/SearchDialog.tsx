"use client"

import React, { useEffect, useState } from "react"
import { useDocsSearch } from "fumadocs-core/search/client"
import {
  SearchDialog,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search"
import type { SharedProps } from "fumadocs-ui/components/dialog/search"
import { IconAlignLeft, IconFileText, IconHash } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSearchLinks } from "@/lib/i18n.ui"
import { Kbd } from "@/components/ui/kbd"
import type { PlaygroundSearchResult } from "@/app/api/playground-search/route"
import { DiffBars } from "@/shared/DiffBars"

function ResultIcon({ type }: Readonly<{ type: "page" | "heading" | "text" }>) {
  if (type === "page") return <IconFileText />
  if (type === "heading") return <IconHash />
  return <IconAlignLeft />
}

const KBD_LABELS = {
  es: {
    navigate: "Navegar",
    open: "Abrir",
    close: "Cerrar",
    suggestions: "Sugerencias",
    empty: "Sin resultados.",
    challenges: "Retos",
    challengesEmpty: "Sin retos encontrados.",
  },
  en: {
    navigate: "Navigate",
    open: "Open",
    close: "Close",
    suggestions: "Suggestions",
    empty: "No results found.",
    challenges: "Challenges",
    challengesEmpty: "No challenges found.",
  },
} as const

export function CustomSearchDialog({ open, onOpenChange }: Readonly<SharedProps>) {
  const pathname = usePathname()
  const locale = pathname.startsWith("/en") ? "en" : "es"
  const t = KBD_LABELS[locale]
  const searchLinks = getSearchLinks(locale)

  const { search, setSearch, query } = useDocsSearch({ type: "fetch", locale })

  const [allChallenges, setAllChallenges] = useState<PlaygroundSearchResult[]>([])

  useEffect(() => {
    fetch(`/api/playground-search?locale=${locale}`)
      .then((r) => r.json() as Promise<PlaygroundSearchResult[]>)
      .then(setAllChallenges)
      .catch(() => null)
  }, [locale])

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) setSearch("")
    onOpenChange(nextOpen)
  }

  const docs = !query.data || query.data === "empty" ? [] : query.data
  const isEmpty = !search.trim()

  const filteredChallenges = isEmpty
    ? allChallenges
    : allChallenges.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )

  let docsContent: React.ReactNode = null
  if (isEmpty) {
    if (searchLinks.length > 0) {
      docsContent = (
        <section>
          <p className="text-fd-muted-foreground px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
            {t.suggestions}
          </p>
          {searchLinks.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => handleOpenChange(false)}
              className="text-fd-foreground hover:bg-fd-accent flex items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors"
            >
              <Icon className="text-fd-muted-foreground size-3.5 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </section>
      )
    }
  } else if (docs.length > 0) {
    docsContent = (
      <ul>
        {docs.map((item) => {
          const isPage = item.type === "page"
          const isText = item.type === "text"
          let contentClassName: string
          if (isPage) {
            contentClassName = "text-sm font-medium"
          } else if (isText) {
            contentClassName = "text-fd-muted-foreground text-xs"
          } else {
            contentClassName = "text-fd-muted-foreground text-sm"
          }
          return (
            <li key={item.id}>
              <Link
                href={item.url}
                onClick={() => handleOpenChange(false)}
                className={`text-fd-foreground hover:bg-fd-accent flex items-start gap-3 rounded-md px-4 py-2 transition-colors ${isText ? "pl-9" : ""}`}
              >
                <span
                  className={`mt-0.5 shrink-0 [&_svg]:size-3.5 ${
                    isPage ? "text-fd-foreground" : "text-fd-muted-foreground"
                  }`}
                >
                  <ResultIcon type={item.type} />
                </span>
                <span
                  className={contentClassName}
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    )
  }

  const challengesContent: React.ReactNode =
    filteredChallenges.length === 0 && !isEmpty ? (
      <p className="text-fd-muted-foreground px-4 py-3 text-sm">{t.challengesEmpty}</p>
    ) : (
      <ul>
        {filteredChallenges.map((c) => (
          <li key={c.id}>
            <Link
              href={c.url}
              onClick={() => handleOpenChange(false)}
              className="hover:bg-fd-accent flex items-center gap-3 rounded-md px-4 py-2 transition-colors"
            >
              <span className="text-ob-accent mt-0.5 shrink-0">
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="5" cy="4" r="1.5" />
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="11" cy="12" r="1.5" />
                  <path d="M5 5.5v5" />
                  <path d="M11 10.5V8a2 2 0 0 0-2-2H5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-fd-foreground block truncate text-sm font-medium">
                  {c.title}
                </span>
                {c.description && (
                  <span className="text-fd-muted-foreground block truncate text-xs">
                    {c.description}
                  </span>
                )}
              </span>
              <DiffBars difficulty={c.difficulty} />
            </Link>
          </li>
        ))}
      </ul>
    )

  const showDivider = !isEmpty && docsContent !== null && filteredChallenges.length > 0

  return (
    <SearchDialog
      open={open}
      onOpenChange={handleOpenChange}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "en" ? "Search docs and challenges…" : "Buscar docs y retos…"}
          />
        </SearchDialogHeader>

        <div className="max-h-90 overflow-y-auto py-1.5">
          {docsContent}

          {/* challenges section */}
          {(filteredChallenges.length > 0 || (!isEmpty && filteredChallenges.length === 0)) && (
            <section>
              {showDivider && <div className="border-fd-border mx-4 my-1.5 border-t" />}
              <p className="text-fd-muted-foreground px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
                {t.challenges}
              </p>
              {challengesContent}
            </section>
          )}

          {/* no docs results + no challenge results */}
          {!isEmpty && docs.length === 0 && filteredChallenges.length === 0 && (
            <p className="text-fd-muted-foreground py-8 text-center text-sm">{t.empty}</p>
          )}
        </div>

        <SearchDialogFooter className="border-fd-border flex items-center gap-4 border-t px-4 py-2">
          {(
            [
              ["↑↓", t.navigate],
              ["↵", t.open],
              ["Esc", t.close],
            ] as const
          ).map(([key, label]) => (
            <span
              key={key}
              className="text-fd-muted-foreground flex items-center gap-1.5 text-[11px]"
            >
              <Kbd className="border-fd-border bg-fd-background font-mono text-[10px]">{key}</Kbd>
              {label}
            </span>
          ))}
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  )
}
