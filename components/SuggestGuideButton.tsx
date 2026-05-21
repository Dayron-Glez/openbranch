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
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
        "border-fd-border text-fd-muted-foreground border border-dashed",
        "hover:border-ob-accent hover:text-ob-accent transition-colors",
        "focus-visible:border-ob-accent focus-visible:text-ob-accent",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        "whitespace-nowrap outline-none",
      ].join(" ")}
      aria-label={`${suggestGuide} — ${sectionName}`}
    >
      <PlusCircle />
      <span>{suggestGuide}</span>
    </a>
  )
}
