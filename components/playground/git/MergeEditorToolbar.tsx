import type { PlaygroundDict } from "@/lib/playground-dictionary"

const isMac = (): boolean => typeof navigator !== "undefined" && navigator.platform.includes("Mac")

type MergeEditorToolbarProps = {
  showSolution: boolean
  isFormatting: boolean
  editableFile: string
  dict: PlaygroundDict
  onFormat: () => void
  onToggleSolution: () => void
  onRun: () => void
}

const actionClass =
  "text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"

export const MergeEditorToolbar = ({
  showSolution,
  isFormatting,
  editableFile,
  dict,
  onFormat,
  onToggleSolution,
  onRun,
}: Readonly<MergeEditorToolbarProps>) => {
  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b px-4 py-2.5 transition-colors duration-200 ${
        showSolution ? "border-amber-500/30 bg-amber-500/[0.04]" : "border-line bg-bg-elev"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-fg-2 font-mono text-[12px]">{editableFile}</span>
        {showSolution && (
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-amber-400 uppercase">
            diff
          </span>
        )}
      </div>

      {showSolution ? (
        <button type="button" onClick={onToggleSolution} className={actionClass}>
          {dict.active.backToEdit}
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onFormat}
            disabled={isFormatting}
            className={`${actionClass} disabled:opacity-40`}
          >
            {isFormatting ? "formatting…" : "format"}
          </button>
          <button type="button" onClick={onToggleSolution} className={actionClass}>
            {dict.active.viewSolution}
          </button>
          <button
            type="button"
            onClick={onRun}
            className="border-line bg-bg-card hover:border-line-2 text-fg-2 flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[11px] transition-colors duration-(--d-fast) ease-(--ease)"
          >
            {dict.active.run}
            <span className="text-fg-faint">{isMac() ? "⌘↵" : "Ctrl↵"}</span>
          </button>
        </div>
      )}
    </div>
  )
}
