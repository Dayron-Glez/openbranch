"use client"

import type React from "react"
import type * as Monaco from "monaco-editor"
import type { OnMount, BeforeMount } from "@monaco-editor/react"
import { useState, useCallback, useRef, useTransition, useEffect } from "react"
import Link from "next/link"
import Editor from "@monaco-editor/react"
import { SandpackProvider, SandpackTests, useSandpack } from "@codesandbox/sandpack-react"
import { saveBugFixState, completeBugFixChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { SandpackChallengeTemplate } from "@/lib/playground/sandpack-templates/bug-fix-off-by-one"
import { HintPanel } from "@/components/playground/HintPanel"

const AUTOSAVE_DELAY_MS = 800

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
}

const INITIAL_TEST_STATE: TestRunState = {
  status: "idle",
  tests: [],
  passCount: 0,
  totalCount: 0,
}

const defineObDarkTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("ob-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "A78BFA" },
      { token: "string", foreground: "FCD34D" },
      { token: "number", foreground: "60A5FA" },
      { token: "comment", foreground: "4B5563", fontStyle: "italic" },
      { token: "type", foreground: "5EE39A" },
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
      "editorSuggestWidget.background": "#0D0F15",
      "editorSuggestWidget.border": "#1E2235",
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
  readonly template: SandpackChallengeTemplate
  readonly initialCode: string | null
  readonly slug: string
  readonly lang: string
  readonly playgroundPath: string
  readonly challengePath: string
  readonly dict: PlaygroundDict
}

