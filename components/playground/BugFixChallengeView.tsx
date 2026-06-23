"use client"

import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount } from "@monaco-editor/react"
import { useState, useCallback, useRef, useTransition, useEffect } from "react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { saveBugFixState, completeBugFixChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { BugFixTemplate } from "@/lib/playground/sandpack-templates/bug-fix-off-by-one"
import { HintPanel } from "@/components/playground/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlaygroundBreadcrumb } from "@/components/playground/PlaygroundBreadcrumb"
import { configureMonaco } from "@/components/playground/monacoTheme"
import { DiffView } from "@/components/playground/DiffView"
import { TestCard, INITIAL_TEST_STATE } from "@/components/playground/TestCard"
import type { TestResult, TestRunState } from "@/components/playground/TestCard"

const AUTOSAVE_DELAY_MS = 800
const AUTORUN_DELAY_MS = 1500

type WorkerResultMessage =
  | {
      readonly type: "result"
      readonly results: ReadonlyArray<{
        readonly name: string
        readonly status: "pass" | "fail"
        readonly error?: { readonly expected: string; readonly received: string }
      }>
    }
  | { readonly type: "error"; readonly message: string }

type BugFixChallengeViewProps = {
  readonly title: string
  readonly template: BugFixTemplate
  readonly initialCode: string | null
  readonly slug: string
  readonly lang: string
  readonly playgroundPath: string
  readonly challengePath: string
  readonly dict: PlaygroundDict
}

const updateEditorMarkers = (
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  monaco: typeof Monaco | null,
  bugLine: number | undefined,
  status: "pass" | "fail"
): void => {
  if (editor === null || monaco === null || bugLine === undefined) return
  const model = editor.getModel()
  if (model === null) return
  monaco.editor.setModelMarkers(
    model,
    "bug-hint",
    status === "fail"
      ? [
          {
            startLineNumber: bugLine,
            endLineNumber: bugLine,
            startColumn: 1,
            endColumn: 1000,
            message: "Tests are failing — this line may be the cause",
            severity: monaco.MarkerSeverity.Warning,
          },
        ]
      : []
  )
}

const clearEditorMarkers = (
  editor: Monaco.editor.IStandaloneCodeEditor | null,
  monaco: typeof Monaco | null
): void => {
  if (editor === null || monaco === null) return
  const model = editor.getModel()
  if (model !== null) monaco.editor.setModelMarkers(model, "bug-hint", [])
}

const createWorkerMessageHandler =
  (
    editorRef: React.RefObject<Monaco.editor.IStandaloneCodeEditor | null>,
    monacoRef: React.RefObject<typeof Monaco | null>,
    showSolutionRef: React.RefObject<boolean>,
    bugLine: number | undefined,
    setTestState: React.Dispatch<React.SetStateAction<TestRunState>>
  ) =>
  (event: MessageEvent<WorkerResultMessage>): void => {
    const msg = event.data
    if (msg.type === "error") {
      setTestState((prev) => ({
        ...prev,
        status: "fail" as const,
        tests: prev.tests.map((t) => ({ ...t, status: "idle" as const })),
        compileError: msg.message,
      }))
      clearEditorMarkers(editorRef.current, monacoRef.current)
      return
    }
    if (showSolutionRef.current) return
    const results: TestResult[] = msg.results.map((r) => ({
      name: r.name,
      status: r.status,
      error: r.error,
    }))
    const passCount = results.filter((r) => r.status === "pass").length
    const nextStatus =
      passCount === results.length && results.length > 0 ? ("pass" as const) : ("fail" as const)
    updateEditorMarkers(editorRef.current, monacoRef.current, bugLine, nextStatus)
    setTestState({
      status: nextStatus,
      tests: results,
      passCount,
      totalCount: results.length,
      compileError: null,
    })
  }

