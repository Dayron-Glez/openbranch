"use client"

import type { ComponentProps, ReactNode } from "react"
import { RootProvider } from "fumadocs-ui/provider/next"

type RootProviderProps = ComponentProps<typeof RootProvider>
type I18nConfig = NonNullable<RootProviderProps["i18n"]>

type Props = {
  readonly i18n: I18nConfig
  readonly search: RootProviderProps["search"]
  readonly children: ReactNode
}

// Switching locale changes <html lang> and the i18n provider. Fumadocs'
// default locale change does a client-side redirect, which remounts
// <html>/RootProvider; a full-document navigation is the correct context
// switch and avoids the remount.
export function I18nRootProvider({ i18n, search, children }: Props) {
  return (
    <RootProvider
      // next-themes has nothing to do here: the app is dark-only and <html>
      // already hardcodes the `dark` class server-side ([lang]/layout.tsx) —
      // nothing calls `useTheme()`. Left enabled, its FOUC-prevention <script>
      // is what React 19 flags as "Encountered a script tag while rendering
      // React component" on any fresh render of this provider, including
      // every notFound() page (previously invisible only because no
      // notFound() call ever reached this tree — Next rendered its own
      // bare default instead).
      theme={{ enabled: false }}
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
      search={search}
    >
      {children}
    </RootProvider>
  )
}
