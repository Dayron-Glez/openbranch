import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

type DiffLine = {
  readonly type: "unchanged" | "added" | "removed"
  readonly content: string
  readonly num: number | null
  readonly id: number
}

const computeLineDiff = (original: string, solution: string): readonly DiffLine[] => {
  const a = original.split("\n")
  const b = solution.split("\n")
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const raw: Array<{ type: "unchanged" | "added" | "removed"; content: string }> = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      raw.unshift({ type: "unchanged", content: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.unshift({ type: "added", content: b[j - 1] })
      j--
    } else {
      raw.unshift({ type: "removed", content: a[i - 1] })
      i--
    }
  }
  let solutionLine = 0
  let lineId = 0
  return raw.map((line) => {
    if (line.type !== "removed") solutionLine++
    return { ...line, num: line.type === "removed" ? null : solutionLine, id: lineId++ }
  })
}

type DiffRowProps = {
  readonly line: DiffLine
}

const DiffRow = ({ line }: DiffRowProps): React.ReactElement => {
  let rowBg = ""
  if (line.type === "added") rowBg = "bg-ob-accent/[0.08]"
  else if (line.type === "removed") rowBg = "bg-danger/[0.08]"

  let markerClass = "text-transparent"
  if (line.type === "added") markerClass = "text-ob-accent"
  else if (line.type === "removed") markerClass = "text-danger"

  let markerChar = " "
  if (line.type === "added") markerChar = "+"
  else if (line.type === "removed") markerChar = "-"

  let contentClass = ""
  if (line.type === "added") contentClass = "text-ob-accent/80"
  else if (line.type === "removed") contentClass = "text-danger/80"

  return (
    <div className={`flex items-center pr-3 ${rowBg}`}>
      <span
        className="w-12 shrink-0 pr-4 text-right text-[13px] leading-5.5 select-none"
        style={{ color: "#2D3144" }}
      >
        {line.num ?? ""}
      </span>
      <span className={`w-4 shrink-0 text-[13px] leading-5.5 select-none ${markerClass}`}>
        {markerChar}
      </span>
      <span
        className={`flex-1 text-[13px] leading-5.5 whitespace-pre ${contentClass}`}
        style={line.type === "unchanged" ? { color: "#ECEEF1" } : undefined}
      >
        {line.content}
      </span>
    </div>
  )
}

type DiffViewProps = {
  readonly original: string
  readonly solution: string
}

export const DiffView = ({ original, solution }: DiffViewProps): React.ReactElement => {
  const lines = computeLineDiff(original, solution)
  return (
    <div
      className="h-full"
      style={{
        backgroundColor: "#0D0F15",
        fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <ScrollArea className="h-full">
        <div className="py-4 pr-3">
          {lines.map((line) => (
            <DiffRow key={line.id} line={line} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
