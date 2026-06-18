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
    const keysA = Object.keys(a as object).sort()
    const keysB = Object.keys(b as object).sort()
    if (keysA.join(",") !== keysB.join(",")) return false
    return keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  }
  return false
}

// Injected into the sandbox so test code can call describe/it/expect
const HARNESS = `
var __tests__ = [];
var describe = function(name, fn) { fn(); };
var it = function(name, fn) { __tests__.push({ name: name, fn: fn }); };
var test = it;
var expect = function(received) {
  return {
    toEqual: function(expected) {
      if (!__deepEqual(received, expected)) {
        var err = new Error('Expected ' + JSON.stringify(expected) + '\\nReceived ' + JSON.stringify(received));
        err.__expected = JSON.stringify(expected);
        err.__received = JSON.stringify(received);
        throw err;
      }
    },
    toBe: function(expected) {
      if (received !== expected) {
        var err = new Error('Expected ' + JSON.stringify(expected) + '\\nReceived ' + JSON.stringify(received));
        err.__expected = JSON.stringify(expected);
        err.__received = JSON.stringify(received);
        throw err;
      }
    },
    not: {
      toEqual: function(expected) {
        if (__deepEqual(received, expected)) {
          throw new Error('Expected value NOT to equal ' + JSON.stringify(expected));
        }
      },
      toBe: function(expected) {
        if (received === expected) {
          throw new Error('Expected value NOT to be ' + JSON.stringify(expected));
        }
      }
    }
  };
};
`

const stripModuleSyntax = (code: string): string => {
  // Remove import lines (they're not needed — both files run in the same scope)
  let result = code.replace(/^import\s+[^;'\n]+['"][^'"]*['"]\s*;?\s*$/gm, "")
  // Remove export keyword, keep the declaration
  result = result.replace(/\bexport\s+default\s+/g, "")
  result = result.replace(/\bexport\s+/g, "")
  return result
}

const transpileTS = (tsCode: string): string =>
  transform(tsCode, { transforms: ["typescript"], disableESTransforms: true }).code

const executeTests = (userCode: string, testCode: string): readonly TestResult[] => {
  const userJS = stripModuleSyntax(transpileTS(userCode))
  const testJS = stripModuleSyntax(transpileTS(testCode))

  const sandbox = `
    ${HARNESS}
    ${userJS}
    ${testJS}
    return __tests__;
  `

  // deepEqual is passed in to avoid re-declaring it inside the sandboxed Function scope
  const getTests = new Function("__deepEqual", sandbox)
  const tests = getTests(deepEqual) as Array<{ name: string; fn: () => void }>

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
