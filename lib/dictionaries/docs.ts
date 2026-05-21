export const docsDictionary = {
  es: {
    suggestGuide: "Sugerir una guía",
    revisions: {
      title: "Revisiones",
      since: "desde",
      commit: "commit",
      commits: "commits",
      empty: "Sin revisiones aún — sé el primero en editar.",
    },
  },
  en: {
    suggestGuide: "Suggest a guide",
    revisions: {
      title: "Revisions",
      since: "since",
      commit: "commit",
      commits: "commits",
      empty: "No revisions yet — be the first to edit.",
    },
  },
} as const

export type DocsLocale = keyof typeof docsDictionary
export type DocsDictionary = (typeof docsDictionary)[DocsLocale]
export type RevisionsDictionary = DocsDictionary["revisions"]
