"use client"

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
import { AlignLeft, ArrowUpRight, FileText, Hash } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type SearchLink = [name: string, href: string]

interface Props extends SharedProps {
  links?: SearchLink[]
}

function ResultIcon({ type }: { type: "page" | "heading" | "text" }) {
  if (type === "page") return <FileText />
  if (type === "heading") return <Hash />
  return <AlignLeft />
}

const KBD_LABELS = {
  es: {
    navigate: "Navegar",
    open: "Abrir",
    close: "Cerrar",
    suggestions: "Sugerencias",
    empty: "Sin resultados.",
  },
  en: {
    navigate: "Navigate",
    open: "Open",
    close: "Close",
    suggestions: "Suggestions",
    empty: "No results found.",
  },
} as const

export function CustomSearchDialog({ open, onOpenChange, links = [] }: Props) {
  const pathname = usePathname()
  const locale = pathname.startsWith("/en") ? "en" : "es"
  const t = KBD_LABELS[locale]

  const { search, setSearch, query } = useDocsSearch({ type: "fetch", locale })

  const results = !query.data || query.data === "empty" ? [] : query.data
  const isEmpty = !search.trim()

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
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
            placeholder={locale === "en" ? "Search documentation…" : "Buscar documentación…"}
          />
        </SearchDialogHeader>

        <div className="max-h-[360px] overflow-y-auto py-1.5">
          {isEmpty ? (
            links.length > 0 && (
              <section>
                <p className="text-fd-muted-foreground px-4 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase">
                  {t.suggestions}
                </p>
                {links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => onOpenChange(false)}
                    className="text-fd-foreground hover:bg-fd-accent flex items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors"
                  >
                    <ArrowUpRight className="text-fd-muted-foreground size-3.5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
              </section>
            )
          ) : results.length === 0 ? (
            <p className="text-fd-muted-foreground py-8 text-center text-sm">{t.empty}</p>
          ) : (
            <ul>
              {results.map((item) => {
                const isPage = item.type === "page"
                const isText = item.type === "text"
                return (
                  <li key={item.id}>
                    <Link
                      href={item.url}
                      onClick={() => onOpenChange(false)}
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
                        className={
                          isPage
                            ? "text-sm font-medium"
                            : isText
                              ? "text-fd-muted-foreground text-xs"
                              : "text-fd-muted-foreground text-sm"
                        }
                        /* fumadocs wraps highlights in <mark> — content is generated from our own docs */
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
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
              <kbd className="border-fd-border bg-fd-background rounded border px-1 py-px font-mono text-[10px]">
                {key}
              </kbd>
              {label}
            </span>
          ))}
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  )
}
