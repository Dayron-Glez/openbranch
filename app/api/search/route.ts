import { source } from "@/lib/source"
import { createFromSource } from "fumadocs-core/search/server"

// https://docs.orama.com/docs/orama-js/supported-languages
export const { GET } = createFromSource(source, {
  localeMap: {
    es: { language: "spanish" },
    en: { language: "english" },
  },
})
