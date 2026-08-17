export const navDictionary = {
  es: {
    docsLabel: "Docs",
    playgroundLabel: "Playground",
    pathsLabel: "Rutas",
    menuAria: "Abrir menú",
    menuTitle: "Menú",
    profileLabel: "Tu perfil",
  },
  en: {
    docsLabel: "Docs",
    playgroundLabel: "Playground",
    pathsLabel: "Paths",
    menuAria: "Open menu",
    menuTitle: "Menu",
    profileLabel: "Your profile",
  },
} as const

export type NavLocale = keyof typeof navDictionary
export type NavDictionary = (typeof navDictionary)[NavLocale]

export const resolveNavLocale = (lang: string): NavLocale =>
  (lang as NavLocale) in navDictionary ? (lang as NavLocale) : "es"
