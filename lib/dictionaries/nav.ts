export const navDictionary = {
  es: {
    docsLabel: "Docs",
    playgroundLabel: "Playground",
    menuAria: "Abrir menú",
    menuTitle: "Menú",
  },
  en: {
    docsLabel: "Docs",
    playgroundLabel: "Playground",
    menuAria: "Open menu",
    menuTitle: "Menu",
  },
} as const

export type NavLocale = keyof typeof navDictionary
export type NavDictionary = (typeof navDictionary)[NavLocale]

export const resolveNavLocale = (lang: string): NavLocale =>
  (lang as NavLocale) in navDictionary ? (lang as NavLocale) : "es"
