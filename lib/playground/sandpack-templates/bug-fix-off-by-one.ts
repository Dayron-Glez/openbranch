import type { SandpackFiles } from "@codesandbox/sandpack-react"

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

const PACKAGE_JSON = `{
  "name": "bug-fix-off-by-one",
  "private": true,
  "scripts": { "test": "jest" },
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.4",
    "typescript": "^5.4.5"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node"
  }
}`

const TSCONFIG_JSON = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}`

export type SandpackChallengeTemplate = {
  readonly files: SandpackFiles
  readonly editableFile: string
  readonly bugLine?: number
  readonly hints: readonly string[]
}

export const bugFixOffByOneSandpack: SandpackChallengeTemplate = {
  files: {
    "src/paginate.ts": { code: PAGINATE_CODE, active: true },
    "src/paginate.test.ts": { code: TEST_CODE, readOnly: true },
    "/package.json": { code: PACKAGE_JSON, hidden: true },
    "/tsconfig.json": { code: TSCONFIG_JSON, hidden: true },
  },
  editableFile: "src/paginate.ts",
  bugLine: 3,
  hints: [
    "Look at how JavaScript's `slice(start, end)` handles its end index.",
    "The end index in `slice()` is exclusive — the element at that index is not included in the result.",
    "You're subtracting 1 from the end. What happens if you remove that subtraction?",
  ],
}
