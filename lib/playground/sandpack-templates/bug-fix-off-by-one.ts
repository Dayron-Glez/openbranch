const PAGINATE_CODE = `export const paginate = <T>(items: T[], page: number, size: number): T[] => {
  const start = page * size
  const end = start + size - 1
  return items.slice(start, end)
}`

const TEST_CODE = `import { paginate } from "./paginate"

describe("paginate", () => {
  it("returns a full page including the last item", () => {
    expect(paginate([1, 2, 3, 4, 5], 0, 3)).toEqual([1, 2, 3])
  })

  it("returns the second page correctly", () => {
    expect(paginate([1, 2, 3, 4, 5], 1, 2)).toEqual([3, 4])
  })

  it("returns an empty array when page is out of range", () => {
    expect(paginate([1, 2, 3], 5, 2)).toEqual([])
  })
})`

const SOLUTION_CODE = `export const paginate = <T>(items: T[], page: number, size: number): T[] => {
  const start = page * size
  const end = start + size
  return items.slice(start, end)
}`

export type BugFixTemplateFile = {
  readonly code: string
  readonly readOnly?: boolean
}

export type BugFixTemplate = {
  readonly files: Record<string, BugFixTemplateFile>
  readonly editableFile: string
  readonly testFile: string
  readonly solutionCode: string
  readonly bugLine?: number
  readonly hints: readonly string[]
  readonly hintsByLang?: Partial<Record<string, readonly string[]>>
}

export const bugFixOffByOne: BugFixTemplate = {
  files: {
    "src/paginate.ts": { code: PAGINATE_CODE },
    "src/paginate.test.ts": { code: TEST_CODE, readOnly: true },
  },
  editableFile: "src/paginate.ts",
  testFile: "src/paginate.test.ts",
  solutionCode: SOLUTION_CODE,
  bugLine: 3,
  hints: [
    "Look at how JavaScript's `slice(start, end)` handles its end index.",
    "The end index in `slice()` is exclusive — the element at that index is not included in the result.",
    "You're subtracting 1 from the end. What happens if you remove that subtraction?",
  ],
  hintsByLang: {
    es: [
      "Mira cómo `slice(start, end)` de JavaScript maneja su índice final.",
      "El índice final en `slice()` es exclusivo — el elemento en ese índice no se incluye en el resultado.",
      "Estás restando 1 al final. ¿Qué pasa si eliminas esa resta?",
    ],
  },
}
