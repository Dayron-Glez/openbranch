import type React from "react"
import type { OnMount } from "@monaco-editor/react"
import Editor from "@monaco-editor/react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { TestingTemplate } from "@/lib/playground/sandpack-templates/testing-fetchupstream"
import { DiffView } from "@/components/playground/DiffView"
import { configureTestingMonaco, EDITOR_OPTIONS } from "@/components/playground/monacoTheme"
import { EditorToolbar } from "./EditorToolbar"

type EditorPaneProps = {
  readonly template: TestingTemplate
  readonly testCode: string
  readonly activeTab: "test" | "source"
  readonly showSolution: boolean
  readonly isFormatting: boolean
  readonly dict: PlaygroundDict
  readonly onSelectTab: (tab: "test" | "source") => void
  readonly onFormat: () => void
  readonly onToggleSolution: () => void
  readonly onRun: () => void
  readonly onEditorChange: (value: string | undefined) => void
  readonly onEditorMount: OnMount
}

export const EditorPane = ({
  template,
  testCode,
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
}: EditorPaneProps): React.ReactElement => {
  const onSourceTab = activeTab === "source"
  return (
    <div className="min-w-0 min-[901px]:pb-10">
      <div
        className={`flex h-full min-h-[400px] flex-col overflow-hidden rounded-(--r-8) border transition-colors duration-200 ${
          showSolution ? "border-amber-500/40" : "border-line"
        }`}
      >
        <EditorToolbar
          editableFile={template.editableFile}
          sourceFile={template.sourceFile}
          activeTab={activeTab}
          showSolution={showSolution}
          isFormatting={isFormatting}
          dict={dict}
          onSelectTab={onSelectTab}
          onFormat={onFormat}
          onToggleSolution={onToggleSolution}
          onRun={onRun}
        />

        <div className="min-h-0 flex-1">
          {showSolution && (
            <DiffView original={template.starterTests} solution={template.referenceTests} />
          )}
          {/* Two separate editor instances keep the test and source models fully
              isolated — a single editor that swaps path/value lets edits/format
              leak between the two files. */}
          {!showSolution && onSourceTab && (
            <Editor
              key="source"
              height="100%"
              language="typescript"
              theme="ob-dark"
              path={`file:///${template.sourceFile}`}
              value={template.correctSource}
              beforeMount={configureTestingMonaco}
              options={{ ...EDITOR_OPTIONS, readOnly: true }}
            />
          )}
          {!showSolution && !onSourceTab && (
            <Editor
              key="test"
              height="100%"
              language="typescript"
              theme="ob-dark"
              path={`file:///${template.editableFile}`}
              value={testCode}
              onChange={onEditorChange}
              onMount={onEditorMount}
              beforeMount={configureTestingMonaco}
              options={{ ...EDITOR_OPTIONS, readOnly: false }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
