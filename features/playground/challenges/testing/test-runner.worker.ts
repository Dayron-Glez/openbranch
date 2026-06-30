import { transform } from "sucrase"

type TestResult = {
  readonly name: string
  readonly status: "pass" | "fail"
  readonly error?: { readonly expected: string; readonly received: string }
}

type Mutant = {
  readonly id: string
  readonly label: string
  readonly code: string
}

type MutationResult = {
  readonly id: string
  readonly label: string
  readonly killed: boolean
}

type RunMessage = {
  readonly type: "run"
  readonly userCode: string
  readonly testCode: string
  readonly extraModules?: readonly string[]
}

type RunTestingMessage = {
  readonly type: "run-testing"
  readonly testCode: string
  readonly correctSource: string
  readonly mutants: readonly Mutant[]
}

type IncomingMessage = RunMessage | RunTestingMessage

type ResultMessage =
  | { readonly type: "result"; readonly results: readonly TestResult[] }
  | {
      readonly type: "testing-result"
      readonly baseline: readonly TestResult[]
      readonly mutations: readonly MutationResult[]
    }
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
    const keysA = Object.keys(a).sort((x, y) => x.localeCompare(y))
    const keysB = Object.keys(b).sort((x, y) => x.localeCompare(y))
    if (keysA.join(",") !== keysB.join(",")) return false
    return keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    )
  }
  return false
}

