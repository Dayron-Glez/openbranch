import { NextResponse } from "next/server"
import { playgroundSource } from "@/lib/playground-source"

export type PlaygroundSearchResult = {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly url: string
  readonly category: string
  readonly difficulty: string
}

export function GET(request: Request): NextResponse<PlaygroundSearchResult[]> {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") ?? "").trim().toLowerCase()
  const locale = searchParams.get("locale") ?? "es"

  const pages = playgroundSource.getPages(locale).filter((p) => p.data.maturity === "stable")

  const results = query
    ? pages.filter(
        (p) =>
          p.data.title.toLowerCase().includes(query) ||
          (p.data.description ?? "").toLowerCase().includes(query)
      )
    : pages

  return NextResponse.json(
    results.map((p) => ({
      id: p.slugs[0] ?? "",
      title: p.data.title,
      description: p.data.description ?? "",
      url: p.url,
      category: p.data.category,
      difficulty: p.data.difficulty,
    }))
  )
}
