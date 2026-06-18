"use client"

import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount, BeforeMount } from "@monaco-editor/react"
import { useState, useCallback, useRef, useTransition, useEffect } from "react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { saveBugFixState, completeBugFixChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { BugFixTemplate } from "@/lib/playground/sandpack-templates/bug-fix-off-by-one"
import { HintPanel } from "@/components/playground/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"

const AUTOSAVE_DELAY_MS = 800
const AUTORUN_DELAY_MS = 1500

type TestResult = {
  readonly name: string
  readonly status: "idle" | "running" | "pass" | "fail"
  readonly error?: {
    readonly expected: string
    readonly received: string
  }
}

type TestRunState = {
  readonly status: "idle" | "running" | "pass" | "fail"
  readonly tests: readonly TestResult[]
  readonly passCount: number
  readonly totalCount: number
  readonly compileError: string | null
}

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

const INITIAL_TEST_STATE: TestRunState = {
  status: "idle",
  tests: [],
  passCount: 0,
  totalCount: 0,
  compileError: null,
}

type DiffLine = {
  readonly type: "unchanged" | "added" | "removed"
  readonly content: string
  readonly num: number | null
}

const computeLineDiff = (original: string, solution: string): readonly DiffLine[] => {
  const a = original.split("\n")
  const b = solution.split("\n")
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  const raw: Array<{ type: "unchanged" | "added" | "removed"; content: string }> = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      raw.unshift({ type: "unchanged", content: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.unshift({ type: "added", content: b[j - 1] })
      j--
    } else {
      raw.unshift({ type: "removed", content: a[i - 1] })
      i--
    }
  }
  let solutionLine = 0
  return raw.map((line) => {
    if (line.type !== "removed") solutionLine++
    return { ...line, num: line.type !== "removed" ? solutionLine : null }
  })
}

type DiffViewProps = {
  readonly original: string
  readonly solution: string
}

