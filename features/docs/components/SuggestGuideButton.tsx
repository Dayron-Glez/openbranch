"use client"

import { IconCirclePlus } from "@tabler/icons-react"
import { buildSuggestUrl } from "@/lib/suggest-url"
import { useDocsUI } from "@/features/docs/components/DocsUIProvider"
import { Button } from "@/components/ui/button"

export function SuggestGuideButton({ sectionName }: { readonly sectionName: string }) {
  const { suggestGuide } = useDocsUI()
  const url = buildSuggestUrl(sectionName)

  return (
    <Button
      asChild
      variant="outline"
      className="bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:ring-fd-ring [&_svg]:text-fd-muted-foreground h-auto gap-2 border px-2 py-1.5 text-xs"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${suggestGuide} — ${sectionName}`}
      >
        <IconCirclePlus />
        <span>{suggestGuide}</span>
      </a>
    </Button>
  )
}
