import type { ReactNode } from "react"

type TerminalProps = {
  title?: string
  tags?: string[]
  children: ReactNode
}

export function Terminal({
  title = "~/atlas · git",
  tags = ["main", "fish"],
  children,
}: Readonly<TerminalProps>) {
  return (
    <div className="border-line-2 bg-bg-card overflow-hidden rounded-(--r-12) border shadow-(--sh-4)">
      <div className="border-line bg-bg-elev flex items-center gap-2 border-b px-4 py-3">
        <div className="flex gap-1.5">
          <span className="bg-line-2 size-2.5 rounded-full" />
          <span className="bg-line-2 size-2.5 rounded-full" />
          <span className="bg-line-2 size-2.5 rounded-full" />
        </div>
        <span className="text-fg-muted ml-2 font-mono text-xs">{title}</span>
        <div className="ml-auto flex gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="border-line text-fg-muted rounded-(--r-6) border px-2 py-0.5 font-mono text-[10.5px]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="text-fg px-6 py-[22px] font-mono text-[13.5px] leading-[1.75] max-[520px]:overflow-x-auto max-[520px]:px-4">
        {children}
      </div>
    </div>
  )
}

export function TerminalLine({ children }: { readonly children: ReactNode }) {
  return <div className="flex gap-[14px]">{children}</div>
}

export function Prompt() {
  return <span className="text-ob-accent select-none">$</span>
}

export function Ok() {
  return <span className="text-ob-accent">✓</span>
}

export function Highlight({ children }: { readonly children: ReactNode }) {
  return <span className="text-fg">{children}</span>
}

export function Dim({ children }: { readonly children: ReactNode }) {
  return <span className="text-fg-muted">{children}</span>
}

export function BranchBlock({ children }: { readonly children: ReactNode }) {
  return (
    <div className="border-line text-fg-2 my-1.5 ml-[14px] border-l pl-[14px] text-[12.5px]">
      {children}
    </div>
  )
}

export function Cursor() {
  return (
    <span
      className="ml-1 inline-block h-[14px] w-2 translate-y-[3px] bg-current motion-safe:animate-[ob-blink_1.1s_steps(1)_infinite]"
      aria-hidden
    />
  )
}
