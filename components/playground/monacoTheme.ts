import type { BeforeMount } from "@monaco-editor/react"

// Shared Monaco setup for the playground code editors (bug-fix, testing):
// strict TS compiler options + the openbranch "ob-dark" theme.
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
