import { createServerClient } from "@supabase/ssr"
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

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()

  const withSessionCookies = (response: NextResponse): NextResponse => {
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  const suffixResult = rewriteSuffix(request.nextUrl.pathname)
  if (suffixResult) {
    return withSessionCookies(NextResponse.rewrite(new URL(suffixResult, request.nextUrl)))
  }

  if (isMarkdownPreferred(request)) {
    const docsResult = rewriteDocs(request.nextUrl.pathname)
    if (docsResult) {
      return withSessionCookies(NextResponse.rewrite(new URL(docsResult, request.nextUrl)))
    }
  }

  return withSessionCookies(i18nMiddleware(request, event))
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"], // NOSONAR: Next.js requires a static string literal here; String.raw is not allowed
}
