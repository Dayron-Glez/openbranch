import { paths } from "collections/server"
import { loader } from "fumadocs-core/source"
import { i18n } from "./i18n"

export const pathsSource = loader({
  baseUrl: "/paths",
  source: paths.toFumadocsSource(),
  i18n,
})

export type PathPage = (typeof pathsSource)["$inferPage"]
