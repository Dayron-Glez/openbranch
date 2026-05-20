"use client"

import { PlusCircle } from "lucide-react"
import { buildSuggestUrl } from "@/lib/suggest-url"
import { useDocsUI } from "@/components/DocsUIProvider"

export function SuggestGuideButton({ sectionName }: { sectionName: string }) {
  const { suggestGuide } = useDocsUI()
  const url = buildSuggestUrl(sectionName)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-sm",
        "border-line text-fd-muted-foreground border border-dashed",
        "hover:border-ob-accent hover:bg-ob-accent/8 hover:text-ob-accent transition-colors",
        "focus-visible:border-ob-accent focus-visible:bg-ob-accent/8 focus-visible:text-ob-accent",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        "outline-none",
      ].join(" ")}
      aria-label={`${suggestGuide} — ${sectionName}`}
    >
      <PlusCircle />
      <span>{suggestGuide}</span>
    </a>
  )
}
