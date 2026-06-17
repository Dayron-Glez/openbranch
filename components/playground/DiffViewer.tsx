import type { ReactNode } from "react"

export type DiffLineType = "added" | "removed" | "context" | "hunk"

export type DiffLine = {
  readonly type: DiffLineType
  readonly content: string
}

export type DiffFile = {
  readonly filename: string
  readonly additions: number
  readonly deletions: number
  readonly lines: readonly DiffLine[]
}

type DiffViewerProps = {
  readonly files: readonly DiffFile[]
}

const DiffLineRow = ({
  line,
  index,
}: {
  readonly line: DiffLine
  readonly index: number
}): ReactNode => {
  if (line.type === "hunk") {
    return (
      <div
        key={index}
        className="border-line bg-bg-elev text-fg-muted border-y px-4 py-0.5 font-mono text-[11.5px] select-none"
      >
        {line.content}
      </div>
    )
  }

  const bgClass =
    line.type === "added"
      ? "bg-ob-accent/[0.07]"
      : line.type === "removed"
        ? "bg-danger/[0.07]"
        : ""

  const prefixClass =
    line.type === "added"
      ? "text-ob-accent"
      : line.type === "removed"
        ? "text-danger"
        : "text-fg-faint"

  const prefix = line.type === "added" ? "+" : line.type === "removed" ? "-" : " "

  return (
    <div className={`flex font-mono text-[12.5px] leading-[1.75] ${bgClass}`}>
      <span className={`w-8 shrink-0 text-center select-none ${prefixClass}`}>{prefix}</span>
      <span className="text-fg-2 flex-1 pr-4 whitespace-pre">{line.content}</span>
    </div>
  )
}

const DiffFilePanel = ({ file }: { readonly file: DiffFile }): ReactNode => (
  <div className="border-line overflow-hidden rounded-[var(--r-8)] border">
    <div className="border-line bg-bg-elev flex items-center justify-between gap-4 border-b px-4 py-2.5">
      <span className="text-fg-2 truncate font-mono text-[12px]">{file.filename}</span>
      <span className="flex shrink-0 items-center gap-2.5 font-mono text-[11.5px]">
        <span className="text-ob-accent">+{file.additions}</span>
        <span className="text-danger">−{file.deletions}</span>
      </span>
    </div>
    <div className="bg-bg-card overflow-x-auto">
      {file.lines.map((line, i) => (
        <DiffLineRow key={`${line.type}-${i}`} line={line} index={i} />
      ))}
    </div>
  </div>
)

export const DiffViewer = ({ files }: DiffViewerProps): ReactNode => (
  <div className="flex flex-col gap-4">
    {files.map((file) => (
      <DiffFilePanel key={file.filename} file={file} />
    ))}
  </div>
)