const DiffView = ({ original, solution }: DiffViewProps): React.ReactElement => {
  const lines = computeLineDiff(original, solution)
  return (
    <div
      className="h-full"
      style={{
        backgroundColor: "#0D0F15",
        fontFamily: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <ScrollArea className="h-full">
        <div className="py-4 pr-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex items-center pr-3 ${
                line.type === "added"
                  ? "bg-green-500/[0.08]"
                  : line.type === "removed"
                    ? "bg-red-500/[0.08]"
                    : ""
              }`}
            >
              <span
                className="w-12 shrink-0 pr-4 text-right text-[13px] leading-[22px] select-none"
                style={{ color: "#2D3144" }}
              >
                {line.num ?? ""}
              </span>
              <span
                className={`w-4 shrink-0 text-[13px] leading-[22px] select-none ${
                  line.type === "added"
                    ? "text-green-400"
                    : line.type === "removed"
                      ? "text-red-400"
                      : "text-transparent"
                }`}
              >
                {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
              </span>
              <span
                className={`flex-1 text-[13px] leading-[22px] whitespace-pre ${
                  line.type === "added"
                    ? "text-green-300"
                    : line.type === "removed"
                      ? "text-red-300/80"
                      : ""
                }`}
                style={line.type === "unchanged" ? { color: "#ECEEF1" } : undefined}
              >
                {line.content}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

const configureMonaco: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    strict: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    noUnusedLocals: true,
    noUnusedParameters: false,
    forceConsistentCasingInFileNames: true,
  })
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  })

  monaco.editor.defineTheme("ob-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "A78BFA" },
      { token: "string", foreground: "FCD34D" },
      { token: "number", foreground: "60A5FA" },
      { token: "comment", foreground: "4B5563", fontStyle: "italic" },
      { token: "type", foreground: "5EE39A" },
      { token: "class", foreground: "5EE39A" },
      { token: "interface", foreground: "5EE39A" },
    ],
    colors: {
      "editor.background": "#0D0F15",
      "editor.foreground": "#ECEEF1",
      "editor.lineHighlightBackground": "#141720",
      "editorLineNumber.foreground": "#2D3144",
      "editorLineNumber.activeForeground": "#5C637A",
      "editor.selectionBackground": "#1E3A5F80",
      "editorCursor.foreground": "#5EE39A",
      "editor.inactiveSelectionBackground": "#1E3A5F40",
      "editorWidget.background": "#0D0F15",
      "editorSuggestWidget.background": "#141720",
      "editorSuggestWidget.border": "#1E2235",
      "editorSuggestWidget.selectedBackground": "#1E2235",
      "editorHoverWidget.background": "#0D0F15",
      "editorHoverWidget.border": "#1E2235",
    },
  })
}

type TestCardProps = {
  readonly test: TestResult
  readonly index: number
}

const TestCard = ({ test, index }: TestCardProps): React.ReactElement => {
  const statusDot =
    test.status === "pass" ? (
      <span className="text-ob-accent mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-green-500/10 font-mono text-[11px]">
        ✓
      </span>
    ) : test.status === "fail" ? (
      <span className="text-danger mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-red-500/10 font-mono text-[11px]">
        ✕
      </span>
    ) : test.status === "running" ? (
      <span className="border-fg-faint mt-0.5 size-[18px] shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
    ) : (
      <span className="border-fg-faint mt-0.5 size-[18px] shrink-0 rounded-full border-2" />
    )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2.5">
        {statusDot}
        <span
          className={`font-mono text-[11.5px] leading-[1.5] ${
            test.status === "pass"
              ? "text-fg-2"
              : test.status === "fail"
                ? "text-fg"
                : "text-fg-muted"
          }`}
        >
          {index + 1}. {test.name}
        </span>
      </div>
      {test.status === "fail" && test.error !== undefined && (
        <div className="border-line ml-[26px] rounded-[var(--r-8)] border bg-red-500/[0.04] px-3 py-2">
          <div className="mb-1 flex gap-3 font-mono text-[11px]">
            <span className="text-fg-muted w-16 shrink-0 tracking-wide uppercase">Expected</span>
            <span className="text-ob-accent truncate">{test.error.expected}</span>
          </div>
          <div className="flex gap-3 font-mono text-[11px]">
            <span className="text-fg-muted w-16 shrink-0 tracking-wide uppercase">Received</span>
            <span className="text-danger truncate">{test.error.received}</span>
          </div>
        </div>
      )}
    </div>
  )
}

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

    worker.onmessage = (event: MessageEvent<WorkerResultMessage>): void => {
      const msg = event.data

      if (msg.type === "error") {
        setTestState((prev) => ({
          ...prev,
          status: "fail",
          tests: prev.tests.map((t) => ({ ...t, status: "idle" as const })),
          compileError: msg.message,
        }))
        const errEditor = editorRef.current
        const errMonaco = monacoRef.current
        if (errEditor !== null && errMonaco !== null) {
          const errModel = errEditor.getModel()
          if (errModel !== null) errMonaco.editor.setModelMarkers(errModel, "bug-hint", [])
        }
        return
      }

      const results: TestResult[] = msg.results.map((r) => ({
        name: r.name,
        status: r.status,
        error: r.error,
      }))
      const passCount = results.filter((r) => r.status === "pass").length
      const allPassed = passCount === results.length && results.length > 0
      const nextStatus = allPassed ? ("pass" as const) : ("fail" as const)

      const editor = editorRef.current
      const monaco = monacoRef.current
      if (editor !== null && monaco !== null && template.bugLine !== undefined) {
        const model = editor.getModel()
        if (model !== null) {
          if (nextStatus === "fail") {
            monaco.editor.setModelMarkers(model, "bug-hint", [
              {
                startLineNumber: template.bugLine,
                endLineNumber: template.bugLine,
                startColumn: 1,
                endColumn: 1000,
                message: "Tests are failing — this line may be the cause",
                severity: monaco.MarkerSeverity.Warning,
              },
            ])
          } else {
            monaco.editor.setModelMarkers(model, "bug-hint", [])
          }
        }
      }

      setTestState({
        status: nextStatus,
        tests: results,
        passCount,
        totalCount: results.length,
        compileError: null,
      })
    }

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
        void editor.getAction("editor.action.formatDocument")?.run()
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
      void editor.getAction("editor.action.formatDocument")?.run()
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
        {/* breadcrumb */}
        <nav className="mb-[22px] shrink-0" aria-label="Breadcrumb">
          <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
            <li>
              <Link href={playgroundPath} className="hover:text-fg-2 transition-colors">
                Playground
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <Link href={challengePath} className="hover:text-fg-2 transition-colors">
                {title}
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="size-[6px] rounded-full bg-amber-400" />
                {dict.status.inProgress}
              </span>
            </li>
          </ol>
        </nav>

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
                        <span className="size-1.5 rounded-full bg-green-400" />
                        added
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-red-400">
                        <span className="size-1.5 rounded-full bg-red-400" />
                        removed
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
                      onClick={() => void handleFormat()}
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
                      className={`font-mono text-[11.5px] font-medium tabular-nums transition-colors ${
                        allTestsPassing
                          ? "text-ob-accent"
                          : testState.status === "fail"
                            ? "text-danger"
                            : "text-fg-muted"
                      }`}
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

                  {testState.compileError !== null ? (
                    <div className="rounded-[var(--r-8)] border border-red-500/20 bg-red-500/[0.03] p-3">
                      <p className="text-danger mb-1 font-mono text-[10.5px] tracking-wide uppercase">
                        {dict.active.syntaxError}
                      </p>
                      <p className="text-fg-muted font-mono text-[11px] leading-relaxed">
                        {dict.active.fixSyntax}
                      </p>
                    </div>
                  ) : testState.tests.length === 0 ? (
                    <p className="text-fg-muted font-mono text-[11.5px]">
                      {dict.active.editToStart}
                    </p>
                  ) : (
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
