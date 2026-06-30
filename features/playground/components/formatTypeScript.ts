// Formats TypeScript source with Prettier loaded lazily from the browser
// bundle, matching the project's print style. Shared by the playground editors.
export const formatTypeScript = async (code: string): Promise<string> => {
  const [prettier, parserTypeScript, parserEstree] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/estree"),
  ])
  const formatted = await prettier.format(code, {
    parser: "typescript",
    plugins: [parserTypeScript, parserEstree],
    semi: false,
    singleQuote: false,
    trailingComma: "es5",
    printWidth: 100,
    tabWidth: 2,
  })
  return formatted.trimEnd()
}
