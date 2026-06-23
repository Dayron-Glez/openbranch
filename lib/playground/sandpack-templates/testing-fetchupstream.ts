// Correct, read-only implementation the learner writes tests against.
const SOURCE_CODE = `export const fetchUpstream = async (
  url: string,
  timeoutMs: number,
): Promise<Response | null> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}`

// Starter stub shown in the editable test file.
const STARTER_TESTS = `import { fetchUpstream } from "./request"

// Mock \`fetch\` globally — never make real network calls.
// For the timeout case, reject with: new DOMException("Aborted", "AbortError")

describe("fetchUpstream", () => {
  // 1. Returns the Response when the upstream replies normally.
  // 2. Returns null (does not throw) when the request times out.
  // 3. Always clears the internal timer after the call.
})`

// Reference solution revealed by "view solution".
const REFERENCE_TESTS = `import { fetchUpstream } from "./request"

describe("fetchUpstream", () => {
  it("returns the response when the upstream replies normally", async () => {
    const response = { ok: true, status: 200 }
    global.fetch = jest.fn().mockResolvedValue(response)

    const result = await fetchUpstream("https://api.example.com", 1000)

    expect(result).toBe(response)
  })

  it("returns null when the request times out", async () => {
    global.fetch = jest.fn().mockRejectedValue(new DOMException("Aborted", "AbortError"))

    const result = await fetchUpstream("https://api.example.com", 10)

    expect(result).toBeNull()
  })

  it("clears the internal timer after the call", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
    const clearSpy = jest.spyOn(global, "clearTimeout")

    await fetchUpstream("https://api.example.com", 1000)

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})`

// Each mutant is a broken variant of the source that a correct test suite must
// detect. A mutant is "killed" when at least one of the learner's tests fails
// against it. If a mutant survives, the suite has a coverage gap.
const MUTANT_NO_CLEAR_TIMEOUT = `export const fetchUpstream = async (
  url: string,
  timeoutMs: number,
): Promise<Response | null> => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null
    }
    throw error
  }
}`

const MUTANT_TIMEOUT_RETURNS_UNDEFINED = `export const fetchUpstream = async (
  url: string,
  timeoutMs: number,
): Promise<Response | null> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return undefined as unknown as null
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}`

const MUTANT_TIMEOUT_THROWS = `export const fetchUpstream = async (
  url: string,
  timeoutMs: number,
): Promise<Response | null> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (error) {
    throw error
  } finally {
    clearTimeout(timer)
  }
}`

export type TestingTemplateFile = {
  readonly code: string
  readonly readOnly?: boolean
}

export type TestingMutant = {
  readonly id: string
  readonly label: string
  readonly labelByLang?: Partial<Record<string, string>>
  readonly code: string
}

export type TestingTemplate = {
  readonly files: Record<string, TestingTemplateFile>
  readonly editableFile: string
  readonly sourceFile: string
  readonly correctSource: string
  readonly mutants: readonly TestingMutant[]
  readonly minTests: number
  readonly referenceTests: string
  readonly starterTests: string
  readonly hints: readonly string[]
  readonly hintsByLang?: Partial<Record<string, readonly string[]>>
}

export const testingFetchUpstream: TestingTemplate = {
  files: {
    "src/request.ts": { code: SOURCE_CODE, readOnly: true },
    "src/request.test.ts": { code: STARTER_TESTS },
  },
  editableFile: "src/request.test.ts",
  sourceFile: "src/request.ts",
  correctSource: SOURCE_CODE,
  minTests: 3,
  starterTests: STARTER_TESTS,
  referenceTests: REFERENCE_TESTS,
  mutants: [
    {
      id: "no-clear-timeout",
      label: "Never clears the timer",
      labelByLang: { es: "Nunca limpia el timer" },
      code: MUTANT_NO_CLEAR_TIMEOUT,
    },
    {
      id: "timeout-returns-undefined",
      label: "Returns undefined on timeout",
      labelByLang: { es: "Devuelve undefined en el timeout" },
      code: MUTANT_TIMEOUT_RETURNS_UNDEFINED,
    },
    {
      id: "timeout-throws",
      label: "Throws instead of returning null",
      labelByLang: { es: "Lanza en vez de devolver null" },
      code: MUTANT_TIMEOUT_THROWS,
    },
  ],
  hints: [
    "Mock `fetch` before each case with `jest.fn()`. The happy path resolves a fake response; the timeout path rejects.",
    'For the timeout, reject with `new DOMException("Aborted", "AbortError")` — that is exactly what `AbortController` throws. Assert the result is `null` and that nothing was thrown.',
    'For cleanup, `jest.spyOn(global, "clearTimeout")` and assert `toHaveBeenCalledTimes(1)` after the call — it must run on both success and failure.',
  ],
  hintsByLang: {
    es: [
      "Mockea `fetch` antes de cada caso con `jest.fn()`. El happy path resuelve una respuesta falsa; el caso de timeout rechaza.",
      'Para el timeout, rechaza con `new DOMException("Aborted", "AbortError")` — es justo lo que lanza `AbortController`. Comprueba que el resultado es `null` y que no se lanzó nada.',
      'Para la limpieza, `jest.spyOn(global, "clearTimeout")` y comprueba `toHaveBeenCalledTimes(1)` después de la llamada — debe ejecutarse tanto en éxito como en fallo.',
    ],
  },
}
