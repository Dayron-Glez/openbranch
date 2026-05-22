"use client"

import { PlusCircle } from "lucide-react"
import { buildSuggestUrl } from "@/lib/suggest-url"
import { useDocsUI } from "@/components/DocsUIProvider"

export function SuggestGuideButton({ sectionName }: { readonly sectionName: string }) {
  const { suggestGuide } = useDocsUI()
  const url = buildSuggestUrl(sectionName)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "transition-colors duration-100",
        "focus-visible:ring-fd-ring focus-visible:ring-2 focus-visible:outline-none",
        "bg-fd-secondary text-fd-secondary-foreground border",
        "hover:bg-fd-accent hover:text-fd-accent-foreground",
        "gap-2 px-2 py-1.5 text-xs",
        "[&_svg]:text-fd-muted-foreground [&_svg]:size-3.5",
        "whitespace-nowrap",
      ].join(" ")}
      aria-label={`${suggestGuide} — ${sectionName}`}
    >
      <PlusCircle />
      <span>{suggestGuide}</span>
    </a>
  )
}
