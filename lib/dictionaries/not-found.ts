/**
 * Copy for the 404 page. Flat `{ es, en }` entries assembled by `tx`,
 * following `lib/playground-dictionary.ts` and `lib/dictionaries/profile.ts`
 * rather than side-by-side locale objects — with only two locales sharing
 * identical keys, the side-by-side form is half duplicated lines by
 * construction (the exact issue SonarCloud caught in the profile dictionary).
 */

type LocalizedEntry = { readonly es: string; readonly en: string }
type Lang = keyof LocalizedEntry

const translations = {
  "eyebrow.code": { es: "404", en: "404" },
  "eyebrow.label": { es: "ruta no encontrada", en: "page not found" },
  // Split at the same point in both locales so the "quiet" tail reads as one
  // continuous sentence, not two unrelated fragments.
  "heading.lead": { es: "Esta rama no", en: "This branch" },
  "heading.quiet": { es: "lleva a ningún sitio.", en: "leads nowhere." },
  lead: {
    es: "El enlace que seguiste no existe, cambió de nombre o nunca llegó a fusionarse. Vuelve al camino principal por aquí.",
    en: "The link you followed doesn't exist, was renamed, or never got merged. Here's the way back to the main line.",
  },
  "dest.docs.title": { es: "Docs", en: "Docs" },
  "dest.docs.body": {
    es: "El manual completo, de rama a release.",
    en: "The full handbook, branch to release.",
  },
  "dest.playground.title": { es: "Playground", en: "Playground" },
  "dest.playground.body": {
    es: "Practica retos reales en el editor.",
    en: "Practice real challenges in the editor.",
  },
  "dest.paths.title": { es: "Rutas", en: "Learning paths" },
  "dest.paths.body": {
    es: "Recorridos guiados por tema.",
    en: "Guided tracks by topic.",
  },
  back: { es: "Volver al inicio", en: "Back to home" },
} satisfies Record<string, LocalizedEntry>

export type NotFoundDict = {
  readonly eyebrowCode: string
  readonly eyebrowLabel: string
  readonly headingLead: string
  readonly headingQuiet: string
  readonly lead: string
  readonly destDocsTitle: string
  readonly destDocsBody: string
  readonly destPlaygroundTitle: string
  readonly destPlaygroundBody: string
  readonly destPathsTitle: string
  readonly destPathsBody: string
  readonly back: string
}

export const getNotFoundDict = (lang: string): NotFoundDict => {
  const locale: Lang = lang === "en" ? "en" : "es"
  const tx = (key: keyof typeof translations): string => translations[key][locale]

  return {
    eyebrowCode: tx("eyebrow.code"),
    eyebrowLabel: tx("eyebrow.label"),
    headingLead: tx("heading.lead"),
    headingQuiet: tx("heading.quiet"),
    lead: tx("lead"),
    destDocsTitle: tx("dest.docs.title"),
    destDocsBody: tx("dest.docs.body"),
    destPlaygroundTitle: tx("dest.playground.title"),
    destPlaygroundBody: tx("dest.playground.body"),
    destPathsTitle: tx("dest.paths.title"),
    destPathsBody: tx("dest.paths.body"),
    back: tx("back"),
  }
}
