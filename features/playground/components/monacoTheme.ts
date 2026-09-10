import type * as Monaco from "monaco-editor"
import type { BeforeMount } from "@monaco-editor/react"

export const EDITOR_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  // Every playground editor lives in a flex column that settles *after* Monaco
  // first measures itself. Without this it latches onto what it saw at mount —
  // 5×5 if the column has not resolved — and never remeasures, leaving a pane
  // that renders no code at all.
  automaticLayout: true,
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
}

export const configureMonaco: BeforeMount = (monaco) => {
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

// Provided at runtime by the worker harness, unknown to Monaco otherwise.
const JEST_GLOBALS_DTS = `
declare function describe(name: string, fn: () => void): void
declare function it(name: string, fn: () => void | Promise<void>): void
declare function test(name: string, fn: () => void | Promise<void>): void
declare function expect(received: unknown): any
declare const jest: {
  fn(impl?: (...args: any[]) => any): any
  spyOn(target: any, key: any): any
}
declare const global: typeof globalThis
`

export const configureTestingMonaco: BeforeMount = (monaco) => {
  configureMonaco(monaco)
  // Sync every model to the TS worker so the test file's `./request` import
  // resolves against the pre-created source model (not just the active one).
  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    JEST_GLOBALS_DTS,
    "ts:openbranch-jest-globals.d.ts"
  )
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    // 6133/6196: unused symbols while editing; 2307: the worker resolves the
    // ./source import at runtime even when Monaco's model sync misses it.
    diagnosticCodesToIgnore: [6133, 6196, 2307],
  })
}
