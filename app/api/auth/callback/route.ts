import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { safeNextPath } from "@/lib/safe-next"
import { localeFromPath } from "@/lib/i18n"
import { localizedHref } from "@/lib/landing-dictionary"

/**
 * The provider codes the login screen has copy for. Anything else it has never
 * heard of still gets a screen, under `unknown`, rather than a silent bounce.
 */
const KNOWN_PROVIDER_ERRORS = new Set(["access_denied"])

/**
 * Supabase stamps `created_at` and `last_sign_in_at` in the same request when
 * it creates the account, so on a brand new user they sit within milliseconds
 * of each other. On a returning one they are days apart. This decides whether
 * the welcome screen is shown, so being wrong shows or skips a greeting —
 * never blocks anyone.
 */
const FIRST_SIGN_IN_TOLERANCE_MS = 10_000

const isFirstSignIn = (
  createdAt: string | undefined,
  lastSignInAt: string | undefined
): boolean => {
  if (createdAt === undefined || lastSignInAt === undefined) return false
  const created = Date.parse(createdAt)
  const lastSignIn = Date.parse(lastSignInAt)
  if (Number.isNaN(created) || Number.isNaN(lastSignIn)) return false
  return Math.abs(lastSignIn - created) < FIRST_SIGN_IN_TOLERANCE_MS
}

const failure = (
  origin: string,
  loginPath: string,
  reason: string,
  next: string,
  providerCode: string | null
): NextResponse => {
  const params = new URLSearchParams({ error: reason, next })
  if (providerCode !== null) params.set("error_code", providerCode)
  return NextResponse.redirect(`${origin}${loginPath}?${params.toString()}`)
}

/**
 * Before this, every failure looked like a success: the exchange error was
 * discarded and GitHub's own `?error=access_denied` was ignored, so cancelling
 * on the consent screen bounced the user back signed out with no explanation.
 */
export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams, origin } = new URL(request.url)

  // Validated here too: this value is attacker-controllable and ends up in a
  // redirect. "/playground" is already the default locale's form.
  const next = safeNextPath(searchParams.get("next"), "/playground")
  const lang = localeFromPath(next)
  const loginPath = localizedHref(lang, "/login")

  const providerError = searchParams.get("error")
  if (providerError !== null) {
    const reason = KNOWN_PROVIDER_ERRORS.has(providerError) ? providerError : "unknown"
    return failure(origin, loginPath, reason, next, providerError)
  }

  const code = searchParams.get("code")
  if (code === null) {
    return failure(origin, loginPath, "unknown", next, null)
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error !== null || data.user === null) {
    return failure(origin, loginPath, "exchange_failed", next, error?.code ?? null)
  }

  if (isFirstSignIn(data.user.created_at, data.user.last_sign_in_at)) {
    const welcomePath = localizedHref(lang, "/login/welcome")
    const params = new URLSearchParams({ next })
    return NextResponse.redirect(`${origin}${welcomePath}?${params.toString()}`)
  }

  // Returning users never see a screen of ours — straight where they were going.
  return NextResponse.redirect(`${origin}${next}`)
}
