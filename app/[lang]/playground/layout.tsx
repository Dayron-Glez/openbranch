import type { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaygroundTransition } from "@/components/playground/PlaygroundTransition"
import "./playground.css"

export default function PlaygroundLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="bg-bg text-fg h-dvh overflow-hidden">
      <PlaygroundTransition />
      <ScrollArea className="h-full">{children}</ScrollArea>
    </div>
  )
}
