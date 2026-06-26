import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount } from "@monaco-editor/react"
import { useState, useRef, useCallback } from "react"
import type { GitTemplate } from "@/lib/playground/git-templates/git-merge-conflict"
import { formatTypeScript } from "@/components/playground/formatTypeScript"

export type WorkerResultMessage =
  | {
      readonly type: "result"
      readonly results: ReadonlyArray<{
        readonly name: string
        readonly status: "pass" | "fail"
        readonly error?: { readonly expected: string; readonly received: string }
      }>
    }
  | { readonly type: "error"; readonly message: string }

type UseMergeEditorArgs = {
  readonly template: GitTemplate
  readonly runHiddenTests: (mergedCode: string) => void
}

export type MergeEditorState = {
  readonly editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor | null>
  readonly monacoRef: React.RefObject<typeof Monaco | null>
  readonly hasTypeErrors: boolean | null
  readonly isFormatting: boolean
  readonly handleEditorMount: OnMount
  readonly handleFormat: () => Promise<void>
}

export const useMergeEditor = ({
  template,
  runHiddenTests,
}: UseMergeEditorArgs): MergeEditorState => {
  const [hasTypeErrors, setHasTypeErrors] = useState<boolean | null>(null)
  const [isFormatting, setIsFormatting] = useState<boolean>(false)

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      // Pre-create read-only models for each dependency so TypeScript imports resolve.
      for (const [path, file] of Object.entries(template.files)) {
        if (path === template.editableFile) continue
        const uri = monaco.Uri.parse(`file:///${path}`)
        if (monaco.editor.getModel(uri) === null) {
          monaco.editor.createModel(file.code, "typescript", uri)
        }
      }

      monaco.editor.onDidChangeMarkers(() => {
        const model = editor.getModel()
        if (model === null) return
        const markers = monaco.editor.getModelMarkers({ resource: model.uri })
        setHasTypeErrors(
          markers.some(
            (m: Monaco.editor.IMarker) =>
              m.severity === monaco.MarkerSeverity.Error && m.owner !== "conflict-hint"
          )
        )
      })

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        runHiddenTests(editor.getModel()?.getValue() ?? "")
      })
    },
    [template, runHiddenTests]
  )

  const handleFormat = useCallback(async (): Promise<void> => {
    const editor = editorRef.current
    if (editor === null || isFormatting) return
    setIsFormatting(true)
    try {
      const current = editor.getModel()?.getValue() ?? ""
      const trimmed = await formatTypeScript(current)
      editor.setValue(trimmed)
    } catch {
      editor
        .getAction("editor.action.formatDocument")
        ?.run()
        ?.catch(() => undefined)
    } finally {
      setIsFormatting(false)
    }
  }, [isFormatting])

  return {
    editorRef,
    monacoRef,
    hasTypeErrors,
    isFormatting,
    handleEditorMount,
    handleFormat,
  }
}
