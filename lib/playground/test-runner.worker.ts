import { transform } from "sucrase"

type TestResult = {
  readonly name: string
  readonly status: "pass" | "fail"
  readonly error?: { readonly expected: string; readonly received: string }
}

type RunMessage = {
  readonly type: "run"
  readonly userCode: string
  readonly testCode: string
}

type ResultMessage =
  | { readonly type: "result"; readonly results: readonly TestResult[] }
  | { readonly type: "error"; readonly message: string }

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, i) => deepEqual(item, b[i]))
  }
  if (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const keysA = Object.keys(a as object).sort((x, y) => x.localeCompare(y))
    const keysB = Object.keys(b as object).sort((x, y) => x.localeCompare(y))
    if (keysA.join(",") !== keysB.join(",")) return false
    return keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  }
  return false
}

// Injected into the sandbox alongside transpiled user code and test code.
// __deepEqual is passed in from the outer scope to avoid re-declaring it here.
const HARNESS = `
var __tests__ = [];
var __fail = function(expected, received) {
  var err = new Error('Expected ' + JSON.stringify(expected) + '\\nReceived ' + JSON.stringify(received));
  err.__expected = JSON.stringify(expected);
  err.__received = JSON.stringify(received);
  throw err;
};
var describe = function(name, fn) { fn(); };
var it = function(name, fn) { __tests__.push({ name: name, fn: fn }); };
var test = it;
var expect = function(received) {
  return {
    toEqual: function(expected) {
      if (!__deepEqual(received, expected)) __fail(expected, received);
    },
    toBe: function(expected) {
      if (received !== expected) __fail(expected, received);
    },
    not: {
      toEqual: function(expected) {
        if (__deepEqual(received, expected)) throw new Error('Expected NOT to equal ' + JSON.stringify(expected));
      },
      toBe: function(expected) {
        if (received === expected) throw new Error('Expected NOT to be ' + JSON.stringify(expected));
      }
    }
  };
};
`

const stripModuleSyntax = (code: string): string => {
  // Remove import statements — both source and test run in the same scope
  let result = code.replace(/^import\b[^\n]*\n?/gm, "")
  result = result.replace(/\bexport\s+default\s+/g, "")
  result = result.replace(/\bexport\s+/g, "")
  return result
}

const transpileTS = (tsCode: string): string =>
  transform(tsCode, { transforms: ["typescript"], disableESTransforms: true }).code

// importScripts is available in Web Workers but not in lib.dom.d.ts.
// This type covers only the fields we use to avoid any/unknown leakage.
type WorkerScope = {
  importScripts: (url: string) => void
  __obDeepEqual?: typeof deepEqual
  __obTests?: Array<{ name: string; fn: () => void }>
}
const workerScope = self as unknown as WorkerScope

const executeTests = (userCode: string, testCode: string): readonly TestResult[] => {
  const userJS = stripModuleSyntax(transpileTS(userCode))
  const testJS = stripModuleSyntax(transpileTS(testCode))

  // Load challenge code via importScripts + a blob URL instead of new Function.
  // importScripts is synchronous, so __obTests is set before we read it below.
  // The blob scope wraps everything in an IIFE that receives __deepEqual from
  // self.__obDeepEqual, keeping the expect/toBe closures wired correctly.
  workerScope.__obDeepEqual = deepEqual
  const scriptContent = [
    "(function(__deepEqual){",
    HARNESS,
    userJS,
    testJS,
    "self.__obTests=__tests__;",
    "})(self.__obDeepEqual);",
  ].join("\n")

  const blobUrl = URL.createObjectURL(new Blob([scriptContent], { type: "text/javascript" }))
  try {
    workerScope.importScripts(blobUrl)
  } finally {
    URL.revokeObjectURL(blobUrl)
  }

  const tests = workerScope.__obTests ?? []
  delete workerScope.__obTests
  delete workerScope.__obDeepEqual

  return tests.map((t): TestResult => {
    try {
      t.fn()
      return { name: t.name, status: "pass" }
    } catch (e) {
      const err = e as Record<string, unknown>
      return {
        name: t.name,
        status: "fail",
        error: {
          expected: String(err["__expected"] ?? ""),
          received: String(err["__received"] ?? ""),
        },
      }
    }
  })
}

self.onmessage = (event: MessageEvent<RunMessage>): void => {
  if (event.data.type !== "run") return
  try {
    const results = executeTests(event.data.userCode, event.data.testCode)
    const msg: ResultMessage = { type: "result", results }
    self.postMessage(msg)
  } catch (e) {
    const msg: ResultMessage = { type: "error", message: String(e) }
    self.postMessage(msg)
  }
}
