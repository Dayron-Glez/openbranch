"use client"

import { useState } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
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
import { useDocsUI } from "@/features/docs/components/DocsUIProvider"
import { cn } from "@/lib/utils"

type CopyTemplateProps = {
  readonly title: string
  readonly content: string
  readonly defaultExpanded?: boolean
}

const remarkPlugins = [remarkGfm]

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-ob-accent mb-4 font-mono text-xs font-bold tracking-[0.08em] uppercase">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-ob-accent mt-5 mb-2 font-mono text-[10px] font-semibold tracking-[0.08em] uppercase">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-fd-foreground mt-3 mb-1 text-xs font-medium">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-fd-muted-foreground mb-2 text-xs leading-relaxed">{children}</p>
  ),
  ul: ({ children, className }) => (
    <ul
      className={cn(
        "mb-3 space-y-1",
        className === "contains-task-list" ? "list-none pl-0" : "list-disc pl-4"
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-4">{children}</ol>,
  li: ({ children, className }) => (
    <li
      className={cn(
        "text-fd-muted-foreground text-xs leading-relaxed",
        className !== "task-list-item" && "marker:text-ob-accent"
      )}
    >
      {children}
    </li>
  ),
  input: ({ type, checked }) => {
    if (type !== "checkbox") return null
    return (
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="accent-ob-accent mr-1.5 cursor-default"
      />
    )
  },
  hr: () => <hr className="border-ob-accent/15 my-4" />,
  code: ({ children, className }) => {
    const isBlock = Boolean(className?.includes("language-"))
    if (isBlock) {
      return <code className="text-fd-foreground font-mono text-xs">{children}</code>
    }
    return (
      <code className="bg-ob-accent/10 text-ob-accent rounded px-1 py-0.5 font-mono text-[11px]">
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-fd-card border-ob-accent/10 mb-3 overflow-x-auto rounded border p-3 font-mono text-xs">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-ob-accent/10 border-b">{children}</tr>,
  th: ({ children }) => (
    <th className="text-ob-accent pr-6 pb-2 text-left font-mono text-[10px] font-semibold tracking-[0.06em] uppercase">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-fd-muted-foreground py-1.5 pr-6 text-xs">{children}</td>
  ),
  strong: ({ children }) => (
    <strong className="text-fd-foreground font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="text-fd-muted-foreground italic">{children}</em>,
  a: ({ children, href }) => (
    <a href={href} className="text-ob-accent underline underline-offset-2">
      {children}
    </a>
  ),
}

const MarkdownContent = ({ content }: { readonly content: string }) => (
  <Markdown remarkPlugins={remarkPlugins} components={markdownComponents}>
    {content}
  </Markdown>
)

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
                <div className="px-4 py-4">
                  <MarkdownContent content={content} />
                </div>
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
          <div className="px-4 py-4">
            <MarkdownContent content={content} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="bg-fd-card relative">
          <div className="h-[5.5rem] overflow-hidden px-4 py-4">
            <MarkdownContent content={content} />
          </div>
          <div className="from-fd-card pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t to-transparent" />
        </div>
      )}
    </div>
  )
}
