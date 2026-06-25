import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount } from "@monaco-editor/react"
import { useState, useRef, useCallback } from "react"
import { saveGitState } from "@/app/actions/playground"
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

const AUTOSAVE_DELAY_MS = 800
const AUTORUN_DELAY_MS = 1500
const CONFLICT_MARKER_RE = /^<{7}|^>{7}/m

const countConflicts = (code: string): number => {
  const matches = code.match(/^<{7}/gm)
  return matches?.length ?? 0
}

type UseMergeEditorArgs = {
  readonly template: GitTemplate
  readonly slug: string
  readonly lang: string
  readonly initialCode: string | null
  readonly runHiddenTests: (mergedCode: string) => void
}

export type MergeEditorState = {
  readonly code: string
  readonly codeRef: React.RefObject<string>
  readonly conflictsRemaining: number
  readonly hasTypeErrors: boolean
  readonly isFormatting: boolean
  readonly handleEditorChange: (value: string | undefined) => void
  readonly handleEditorMount: OnMount
  readonly handleFormat: () => Promise<void>
}

export const useMergeEditor = ({
  template,
  slug,
  lang,
  initialCode,
  runHiddenTests,
}: UseMergeEditorArgs): MergeEditorState => {
  const starter = initialCode ?? template.files[template.editableFile]?.code ?? ""

  const [code, setCode] = useState<string>(starter)
  const [conflictsRemaining, setConflictsRemaining] = useState<number>(countConflicts(starter))
  const [hasTypeErrors, setHasTypeErrors] = useState<boolean>(true)
  const [isFormatting, setIsFormatting] = useState<boolean>(false)

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const codeRef = useRef<string>(starter)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autorunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasInitializedRef = useRef<boolean>(false)

  const scheduleAutoSave = useCallback(
    (newCode: string): void => {
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        void saveGitState(slug, lang, newCode)
      }, AUTOSAVE_DELAY_MS)
    },
    [slug, lang]
  )

  const scheduleAutoRun = useCallback(
    (newCode: string): void => {
      if (CONFLICT_MARKER_RE.test(newCode)) return
      if (autorunTimeoutRef.current !== null) clearTimeout(autorunTimeoutRef.current)
      autorunTimeoutRef.current = setTimeout(() => {
        runHiddenTests(newCode)
      }, AUTORUN_DELAY_MS)
    },
    [runHiddenTests]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined): void => {
      if (value === undefined) return
      codeRef.current = value
      setCode(value)
      setConflictsRemaining(countConflicts(value))
      scheduleAutoSave(value)
      scheduleAutoRun(value)
    },
    [scheduleAutoSave, scheduleAutoRun]
  )

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      // Pre-create read-only models for each dependency so imports resolve.
      for (const [path, file] of Object.entries(template.files)) {
        if (path === template.editableFile) continue
        const uri = monaco.Uri.parse(`file:///${path}`)
        if (monaco.editor.getModel(uri) === null) {
          monaco.editor.createModel(file.code, "typescript", uri)
        }
      }

      if (!hasInitializedRef.current) {
        if (editor.getValue() !== starter) editor.setValue(starter)
        hasInitializedRef.current = true
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
        if (!CONFLICT_MARKER_RE.test(codeRef.current)) {
          runHiddenTests(codeRef.current)
        }
      })
    },
    [template, starter, runHiddenTests]
  )

  const handleFormat = useCallback(async (): Promise<void> => {
    const editor = editorRef.current
    if (editor === null || isFormatting) return
    setIsFormatting(true)
    try {
      const trimmed = await formatTypeScript(codeRef.current)
      editor.setValue(trimmed)
      codeRef.current = trimmed
      setCode(trimmed)
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
    code,
    codeRef,
    conflictsRemaining,
    hasTypeErrors,
    isFormatting,
    handleEditorChange,
    handleEditorMount,
    handleFormat,
  }
}
