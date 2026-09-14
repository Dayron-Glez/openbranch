import { playgroundSource } from "@/lib/playground-source"
import { source } from "@/lib/source"
import { CATEGORY_ORDER } from "@/features/playground/domain/manifest"
import type { StoryCounts } from "@/features/auth/components/StoryPanel"

/**
 * Lives in the route rather than in `features/auth/` because it reaches into
 * the playground's catalogue, and a feature must not depend on a sibling. The
 * pages read it and hand the values down as props.
 */

/** The challenge the story panel shows a still of. */
export const FEATURED_SLUG = "git-merge-conflict"

/**
 * Counted from the content itself so the panel cannot claim something that was
 * true when it was written and is not any more.
 *
 * A guide is a page inside a section: the docs root is a welcome page and each
 * section's `index.mdx` is a frontmatter-only stub, so neither is one.
 */
export const countStory = (lang: string): StoryCounts => ({
  challenges: playgroundSource.getPages(lang).length,
  tracks: CATEGORY_ORDER.length,
  guides: source.getPages(lang).filter((page) => page.slugs.length >= 2).length,
})

/** Read from the challenge's own frontmatter rather than typed into the mockup. */
export const featuredMinutes = (lang: string): number | null => {
  const page = playgroundSource
    .getPages(lang)
    .find((candidate) => candidate.slugs.join("/") === FEATURED_SLUG)
  const minutes = (page?.data as { estimated_minutes?: number } | undefined)?.estimated_minutes
  return typeof minutes === "number" ? minutes : null
}

/** Title of a challenge from its slug; falls back to the slug itself. */
export const challengeTitleOf = (lang: string, slug: string): string => {
  const page = playgroundSource
    .getPages(lang)
    .find((candidate) => candidate.slugs.join("/") === slug)
  return (page?.data as { title?: string } | undefined)?.title ?? slug
}