const BugFixEditorInner = ({
  title,
  template,
  initialCode,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: BugFixChallengeViewProps): React.ReactElement => {
  const { sandpack, listen } = useSandpack()

  const rawFile = template.files[template.editableFile]
  const originalCode = typeof rawFile === "string" ? rawFile : (rawFile?.code ?? "")
  const [code, setCode] = useState<string>(initialCode ?? originalCode)
  const [testState, setTestState] = useState<TestRunState>(INITIAL_TEST_STATE)
  const [hasBooted, setHasBooted] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof Monaco | null>(null)

  // Listen to Sandpack test events and build our own state
  useEffect(() => {
    const testsMap = new Map<string, TestResult>()

    const unsubscribe = listen((message) => {
      const msg = message as unknown as Record<string, unknown>
      if (msg["type"] !== "test") return
      const event = msg["event"] as string

      if (event === "initialize_tests") {
        setHasBooted(true)
        testsMap.clear()
        setTestState({ status: "running", tests: [], passCount: 0, totalCount: 0 })
      } else if (event === "add_test") {
        const testName = msg["testName"] as string
        testsMap.set(testName, { name: testName, status: "idle" })
        setTestState((prev) => ({
          ...prev,
          tests: Array.from(testsMap.values()),
          totalCount: testsMap.size,
        }))
      } else if (event === "test_start") {
        const testName = msg["testName"] as string
        const existing = testsMap.get(testName)
        if (existing !== undefined) {
          testsMap.set(testName, { ...existing, status: "running" })
          setTestState((prev) => ({ ...prev, tests: Array.from(testsMap.values()) }))
        }
      } else if (event === "test_complete") {
        const testName = msg["testName"] as string
        const passed = (msg["status"] as string) === "pass"
        const errors = msg["errors"] as Array<Record<string, unknown>> | undefined
        const firstError = errors?.[0]
        const matcherResult = (firstError?.["matcherResult"] ?? firstError?.["matcherResults"]) as
          | Record<string, unknown>
          | undefined
        const error =
          !passed && firstError !== undefined
            ? {
                expected: String(matcherResult?.["expected"] ?? ""),
                received: String(matcherResult?.["received"] ?? ""),
              }
            : undefined
        testsMap.set(testName, { name: testName, status: passed ? "pass" : "fail", error })
        const tests = Array.from(testsMap.values())
        const passCount = tests.filter((t) => t.status === "pass").length
        setTestState((prev) => ({ ...prev, tests, passCount }))
      } else if (event === "complete") {
        setTestState((prev) => {
          const allPassed = prev.passCount === prev.totalCount && prev.totalCount > 0
          const nextStatus = allPassed ? "pass" : ("fail" as const)

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

          return { ...prev, status: nextStatus }
        })
      }
    })

    return unsubscribe
  }, [listen, template.bugLine])

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
      if (value === undefined) return
      setCode(value)
      sandpack.updateFile(template.editableFile, value)
      scheduleAutoSave(value)
    },
    [sandpack, template.editableFile, scheduleAutoSave]
  )

  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        sandpack.updateFile(template.editableFile, editor.getValue())
      })
    },
    [sandpack, template.editableFile]
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

  const allTestsPassing = testState.status === "pass"
  const isBooting = !hasBooted

  const passLabel =
    testState.totalCount > 0
      ? `${testState.passCount}/${testState.totalCount} passing`
      : "waiting for runner"

  return (
    <>
      <main
        data-pg-main
        className="relative z-1 flex h-[calc(100dvh-60px)] flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
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
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-[900px]:grid-cols-1">
            {/* ── left column: Monaco editor ── */}
            <div className="min-w-0 min-[901px]:overflow-y-auto min-[901px]:pb-10">
              <div className="border-line flex h-full min-h-[400px] flex-col overflow-hidden rounded-[var(--r-8)] border">
                {/* file header */}
                <div className="border-line bg-bg-elev flex shrink-0 items-center justify-between border-b px-4 py-2.5">
                  <span className="text-fg-2 font-mono text-[12px]">{template.editableFile}</span>
                  <kbd className="border-line bg-bg-card text-fg-muted rounded px-1.5 py-0.5 font-mono text-[10px]">
                    {typeof navigator !== "undefined" && navigator.platform.includes("Mac")
                      ? "⌘↵ run"
                      : "Ctrl+↵ run"}
                  </kbd>
                </div>

                {/* loading skeleton */}
                {isBooting ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0D0F15]">
                    <span className="border-fg-faint size-6 animate-spin rounded-full border-2 border-t-transparent" />
                    <p className="text-fg-muted font-mono text-[12px]">Setting up sandbox…</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <Editor
                      height="100%"
                      language="typescript"
                      theme="ob-dark"
                      value={code}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      beforeMount={defineObDarkTheme}
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
                  </div>
                )}
              </div>
            </div>

            {/* ── right column: results + hints + submit ── */}
            <aside className="max-[900px]:order-first min-[901px]:overflow-y-auto min-[901px]:pb-10">
              <div className="flex flex-col gap-6">
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

                {/* test results panel */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-fg-muted font-mono text-[10.5px] tracking-[0.08em] uppercase">
                      Tests
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
                      {isBooting ? "booting…" : passLabel}
                    </span>
                  </div>

                  {isBooting ? (
                    <div className="border-line bg-bg-elev flex flex-col gap-2.5 rounded-[var(--r-8)] border p-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className="border-fg-faint size-[18px] shrink-0 rounded-full border-2 opacity-30" />
                          <span className="bg-fg-faint h-2.5 flex-1 animate-pulse rounded opacity-20" />
                        </div>
                      ))}
                    </div>
                  ) : testState.tests.length === 0 ? (
                    <p className="text-fg-muted font-mono text-[11.5px]">
                      Edit the code above to start running tests.
                    </p>
                  ) : (
                    <div className="border-line bg-bg-elev flex flex-col gap-3 rounded-[var(--r-8)] border p-3">
                      {testState.tests.map((test, i) => (
                        <TestCard key={test.name} test={test} index={i} />
                      ))}
                    </div>
                  )}

                  {/* all passing celebration */}
                  {allTestsPassing && (
                    <div className="border-accent-ring bg-accent-soft rounded-[var(--r-8)] border px-3 py-2.5">
                      <p className="text-ob-accent font-mono text-[12px]">
                        All tests passing — ready to submit!
                      </p>
                    </div>
                  )}
                </div>

                {/* submit */}
                <div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allTestsPassing || isPending}
                    className="bg-ob-accent text-accent-ink h-10 w-full rounded-[var(--r-8)] font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
                  >
                    {dict.active.submitButton}
                  </button>
                </div>

                <div className="border-line border-t" />

                {/* hints */}
                <HintPanel
                  hints={template.hints}
                  revealLabel={dict.active.revealHint}
                  hintsLabel={dict.active.hintsLabel}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* hidden test runner — starts WebContainer jest process */}
      <div className="hidden" aria-hidden="true">
        <SandpackTests watchMode />
      </div>
    </>
  )
}

export const BugFixChallengeView = (props: BugFixChallengeViewProps): React.ReactElement => (
  <SandpackProvider template="node" files={props.template.files} options={{ autorun: true }}>
    <BugFixEditorInner {...props} />
  </SandpackProvider>
)
