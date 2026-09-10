import { notFound } from "next/navigation"

/**
 * Next renders a nested `[lang]/not-found.tsx` only for an explicit
 * `notFound()` from a page that DID match — never for a URL matching no route
 * at all, which falls through to the bare framework 404. Hence this catch-all.
 *
 * A more specific route always wins over it, so it shadows nothing.
 */
export default function CatchAllNotFoundPage(): never {
  notFound()
}
