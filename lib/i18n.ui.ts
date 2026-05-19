import { defineI18nUI } from "fumadocs-ui/i18n"
import {
  BookOpen,
  FlaskConical,
  GitBranch,
  GitPullRequest,
  Lightbulb,
  type LucideIcon,
} from "lucide-react"
import { i18n } from "./i18n"

export const { provider } = defineI18nUI(i18n, {
  es: {
    displayName: "Español",
    search: "Buscar",
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
    search: "Search",
  },
})

export type SearchLink = [name: string, href: string, icon: LucideIcon]

const SEARCH_LINKS: Record<"es" | "en", SearchLink[]> = {
  es: [
    ["Documentación", "/docs", BookOpen],
    ["Git y flujos de trabajo", "/docs/git", GitBranch],
    ["Pruebas", "/docs/testing", FlaskConical],
    ["Contribuir al código abierto", "/docs/contributing", GitPullRequest],
    ["Buenas prácticas", "/docs/best-practices", Lightbulb],
  ],
  en: [
    ["Documentation", "/en/docs", BookOpen],
    ["Git & Workflows", "/en/docs/git", GitBranch],
    ["Testing", "/en/docs/testing", FlaskConical],
    ["Contributing to OSS", "/en/docs/contributing", GitPullRequest],
    ["Best practices", "/en/docs/best-practices", Lightbulb],
  ],
}

export function getSearchLinks(lang: string): SearchLink[] {
  return lang === "en" ? SEARCH_LINKS.en : SEARCH_LINKS.es
}
