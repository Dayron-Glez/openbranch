import { notFound } from "next/navigation"

/**
 * Next does not automatically render a nested `[lang]/not-found.tsx` for a
 * URL that matches no route at all — only for an explicit `notFound()` call
 * from within a page that DID match. Without this catch-all, an arbitrary
 * bad URL under `[lang]` falls through to Next's bare framework 404, with no
 * nav, no brand, no locale — exactly the problem `not-found.tsx` exists to
 * fix, for the one case it can't reach on its own.
 *
 * Next always resolves a more specific route (docs, playground, paths, u,
 * …) before falling back to this catch-all, so it never shadows a real page.
 * `notFound()` triggers `app/[lang]/not-found.tsx`, still inside the `[lang]`
 * segment — `params.lang` there resolves correctly.
 */
export default function CatchAllNotFoundPage(): never {
  notFound()
}
