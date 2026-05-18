import type { NextFetchEvent, NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation"
import { createI18nMiddleware } from "fumadocs-core/i18n/middleware"
import { i18n } from "@/lib/i18n"
import { docsContentRoute, docsRoute } from "@/lib/shared"

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`
)
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`
)

const i18nMiddleware = createI18nMiddleware(i18n)

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const result = rewriteSuffix(request.nextUrl.pathname)
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl))
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname)

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl))
    }
  }

  return i18nMiddleware(request, event)
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
