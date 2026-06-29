const SOURCE_CODE = `type PaginationResult<T> = {
  readonly data: T[]
  readonly page: number
  readonly totalPages: number
  readonly hasNext: boolean
  readonly hasPrev: boolean
}

export const paginate = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): PaginationResult<T> => {
  const totalPages = Math.ceil(items.length / pageSize)
  const safePage = Math.max(0, Math.min(page, totalPages - 1))
  const start = safePage * pageSize
  const end = Math.min(start + pageSize, items.length)

  return {
    data: items.slice(start, end) as T[],
    page: safePage,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 0,
  }
}`

const TEST_CODE = `import { paginate } from "./paginate"

const ITEMS = Array.from({ length: 10 }, (_, i) => i + 1)

describe("paginate", () => {
  it("returns the correct slice of items for a given page", () => {
    const result = paginate(ITEMS, 0, 3)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.page).toBe(0)
    expect(result.totalPages).toBe(4)
  })

  it("returns correct data for the last page", () => {
    const result = paginate(ITEMS, 3, 3)
    expect(result.data).toEqual([10])
    expect(result.totalPages).toBe(4)
  })

  it("hasNext is false on the last page", () => {
    const result = paginate(ITEMS, 3, 3)
    expect(result.hasNext).toBe(false)
  })

  it("hasPrev and hasNext reflect position correctly", () => {
    const first = paginate(ITEMS, 0, 3)
    const middle = paginate(ITEMS, 1, 3)
    expect(first.hasPrev).toBe(false)
    expect(first.hasNext).toBe(true)
    expect(middle.hasPrev).toBe(true)
    expect(middle.hasNext).toBe(true)
  })
})`

const SOLUTION_CODE = `type PaginationResult<T> = {
  readonly data: T[]
  readonly page: number
  readonly totalPages: number
  readonly hasNext: boolean
  readonly hasPrev: boolean
}

export const paginate = <T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): PaginationResult<T> => {
  const totalPages = Math.ceil(items.length / pageSize)
  const safePage = Math.max(0, Math.min(page, totalPages - 1))
  const start = safePage * pageSize
  const end = Math.min(start + pageSize, items.length)

  return {
    data: items.slice(start, end) as T[],
    page: safePage,
    totalPages,
    hasNext: safePage < totalPages - 1,
    hasPrev: safePage > 0,
  }
}`

import type { TemplateFile } from "@/lib/playground/domain/template"

export type BugFixTemplate = {
  readonly files: Record<string, TemplateFile>
  readonly editableFile: string
  readonly testFile: string
  readonly solutionCode: string
  readonly bugLine?: number
  readonly hints: readonly string[]
  readonly hintsByLang?: Partial<Record<string, readonly string[]>>
}

export const bugFixOffByOne: BugFixTemplate = {
  files: {
    "src/paginate.ts": { code: SOURCE_CODE },
    "src/paginate.test.ts": { code: TEST_CODE, readOnly: true },
  },
  editableFile: "src/paginate.ts",
  testFile: "src/paginate.test.ts",
  solutionCode: SOLUTION_CODE,
  bugLine: 23,
  hints: [
    "Three of the four tests pass. The failing one is about `hasNext` on the last page — focus on what value `safePage` holds at that point.",
    "With 10 items and a page size of 3, `totalPages` is 4. The last page index is 3 (zero-based). Ask yourself: is `3 < 4` true or false?",
    "Page indices are zero-based, but `totalPages` is a count. The last valid page is `totalPages - 1`, so `hasNext` should be `safePage < totalPages - 1`.",
  ],
  hintsByLang: {
    es: [
      "Tres de los cuatro tests pasan. El que falla trata sobre `hasNext` en la última página — céntrate en qué valor tiene `safePage` en ese punto.",
      "Con 10 ítems y tamaño de página 3, `totalPages` es 4. El índice de la última página es 3 (base cero). ¿Es `3 < 4` verdadero o falso?",
      "Los índices de página son base cero, pero `totalPages` es un conteo. La última página válida es `totalPages - 1`, así que `hasNext` debería ser `safePage < totalPages - 1`.",
    ],
  },
}
