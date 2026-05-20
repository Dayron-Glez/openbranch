"use client"

import { buildSuggestUrl } from "@/lib/suggest-url"

export function SuggestGuideButton({ sectionName }: Readonly<{ sectionName: string }>) {
  const url = buildSuggestUrl(sectionName)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "flex w-full flex-row items-center gap-2 rounded-lg px-2 py-1.5 text-start",
        "text-fd-muted-foreground/60 transition-colors",
        "hover:text-ob-accent focus-visible:text-ob-accent",
        "text-xs outline-none",
      ].join(" ")}
      aria-label={`Suggest a new guide for ${sectionName}`}
    >
      <span aria-hidden="true">+</span>
      <span>Suggest a guide</span>
    </a>
  )
}
