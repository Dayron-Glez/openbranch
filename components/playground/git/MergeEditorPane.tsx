"use client"

import { useCallback } from "react"
import type React from "react"
import type { Monaco, OnMount } from "@monaco-editor/react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { GitTemplate } from "@/lib/playground/git-templates/git-merge-conflict"
import type { GitBlockResolution } from "@/lib/playground/review-types"
import { DiffView } from "@/components/playground/DiffView"
import { configureMonaco } from "@/components/playground/monacoTheme"
import { MergeEditorToolbar } from "./MergeEditorToolbar"
import { ThreeWayMergeEditor, type ThreeWayMergeEditorHandle } from "./ThreeWayMergeEditor"

type MergeEditorPaneProps = {
  template: GitTemplate
  showSolution: boolean
  isFormatting: boolean
  dict: PlaygroundDict
  mergeEditorRef: React.Ref<ThreeWayMergeEditorHandle>
  initialResolutions?: readonly GitBlockResolution[]
  onFormat: () => void
  onToggleSolution: () => void
  onRun: () => void
  onEditorChange: (result: string, remaining: number) => void
  onBlocksChange: (resolutions: readonly GitBlockResolution[]) => void
  onCenterMount: OnMount
}

export const MergeEditorPane = ({
  template,
  showSolution,
  isFormatting,
  dict,
  mergeEditorRef,
  initialResolutions,
  onFormat,
  onToggleSolution,
  onRun,
  onEditorChange,
  onBlocksChange,
  onCenterMount,
}: Readonly<MergeEditorPaneProps>) => {
  const conflictedStarter = template.files[template.editableFile]?.code ?? ""

  const handleBeforeMount = useCallback(
    (monaco: Monaco): void => {
      configureMonaco(monaco)
      for (const [path, file] of Object.entries(template.files)) {
        if (path === template.editableFile) continue
        const uri = monaco.Uri.parse(`file:///${path}`)
        if (monaco.editor.getModel(uri) === null) {
          monaco.editor.createModel(file.code, "typescript", uri)
        }
      }
    },
    [template]
  )

  return (
    <div className="h-full">
      <div
        className={`flex h-full min-h-[400px] flex-col overflow-hidden rounded-(--r-8) border transition-colors duration-200 ${
          showSolution ? "border-amber-500/40" : "border-line"
        }`}
      >
        <MergeEditorToolbar
          showSolution={showSolution}
          isFormatting={isFormatting}
          editableFile={template.editableFile}
          dict={dict}
          onFormat={onFormat}
          onToggleSolution={onToggleSolution}
          onRun={onRun}
        />

        <div className="min-h-0 flex-1">
          {showSolution && (
            <DiffView original={conflictedStarter} solution={template.solutionCode} />
          )}

          {!showSolution && (
            <ThreeWayMergeEditor
              ref={mergeEditorRef}
              base={template.versions.base}
              left={template.versions.ours}
              right={template.versions.theirs}
              conflictedCode={conflictedStarter}
              language="typescript"
              leftTitle={template.oursLabel}
              resultTitle={template.editableFile}
              rightTitle={template.theirsLabel}
              centerPath={`file:///${template.editableFile}`}
              initialResolutions={initialResolutions}
              onBlocksChange={onBlocksChange}
              onChange={onEditorChange}
              onBeforeMount={handleBeforeMount}
              onCenterMount={onCenterMount}
              className="h-full rounded-none border-0"
            />
          )}
        </div>
      </div>
    </div>
  )
}
