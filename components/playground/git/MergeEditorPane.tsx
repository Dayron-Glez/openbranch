import type { OnMount } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { GitTemplate } from "@/lib/playground/git-templates/git-merge-conflict"
import { DiffView } from "@/components/playground/DiffView"
import { configureMonaco, EDITOR_OPTIONS } from "@/components/playground/monacoTheme"
import { MergeEditorToolbar } from "./MergeEditorToolbar"
import type { MergeTab } from "./MergeEditorToolbar"

type MergeEditorPaneProps = {
  template: GitTemplate
  code: string
  activeTab: MergeTab
  showSolution: boolean
  isFormatting: boolean
  dict: PlaygroundDict
  onSelectTab: (tab: MergeTab) => void
  onFormat: () => void
  onToggleSolution: () => void
  onRun: () => void
  onEditorChange: (value: string | undefined) => void
  onEditorMount: OnMount
}

const READ_ONLY_OPTIONS = { ...EDITOR_OPTIONS, readOnly: true }

export const MergeEditorPane = ({
  template,
  code,
  activeTab,
  showSolution,
  isFormatting,
  dict,
  onSelectTab,
  onFormat,
  onToggleSolution,
  onRun,
  onEditorChange,
  onEditorMount,
}: Readonly<MergeEditorPaneProps>) => {
  const conflictedStarter = template.files[template.editableFile]?.code ?? ""

  return (
    <div className="min-w-0 min-[901px]:pb-10">
      <div
        className={`flex h-full min-h-[400px] flex-col overflow-hidden rounded-(--r-8) border transition-colors duration-200 ${
          showSolution ? "border-amber-500/40" : "border-line"
        }`}
      >
        <MergeEditorToolbar
          activeTab={activeTab}
          showSolution={showSolution}
          isFormatting={isFormatting}
          oursLabel={template.oursLabel}
          theirsLabel={template.theirsLabel}
          editableFile={template.editableFile}
          dict={dict}
          onSelectTab={onSelectTab}
          onFormat={onFormat}
          onToggleSolution={onToggleSolution}
          onRun={onRun}
        />

        <div className="min-h-0 flex-1">
          {showSolution && (
            <DiffView original={conflictedStarter} solution={template.solutionCode} />
          )}

          {/* Each tab is its own keyed editor instance to prevent model leakage. */}
          {!showSolution && activeTab === "merged" && (
            <Editor
              key="merged"
              height="100%"
              language="typescript"
              theme="ob-dark"
              path={`file:///${template.editableFile}`}
              value={code}
              onChange={onEditorChange}
              onMount={onEditorMount}
              beforeMount={configureMonaco}
              options={{ ...EDITOR_OPTIONS, readOnly: false }}
            />
          )}
          {!showSolution && activeTab === "base" && (
            <Editor
              key="base"
              height="100%"
              language="typescript"
              theme="ob-dark"
              value={template.versions.base}
              beforeMount={configureMonaco}
              options={READ_ONLY_OPTIONS}
            />
          )}
          {!showSolution && activeTab === "ours" && (
            <Editor
              key="ours"
              height="100%"
              language="typescript"
              theme="ob-dark"
              value={template.versions.ours}
              beforeMount={configureMonaco}
              options={READ_ONLY_OPTIONS}
            />
          )}
          {!showSolution && activeTab === "theirs" && (
            <Editor
              key="theirs"
              height="100%"
              language="typescript"
              theme="ob-dark"
              value={template.versions.theirs}
              beforeMount={configureMonaco}
              options={READ_ONLY_OPTIONS}
            />
          )}
        </div>
      </div>
    </div>
  )
}
