import type { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaygroundTransition } from "@/components/playground/PlaygroundTransition"
import { PlaygroundNav } from "@/components/playground/PlaygroundNav"
import "./playground.css"

export default async function PlaygroundLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: Promise<{ readonly lang: string }>
}) {
  const { lang } = await params
  const homeHref = lang === "en" ? "/en" : "/"

  return (
    <div className="bg-bg text-fg flex h-dvh flex-col overflow-hidden">
      <PlaygroundTransition />
      <PlaygroundNav homeHref={homeHref} />
      <ScrollArea className="flex-1">{children}</ScrollArea>
    </div>
  )
}
