import { defineI18nUI } from "fumadocs-ui/i18n"
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
  },
})
