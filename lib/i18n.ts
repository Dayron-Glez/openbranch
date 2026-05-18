import { defineI18n } from "fumadocs-core/i18n"

export const i18n = defineI18n({
  languages: ["es", "en"],
  defaultLanguage: "es",
  hideLocale: "default-locale",
  parser: "dot",
  fallbackLanguage: "es",
})