export const BugFixChallengeView = ({
  title,
  template,
  initialCode,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: BugFixChallengeViewProps): React.ReactElement => {
  const originalCode = template.files[template.editableFile]?.code ?? ""
  const testCode = template.files[template.testFile]?.code ?? ""
  const activeHints = template.hintsByLang?.[lang] ?? template.hints

  const [code, setCode] = useState<string>(initialCode ?? originalCode)
  const [testState, setTestState] = useState<TestRunState>(INITIAL_TEST_STATE)
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [hasTypeErrors, setHasTypeErrors] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const workerRef = useRef<Worker | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showSolutionRef = useRef<boolean>(false)
  const hasInitializedRef = useRef<boolean>(false)
  showSolutionRef.current = showSolution

  useEffect(() => {
    const worker = new Worker(
      new URL("../../lib/playground/test-runner.worker.ts", import.meta.url)
    )
    worker.onmessage = createWorkerMessageHandler(
      editorRef,
      monacoRef,
      showSolutionRef,
      template.bugLine,
      setTestState
    )
    workerRef.current = worker
    return () => worker.terminate()
  }, [template.bugLine])

  const runTests = useCallback(
    (currentCode: string): void => {
      const worker = workerRef.current
      if (worker === null) return
      setTestState((prev) => ({ ...prev, status: "running", compileError: null }))
      worker.postMessage({ type: "run", userCode: currentCode, testCode })
    },
    [testCode]
  )

  const scheduleAutoSave = useCallback(
    (newCode: string): void => {
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        void saveBugFixState(slug, lang, newCode)
      }, AUTOSAVE_DELAY_MS)
    },
    [slug, lang]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined): void => {
      if (value === undefined || showSolutionRef.current) return
      setCode(value)
      scheduleAutoSave(value)
      if (autoRunTimeoutRef.current !== null) clearTimeout(autoRunTimeoutRef.current)
      autoRunTimeoutRef.current = setTimeout(() => {
        runTests(value)
      }, AUTORUN_DELAY_MS)
    },
    [scheduleAutoSave, runTests]
  )

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      if (!hasInitializedRef.current) {
        // First mount: path-based Monaco models persist across page reloads in the
        // same browser session, so the model may have stale content. Force correct value.
        const correctInitial = initialCode ?? originalCode
        if (editor.getValue() !== correctInitial) {
          editor.setValue(correctInitial)
        }
        hasInitializedRef.current = true
      }

      const markerDisposable = monaco.editor.onDidChangeMarkers((resources: Monaco.Uri[]) => {
        if (showSolutionRef.current) return
        const model = editor.getModel()
        if (model === null) return
        if (!resources.some((r: Monaco.Uri) => r.toString() === model.uri.toString())) return
        const markers = monaco.editor.getModelMarkers({ resource: model.uri })
        setHasTypeErrors(
          markers.some(
            (m: Monaco.editor.IMarker) =>
              m.severity === monaco.MarkerSeverity.Error && m.owner !== "bug-hint"
          )
        )
      })
      editor.onDidDispose(() => markerDisposable.dispose())

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        if (autoRunTimeoutRef.current !== null) clearTimeout(autoRunTimeoutRef.current)
        runTests(editor.getValue())
      })
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
        editor
          .getAction("editor.action.formatDocument")
          ?.run()
          ?.catch(() => undefined)
      })
      if (autoRunTimeoutRef.current !== null) clearTimeout(autoRunTimeoutRef.current)
      runTests(editor.getValue())
    },
    [runTests, initialCode, originalCode]
  )

  const handleSubmit = useCallback((): void => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    startTransition(async () => {
      await saveBugFixState(slug, lang, code)
      await completeBugFixChallenge(slug, lang)
    })
  }, [slug, lang, code])

  const [isFormatting, setIsFormatting] = useState<boolean>(false)

  const handleFormat = useCallback(async (): Promise<void> => {
    const editor = editorRef.current
    if (editor === null || isFormatting) return
    setIsFormatting(true)
    try {
      const [prettier, parserTypeScript, parserEstree] = await Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/typescript"),
        import("prettier/plugins/estree"),
      ])
      const formatted = await prettier.format(editor.getValue(), {
        parser: "typescript",
        plugins: [parserTypeScript, parserEstree],
        semi: false,
        singleQuote: false,
        trailingComma: "es5",
        printWidth: 100,
        tabWidth: 2,
      })
      const trimmed = formatted.trimEnd()
      editor.setValue(trimmed)
      setCode(trimmed)
      scheduleAutoSave(trimmed)
    } catch {
      editor
        .getAction("editor.action.formatDocument")
        ?.run()
        ?.catch(() => undefined)
    } finally {
      setIsFormatting(false)
    }
  }, [isFormatting, scheduleAutoSave])

  const handleToggleSolution = useCallback((): void => {
    const nextShowSolution = !showSolution
    setShowSolution(nextShowSolution)
    if (!nextShowSolution) {
      setHasTypeErrors(false)
      runTests(code)
    }
  }, [showSolution, code, runTests])

  const allTestsPassing = testState.status === "pass"
  const canSubmit = allTestsPassing && !hasTypeErrors

  let countClass = "text-fg-muted"
  if (allTestsPassing) countClass = "text-ob-accent"
  else if (testState.status === "fail") countClass = "text-danger"

  const passLabel =
    testState.totalCount > 0
      ? `${testState.passCount}/${testState.totalCount} ${dict.active.passing}`
      : dict.active.waitingForEditor

  return (
    <main
      data-pg-main
      className="relative z-1 flex h-full flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col px-7 pt-10 max-[900px]:flex-none max-[900px]:pb-10 max-[520px]:px-5">
        <PlaygroundBreadcrumb
          playgroundPath={playgroundPath}
          challengePath={challengePath}
          title={title}
          inProgressLabel={dict.status.inProgress}
        />

        {/* two-column layout */}
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] grid-rows-1 gap-10 max-[900px]:grid-cols-1 max-[900px]:grid-rows-none">
          {/* ── left column: editor ── */}
          <div className="min-w-0 min-[901px]:pb-10">
            <div
              className={`flex h-full min-h-[400px] flex-col overflow-hidden rounded-[var(--r-8)] border transition-colors duration-200 ${
                showSolution ? "border-amber-500/40" : "border-line"
              }`}
            >
              {/* file header */}
              <div
                className={`flex shrink-0 items-center justify-between border-b px-4 py-2.5 transition-colors duration-200 ${
                  showSolution
                    ? "border-amber-500/30 bg-amber-500/[0.04]"
                    : "border-line bg-bg-elev"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-fg-2 font-mono text-[12px]">{template.editableFile}</span>
                  {showSolution && (
                    <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-amber-400 uppercase">
                      diff
                    </span>
                  )}
                  {showSolution && (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-green-400">
                        <span className="size-1.5 rounded-full bg-green-400" /> added
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-red-400">
                        <span className="size-1.5 rounded-full bg-red-400" /> removed
                      </span>
                    </div>
                  )}
                </div>
                {showSolution ? (
                  <button
                    type="button"
                    onClick={handleToggleSolution}
                    className="text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
                  >
                    {dict.active.backToEdit}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleFormat().catch(() => undefined)
                      }}
                      disabled={isFormatting}
                      className="text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease) disabled:opacity-40"
                    >
                      {isFormatting ? "formatting…" : "format"}
                    </button>
                    <span className="text-fg-faint font-mono text-[11.5px] select-none">·</span>
                    <button
                      type="button"
                      onClick={handleToggleSolution}
                      className="text-fg-muted hover:text-fg-2 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
                    >
                      {dict.active.viewSolution}
                    </button>
                    <kbd className="border-line bg-bg-card text-fg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
                      {typeof navigator !== "undefined" && navigator.platform.includes("Mac")
                        ? "⌘↵ run"
                        : "Ctrl+↵ run"}
                    </kbd>
                  </div>
                )}
              </div>

              <div className="min-h-0 flex-1">
                {showSolution ? (
                  <DiffView original={originalCode} solution={template.solutionCode} />
                ) : (
                  <Editor
                    height="100%"
                    language="typescript"
                    theme="ob-dark"
                    path={`file:///${template.editableFile}`}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    beforeMount={configureMonaco}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 22,
                      fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
                      fontLigatures: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      renderLineHighlight: "line",
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
                      contextmenu: false,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── right column ── */}
          <aside className="max-[900px]:order-first">
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 min-[901px]:pr-3 min-[901px]:pb-10">
                {/* title + exit */}
                <div>
                  <h1 className="text-fg mb-2 text-[20px] leading-[1.2] font-medium tracking-[-0.02em]">
                    {title}
                  </h1>
                  <Link
                    href={challengePath}
                    className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="size-3 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M10 3L5 8l5 5" />
                    </svg>
                    {dict.active.exitLabel}
                  </Link>
                </div>

                <div className="border-line border-t" />

                {/* test results */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
                      {dict.active.testsLabel}
                    </p>
                    <span
                      className={`font-mono text-[11.5px] font-medium tabular-nums transition-colors ${countClass}`}
                    >
                      {testState.status === "running" ? (
                        <span className="flex items-center gap-1.5">
                          <span className="border-fg-faint size-3 animate-spin rounded-full border border-t-transparent" />
                          {dict.active.running}
                        </span>
                      ) : (
                        passLabel
                      )}
                    </span>
                  </div>

                  {testState.compileError !== null && (
                    <div className="rounded-[var(--r-8)] border border-red-500/20 bg-red-500/[0.03] p-3">
                      <p className="text-danger mb-1 font-mono text-[10.5px] tracking-wide uppercase">
                        {dict.active.syntaxError}
                      </p>
                      <p className="text-fg-muted font-mono text-[11px] leading-relaxed">
                        {dict.active.fixSyntax}
                      </p>
                    </div>
                  )}
                  {testState.compileError === null && testState.tests.length === 0 && (
                    <p className="text-fg-muted font-mono text-[11.5px]">
                      {dict.active.editToStart}
                    </p>
                  )}
                  {testState.compileError === null && testState.tests.length > 0 && (
                    <div className="border-line bg-bg-elev flex flex-col gap-3 rounded-[var(--r-8)] border p-3">
                      {testState.tests.map((test, i) => (
                        <TestCard key={test.name} test={test} index={i} />
                      ))}
                    </div>
                  )}

                  {allTestsPassing && !hasTypeErrors && (
                    <div className="border-accent-ring bg-accent-soft rounded-[var(--r-8)] border px-3 py-2.5">
                      <p className="text-ob-accent font-mono text-[12px]">
                        {dict.active.allTestsPassing}
                      </p>
                    </div>
                  )}
                  {allTestsPassing && hasTypeErrors && (
                    <div className="rounded-[var(--r-8)] border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5">
                      <p className="font-mono text-[12px] text-amber-400">
                        {dict.active.fixTypeErrors}
                      </p>
                    </div>
                  )}
                </div>

                {/* submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isPending}
                  className="bg-ob-accent text-accent-ink flex h-10 w-full items-center justify-center gap-2 rounded-[var(--r-8)] font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
                >
                  {isPending ? (
                    <>
                      <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {dict.active.submitting}
                    </>
                  ) : (
                    dict.active.submitButton
                  )}
                </button>

                <div className="border-line border-t" />

                {/* hints */}
                <HintPanel
                  hints={activeHints}
                  revealLabel={dict.active.revealHint}
                  hintsLabel={dict.active.hintsLabel}
                />
              </div>
            </ScrollArea>
          </aside>
        </div>
      </div>
    </main>
  )
}
