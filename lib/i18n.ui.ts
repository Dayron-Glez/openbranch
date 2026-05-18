import { defineI18nUI } from "fumadocs-ui/i18n"
import { i18n } from "./i18n"

export const { provider } = defineI18nUI(i18n, {
  es: {
    displayName: "Español",
    search: "Buscar en la documentación…",
    searchNoResult: "Sin resultados",
    toc: "En esta página",
    tocNoHeadings: "Sin encabezados",
    lastUpdate: "Última actualización",
    chooseLanguage: "Elegir idioma",
    nextPage: "Siguiente",
    previousPage: "Anterior",
    chooseTheme: "Tema",
    editOnGithub: "Editar en GitHub",
  },
  en: {
    displayName: "English",
    search: "Search the docs…",
  },
})

type SearchLink = [name: string, href: string]

const SEARCH_LINKS: Record<"es" | "en", SearchLink[]> = {
  es: [
    ["Documentación", "/docs"],
    ["Git y flujos de trabajo", "/docs/git"],
    ["Pruebas", "/docs/testing"],
    ["Contribuir al código abierto", "/docs/contributing"],
    ["Guardarraíles de contribución", "/docs/contributing/ci-guardrails"],
  ],
  en: [
    ["Documentation", "/en/docs"],
    ["Git & Workflows", "/en/docs/git"],
    ["Testing", "/en/docs/testing"],
    ["Contributing to OSS", "/en/docs/contributing"],
    ["Contribution guardrails", "/en/docs/contributing/ci-guardrails"],
  ],
}

export function getSearchLinks(lang: string): SearchLink[] {
  return lang === "en" ? SEARCH_LINKS.en : SEARCH_LINKS.es
}
