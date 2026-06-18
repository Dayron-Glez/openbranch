import type { BugFixTemplate } from "./bug-fix-off-by-one"

const SOURCE_CODE = `type Listener<T = unknown> = (data: T) => void

export class EventEmitter {
  private readonly listeners = new Map<string, Listener[]>()

  on<T>(event: string, listener: Listener<T>): void {
    const existing = this.listeners.get(event) ?? []
    const wrapped: Listener = (data) => listener(data as T)
    this.listeners.set(event, [...existing, wrapped])
  }

  off<T>(event: string, listener: Listener<T>): void {
    const existing = this.listeners.get(event)
    if (existing === undefined) return
    this.listeners.set(
      event,
      existing.filter((l) => l !== (listener as Listener)),
    )
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((l) => l(data))
  }
}`

const TEST_CODE = `import { EventEmitter } from "./event-emitter"

describe("EventEmitter", () => {
  it("calls registered listeners when an event is emitted", () => {
    const emitter = new EventEmitter()
    const received: number[] = []
    emitter.on<number>("tick", (v) => received.push(v))
    emitter.emit("tick", 1)
    emitter.emit("tick", 2)
    expect(received).toEqual([1, 2])
  })

  it("does not call the listener after off()", () => {
    const emitter = new EventEmitter()
    const received: number[] = []
    const handler = (v: number) => received.push(v)
    emitter.on<number>("tick", handler)
    emitter.emit("tick", 1)
    emitter.off<number>("tick", handler)
    emitter.emit("tick", 2)
    expect(received).toEqual([1])
  })

  it("only removes the specified listener, keeping others active", () => {
    const emitter = new EventEmitter()
    const calls: string[] = []
    const handlerA = (_v: number) => calls.push("A")
    const handlerB = (_v: number) => calls.push("B")
    emitter.on<number>("data", handlerA)
    emitter.on<number>("data", handlerB)
    emitter.off<number>("data", handlerA)
    emitter.emit("data", 42)
    expect(calls).toEqual(["B"])
  })
})`

const SOLUTION_CODE = `type Listener<T = unknown> = (data: T) => void

export class EventEmitter {
  private readonly listeners = new Map<string, Listener[]>()

  on<T>(event: string, listener: Listener<T>): void {
    const existing = this.listeners.get(event) ?? []
    this.listeners.set(event, [...existing, listener as Listener])
  }

  off<T>(event: string, listener: Listener<T>): void {
    const existing = this.listeners.get(event)
    if (existing === undefined) return
    this.listeners.set(
      event,
      existing.filter((l) => l !== (listener as Listener)),
    )
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((l) => l(data))
  }
}`

export const bugFixEventEmitter: BugFixTemplate = {
  files: {
    "src/event-emitter.ts": { code: SOURCE_CODE },
    "src/event-emitter.test.ts": { code: TEST_CODE, readOnly: true },
  },
  editableFile: "src/event-emitter.ts",
  testFile: "src/event-emitter.test.ts",
  solutionCode: SOLUTION_CODE,
  bugLine: 8,
  hints: [
    "The `off()` method uses `===` to find and remove listeners. What exact function reference is stored in the map when `on()` is called?",
    "Notice the `wrapped` variable in `on()` — it's a brand-new function created on every call. When `off()` searches for your original handler, it compares against `wrapped`, not the handler you passed in.",
    "The fix is in `on()`, not `off()`. Skip the wrapper and store `listener as Listener` directly. Reference equality in `off()` will then work correctly.",
  ],
  hintsByLang: {
    es: [
      "El método `off()` usa `===` para encontrar y eliminar listeners. ¿Qué referencia de función exacta se guarda en el map cuando se llama a `on()`?",
      "Fíjate en la variable `wrapped` en `on()` — es una función nueva creada en cada llamada. Cuando `off()` busca tu handler original, compara contra `wrapped`, no contra el handler que pasaste.",
      "La solución está en `on()`, no en `off()`. Salta el wrapper y guarda `listener as Listener` directamente. La igualdad por referencia en `off()` funcionará entonces correctamente.",
    ],
  },
}
