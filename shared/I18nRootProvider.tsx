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

// Fumadocs' default locale change does a client-side redirect, which remounts
// <html>/RootProvider. A full-document navigation avoids that remount.
export function I18nRootProvider({ i18n, search, children }: Props) {
  return (
    <RootProvider
      // The app is dark-only: <html> hardcodes the `dark` class server-side
      // and nothing calls `useTheme()`. Left enabled, next-themes' FOUC script
      // is what React 19 flags as "Encountered a script tag while rendering
      // React component" on any fresh render of this provider.
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
