"use client"

import type { ComponentProps, ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"

type RootProviderProps = ComponentProps<typeof RootProvider>
type I18nConfig = NonNullable<RootProviderProps["i18n"]>
type SearchLink = [name: string, href: string]

type Props = {
  readonly i18n: I18nConfig
  readonly searchLinks: SearchLink[]
  readonly children: ReactNode
}

// Switching locale changes <html lang>, the i18n provider and the theme
// script. Fumadocs' default locale change does a client-side redirect, which
// remounts <html>/RootProvider and makes React 19 warn about the theme
// <script>. A full-document navigation is the correct context switch and
// avoids the remount.
export function I18nRootProvider({ i18n, searchLinks, children }: Props) {
  return (
    <RootProvider
      i18n={{
        ...i18n,
        onLocaleChange: (locale) => {
          const path = globalThis.location.pathname.replace(/^\/en(?=\/|$)/, "") || "/"
          let target = path
          if (locale === "en") {
            target = path === "/" ? "/en" : `/en${path}`
          }
          globalThis.location.assign(target)
        },
      }}
      search={{ options: { links: searchLinks } }}
    >
      {children}
    </RootProvider>
  )
}
