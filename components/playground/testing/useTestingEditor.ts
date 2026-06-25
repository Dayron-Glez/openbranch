import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount } from "@monaco-editor/react"
import { useState, useRef, useCallback } from "react"
import { saveTestingState } from "@/app/actions/playground"
import type { TestingTemplate } from "@/lib/playground/sandpack-templates/testing-fetchupstream"
import { formatTypeScript } from "@/components/playground/formatTypeScript"

const AUTOSAVE_DELAY_MS = 800

type UseTestingEditorArgs = {
  readonly template: TestingTemplate
  readonly slug: string
  readonly lang: string
  readonly initialTestCode: string | null
  readonly runTests: (testCode: string) => void
  readonly showSolutionRef: React.RefObject<boolean>
}

type TestingEditor = {
  readonly testCode: string
  readonly testCodeRef: React.RefObject<string>
  readonly isFormatting: boolean
  readonly handleEditorChange: (value: string | undefined) => void
  readonly handleEditorMount: OnMount
  readonly handleFormat: () => Promise<void>
}

// Owns the editable test file: its value, autosave + autorun debounce,
// Monaco mount wiring (source model, shortcuts) and formatting.
export const useTestingEditor = ({
  template,
  slug,
  lang,
  initialTestCode,
  runTests,
  showSolutionRef,
}: UseTestingEditorArgs): TestingEditor => {
  const starter = initialTestCode ?? template.starterTests

  const [testCode, setTestCode] = useState<string>(starter)
  const [isFormatting, setIsFormatting] = useState<boolean>(false)

  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const testCodeRef = useRef<string>(starter)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasInitializedRef = useRef<boolean>(false)

  const scheduleAutoSave = useCallback(
    (newCode: string): void => {
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        void saveTestingState(slug, lang, newCode)
      }, AUTOSAVE_DELAY_MS)
    },
    [slug, lang]
  )

  const applyCode = useCallback(
    (value: string): void => {
      setTestCode(value)
      testCodeRef.current = value
      scheduleAutoSave(value)
    },
    [scheduleAutoSave]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined): void => {
      if (value === undefined || showSolutionRef.current) return
      applyCode(value)
    },
    [applyCode, showSolutionRef]
  )

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor

      // Pre-create the read-only source model so the test's relative import
      // (`./request`) resolves and Monaco shows no spurious 2307 error.
      const sourceUri = monaco.Uri.parse(`file:///${template.sourceFile}`)
      if (monaco.editor.getModel(sourceUri) === null) {
        monaco.editor.createModel(template.correctSource, "typescript", sourceUri)
      }

      if (!hasInitializedRef.current) {
        if (editor.getValue() !== starter) editor.setValue(starter)
        hasInitializedRef.current = true
      }

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        runTests(testCodeRef.current)
      })
    },
    [template, starter, runTests]
  )

  const handleFormat = useCallback(async (): Promise<void> => {
    const editor = editorRef.current
    if (editor === null || isFormatting) return
    setIsFormatting(true)
    try {
      const trimmed = await formatTypeScript(testCodeRef.current)
      editor.setValue(trimmed)
      applyCode(trimmed)
    } catch {
      editor
        .getAction("editor.action.formatDocument")
        ?.run()
        ?.catch(() => undefined)
    } finally {
      setIsFormatting(false)
    }
  }, [isFormatting, applyCode])

  return {
    testCode,
    testCodeRef,
    isFormatting,
    handleEditorChange,
    handleEditorMount,
    handleFormat,
  }
}
