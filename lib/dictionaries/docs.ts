export const docsDictionary = {
  es: {
    suggestGuide: "Sugerir una guía",
  },
  en: {
    suggestGuide: "Suggest a guide",
  },
} as const

export type DocsLocale = keyof typeof docsDictionary
export type DocsDictionary = (typeof docsDictionary)[DocsLocale]
