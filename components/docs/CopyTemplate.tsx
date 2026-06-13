"use client"

import { useState } from "react"
import {
  IconClipboard,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconMaximize,
  IconX,
} from "@tabler/icons-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useDocsUI } from "@/components/docs/DocsUIProvider"

type CopyTemplateProps = {
  readonly title: string
  readonly content: string
  readonly defaultExpanded?: boolean
}

export const CopyTemplate = ({ title, content, defaultExpanded = false }: CopyTemplateProps) => {
  const [copied, setCopied] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded)
  const { copyTemplate: dict } = useDocsUI()

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleExpanded = (): void => setExpanded((prev) => !prev)

  const CopyIcon = copied ? IconCheck : IconClipboard
  const ToggleIcon = expanded ? IconChevronUp : IconChevronDown

  return (
    <div className="not-prose border-ob-accent/25 my-6 overflow-hidden rounded-lg border">
      <div className="border-ob-accent/25 bg-accent-soft flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="text-ob-accent font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                className="text-fd-muted-foreground hover:bg-ob-accent/10 hover:text-ob-accent flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
                aria-label={copied ? dict.copied : dict.copyToClipboard}
              >
                <CopyIcon className="size-3.5" />
                <span>{copied ? dict.copied : dict.copy}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{dict.copyToClipboard}</TooltipContent>
          </Tooltip>

          <Dialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-fd-muted-foreground hover:bg-ob-accent/10 hover:text-ob-accent flex cursor-pointer items-center rounded-md p-1 transition-colors"
                    aria-label={dict.fullScreen}
                  >
                    <IconMaximize className="size-3.5" />
                  </button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>{dict.fullScreen}</TooltipContent>
            </Tooltip>
            <DialogContent className="flex h-[80vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 [&>button:last-child]:hidden">
              <div className="border-ob-accent/25 bg-accent-soft flex items-center justify-between gap-3 border-b px-4 py-2.5">
                <DialogTitle className="text-ob-accent font-mono text-[11px] font-medium tracking-[0.08em] uppercase">
                  {title}
                </DialogTitle>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-fd-muted-foreground hover:bg-ob-accent/10 hover:text-ob-accent flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
                    aria-label={copied ? dict.copied : dict.copyToClipboard}
                  >
                    <CopyIcon className="size-3.5" />
                    <span>{copied ? dict.copied : dict.copy}</span>
                  </button>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="text-fd-muted-foreground hover:bg-ob-accent/10 hover:text-ob-accent flex cursor-pointer items-center rounded-md p-1 transition-colors"
                      aria-label={dict.close}
                    >
                      <IconX className="size-3.5" />
                    </button>
                  </DialogClose>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <pre className="text-fd-foreground px-4 py-4 font-mono text-sm leading-relaxed">
                  {content}
                </pre>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleExpanded}
                className="text-fd-muted-foreground hover:bg-ob-accent/10 hover:text-ob-accent flex cursor-pointer items-center rounded-md p-1 transition-colors"
                aria-label={expanded ? dict.collapse : dict.expand}
              >
                <ToggleIcon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{expanded ? dict.collapse : dict.expand}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {expanded ? (
        <ScrollArea className="bg-fd-card h-[70vh]">
          <pre className="text-fd-foreground px-4 py-4 font-mono text-sm leading-relaxed">
            {content}
          </pre>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="bg-fd-card relative">
          <pre className="text-fd-foreground h-[5.5rem] overflow-hidden px-4 py-4 font-mono text-sm leading-relaxed">
            {content}
          </pre>
          <div className="from-fd-card pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t to-transparent" />
        </div>
      )}
    </div>
  )
}
