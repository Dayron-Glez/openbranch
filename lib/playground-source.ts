import { playground } from "collections/server"
import { loader } from "fumadocs-core/source"
import { i18n } from "./i18n"

export const playgroundSource = loader({
  baseUrl: "/playground",
  source: playground.toFumadocsSource(),
  i18n,
})

export type PlaygroundPage = (typeof playgroundSource)["$inferPage"]