// Injected into the sandbox alongside transpiled source and test code.
// __deepEqual is passed in from the outer scope to avoid re-declaring it here.
// `global` aliases the worker globalThis so tests can reassign `fetch` and spy
// on timers; executeTests snapshots and restores those globals around each test.
const HARNESS = String.raw`
var global = globalThis;
var __tests__ = [];
var __serialize = function(v) {
  try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; }
  catch (e) { return String(v); }
};
var __fail = function(expected, received) {
  var e = __serialize(expected);
  var r = __serialize(received);
  var err = new Error('Expected ' + e + '\nReceived ' + r);
  err.__expected = e;
  err.__received = r;
  throw err;
};
var jest = {
  fn: function(impl) {
    var mockImpl = impl;
    var mock = function() {
      mock.mock.calls.push(Array.prototype.slice.call(arguments));
      if (typeof mockImpl === 'function') return mockImpl.apply(this, arguments);
      return undefined;
    };
    mock.mock = { calls: [] };
    mock._isMockFn = true;
    mock.mockImplementation = function(fn) { mockImpl = fn; return mock; };
    mock.mockReturnValue = function(v) { mockImpl = function() { return v; }; return mock; };
    mock.mockResolvedValue = function(v) { mockImpl = function() { return Promise.resolve(v); }; return mock; };
    mock.mockRejectedValue = function(e) { mockImpl = function() { return Promise.reject(e); }; return mock; };
    return mock;
  },
  spyOn: function(obj, key) {
    var original = obj[key];
    var spy = jest.fn(function() { return original.apply(obj, arguments); });
    spy.mockRestore = function() { obj[key] = original; };
    obj[key] = spy;
    return spy;
  }
};
var __callCount = function(received) {
  return received && received.mock && received.mock.calls ? received.mock.calls.length : 0;
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
    toBeNull: function() {
      if (received !== null) __fail(null, received);
    },
    toBeUndefined: function() {
      if (received !== undefined) __fail(undefined, received);
    },
    toBeDefined: function() {
      if (received === undefined) __fail('defined', received);
    },
    toHaveBeenCalled: function() {
      if (__callCount(received) === 0) __fail('>= 1 call', '0 calls');
    },
    toHaveBeenCalledTimes: function(n) {
      var calls = __callCount(received);
      if (calls !== n) __fail(n + ' call(s)', calls + ' call(s)');
    },
    toHaveBeenCalledWith: function() {
      var expectedArgs = Array.prototype.slice.call(arguments);
      var calls = received && received.mock ? received.mock.calls : [];
      var ok = false;
      for (var i = 0; i < calls.length; i++) {
        if (__deepEqual(calls[i], expectedArgs)) { ok = true; break; }
      }
      if (!ok) __fail('called with ' + __serialize(expectedArgs), calls);
    },
    not: {
      toEqual: function(expected) {
        if (__deepEqual(received, expected)) throw new Error('Expected NOT to equal ' + __serialize(expected));
      },
      toBe: function(expected) {
        if (received === expected) throw new Error('Expected NOT to be ' + __serialize(expected));
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
  __obTests?: Array<{ name: string; fn: () => unknown }>
}
const workerScope = globalThis as unknown as WorkerScope

// Globals a test may mock/spy on. Snapshotted before a suite runs and restored
// after each test so mocks never leak between tests, runs, or back to the worker.
const MOCKABLE_GLOBALS = ["fetch", "setTimeout", "clearTimeout", "setInterval", "clearInterval"]

const loadTests = (
  sourceCode: string,
  testCode: string,
  extraModules?: readonly string[]
): Array<{ name: string; fn: () => unknown }> => {
  const extraJS = (extraModules ?? []).map((m) => stripModuleSyntax(transpileTS(m))).join("\n")
  const sourceJS = stripModuleSyntax(transpileTS(sourceCode))
  const testJS = stripModuleSyntax(transpileTS(testCode))

  // Load code via importScripts + a blob URL instead of new Function.
  // importScripts is synchronous, so __obTests is set before we read it below.
  // The blob scope wraps everything in an IIFE that receives __deepEqual from
  // self.__obDeepEqual, keeping the expect closures wired correctly.
  workerScope.__obDeepEqual = deepEqual
  const scriptContent = [
    "(function(__deepEqual){",
    HARNESS,
    extraJS,
    sourceJS,
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
  return tests
}

const toFailure = (name: string, e: unknown): TestResult => {
  const err = e as Record<string, unknown>
  return {
    name,
    status: "fail",
    error: {
      expected: typeof err["__expected"] === "string" ? err["__expected"] : "",
      received: typeof err["__received"] === "string" ? err["__received"] : "",
    },
  }
}

const executeTests = async (
  sourceCode: string,
  testCode: string,
  extraModules?: readonly string[]
): Promise<readonly TestResult[]> => {
  const tests = loadTests(sourceCode, testCode, extraModules)

  const scope = globalThis as unknown as Record<string, unknown>
  const snapshot: Record<string, unknown> = {}
  for (const key of MOCKABLE_GLOBALS) snapshot[key] = scope[key]
  const restoreGlobals = (): void => {
    for (const key of MOCKABLE_GLOBALS) scope[key] = snapshot[key]
  }

  const results: TestResult[] = []
  for (const t of tests) {
    try {
      await t.fn()
      results.push({ name: t.name, status: "pass" })
    } catch (e) {
      results.push(toFailure(t.name, e))
    } finally {
      restoreGlobals()
    }
  }
  return results
}

const runTesting = async (
  message: RunTestingMessage
): Promise<{ baseline: readonly TestResult[]; mutations: readonly MutationResult[] }> => {
  const baseline = await executeTests(message.correctSource, message.testCode)
  const mutations: MutationResult[] = []
  for (const mutant of message.mutants) {
    const mutantResults = await executeTests(mutant.code, message.testCode)
    mutations.push({
      id: mutant.id,
      label: mutant.label,
      killed: mutantResults.some((r) => r.status === "fail"),
    })
  }
  return { baseline, mutations }
}

globalThis.onmessage = async (event: MessageEvent<IncomingMessage>): Promise<void> => {
  const data = event.data
  try {
    if (data.type === "run") {
      const results = await executeTests(data.userCode, data.testCode, data.extraModules)
      const msg: ResultMessage = { type: "result", results }
      globalThis.postMessage(msg)
    } else if (data.type === "run-testing") {
      const { baseline, mutations } = await runTesting(data)
      const msg: ResultMessage = { type: "testing-result", baseline, mutations }
      globalThis.postMessage(msg)
    }
  } catch (e) {
    const msg: ResultMessage = { type: "error", message: String(e) }
    globalThis.postMessage(msg)
  }
}
