import { defineI18n } from "fumadocs-core/i18n"

export const i18n = defineI18n({
  languages: ["es", "en"],
  defaultLanguage: "es",
  hideLocale: "default-locale",
  parser: "dot",
  fallbackLanguage: "es",
})

/**
 * The locale a localized path belongs to. The default locale is served
 * unprefixed, so only an explicit prefix identifies the other one.
 *
 * Matched as a whole segment rather than by prefix: `/entrega` starts with
 * "/en" without being English.
 */
export const localeFromPath = (path: string): string =>
  path === "/en" || path.startsWith("/en/") ? "en" : i18n.defaultLanguage
