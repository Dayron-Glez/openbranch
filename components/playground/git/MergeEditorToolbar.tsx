import type { PlaygroundDict } from "@/lib/playground-dictionary"

const isMac = (): boolean => typeof navigator !== "undefined" && navigator.platform.includes("Mac")

export type MergeTab = "merged" | "base" | "ours" | "theirs"

type MergeEditorToolbarProps = {
  activeTab: MergeTab
  showSolution: boolean
  isFormatting: boolean
  oursLabel: string
  theirsLabel: string
  editableFile: string
  dict: PlaygroundDict
  onSelectTab: (tab: MergeTab) => void
  onFormat: () => void
  onToggleSolution: () => void
  onRun: () => void
}

const tabClass = (active: boolean): string =>
  `rounded px-2 py-1 font-mono text-[12px] transition-colors duration-(--d-fast) ease-(--ease) ${
    active ? "bg-bg-card text-fg-2" : "text-fg-muted hover:text-fg-2"
  }`

const actionClass =
  "text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"

export const MergeEditorToolbar = ({
  activeTab,
  showSolution,
  isFormatting,
  oursLabel,
  theirsLabel,
  editableFile,
  dict,
  onSelectTab,
  onFormat,
  onToggleSolution,
  onRun,
}: Readonly<MergeEditorToolbarProps>) => {
  const isEditing = activeTab === "merged"
  const showActions = !showSolution && isEditing

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
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectTab("merged")}
            className={tabClass(activeTab === "merged")}
          >
            {dict.active.tabMerged}
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("base")}
            className={`flex items-baseline gap-2 ${tabClass(activeTab === "base")}`}
          >
            <span>{dict.active.tabBase}</span>
            <span className="text-fg-muted text-[10px] tracking-wide">
              {dict.active.readOnlyLabel}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("ours")}
            className={`flex items-baseline gap-2 ${tabClass(activeTab === "ours")}`}
          >
            <span>{dict.active.tabOurs}</span>
            <span className="text-fg-faint text-[10px]">{oursLabel}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("theirs")}
            className={`flex items-baseline gap-2 ${tabClass(activeTab === "theirs")}`}
          >
            <span>{dict.active.tabTheirs}</span>
            <span className="text-fg-faint text-[10px]">{theirsLabel}</span>
          </button>
        </div>
      )}

      {showSolution && (
        <button type="button" onClick={onToggleSolution} className={actionClass}>
          {dict.active.backToEdit}
        </button>
      )}

      {showActions && (
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
