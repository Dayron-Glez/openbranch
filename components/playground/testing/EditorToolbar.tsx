import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

const isMac = (): boolean => typeof navigator !== "undefined" && navigator.platform.includes("Mac")

type EditorToolbarProps = {
  readonly editableFile: string
  readonly sourceFile: string
  readonly activeTab: "test" | "source"
  readonly showSolution: boolean
  readonly isFormatting: boolean
  readonly dict: PlaygroundDict
  readonly onSelectTab: (tab: "test" | "source") => void
  readonly onFormat: () => void
  readonly onToggleSolution: () => void
}

const tabClass = (active: boolean): string =>
  `rounded px-2 py-1 font-mono text-[12px] transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "bg-bg-card text-fg-2" : "text-fg-muted hover:text-fg-2"
  }`

const actionClass =
  "text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"

export const EditorToolbar = ({
  editableFile,
  sourceFile,
  activeTab,
  showSolution,
  isFormatting,
  dict,
  onSelectTab,
  onFormat,
  onToggleSolution,
}: EditorToolbarProps): React.ReactElement => {
  const onSourceTab = activeTab === "source"

  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b px-4 py-2.5 transition-colors duration-200 ${
        showSolution ? "border-amber-500/30 bg-amber-500/[0.04]" : "border-line bg-bg-elev"
      }`}
    >
      {showSolution ? (
        <div className="flex items-center gap-2.5">
          <span className="text-fg-2 font-mono text-[12px]">{editableFile}</span>
          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-amber-400 uppercase">
            diff
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectTab("test")}
            className={tabClass(!onSourceTab)}
          >
            {editableFile}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("source")}
            className={`flex items-center gap-1.5 ${tabClass(onSourceTab)}`}
          >
            {sourceFile}
            <span className="text-fg-faint text-[10px]">{dict.active.readOnlyLabel}</span>
          </button>
        </div>
      )}

      {showSolution ? (
        <button type="button" onClick={onToggleSolution} className={actionClass}>
          {dict.active.backToEdit}
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {!onSourceTab && (
            <button
              type="button"
              onClick={onFormat}
              disabled={isFormatting}
              className={`${actionClass} disabled:opacity-40`}
            >
              {isFormatting ? "formatting…" : "format"}
            </button>
          )}
          <button type="button" onClick={onToggleSolution} className={actionClass}>
            {dict.active.viewSolution}
          </button>
          <kbd className="border-line bg-bg-card text-fg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
            {isMac() ? "⌘↵ run" : "Ctrl+↵ run"}
          </kbd>
        </div>
      )}
    </div>
  )
}
