// Read-only dependency: the Session shape both branches build on.
const TYPES_CODE = `export type Session = {
  id: string
  token: string
  expiresAt: number
}`

// Read-only dependency: the session store. The learner never edits this, but
// reads it to know what \`getSession\` / \`deleteExpired\` do when merging.
const DB_CODE = `import type { Session } from "./types"

// Backed by the sessions table. Stubbed here; the challenge mocks these.
export const db = {
  async getSession(token: string): Promise<Session | null> {
    void token
    return null
  },
  async deleteExpired(id: string): Promise<void> {
    void id
  },
}`

// Read-only dependency: the rate limiter \`feat/rate-limiting\` introduced.
const RATE_LIMITER_CODE = `export class RateLimiter {
  private readonly limit: number
  private readonly hits = new Map<string, number>()

  constructor(limit: number) {
    this.limit = limit
  }

  allow(token: string): boolean {
    const count = (this.hits.get(token) ?? 0) + 1
    this.hits.set(token, count)
    return count <= this.limit
  }
}`

// The common ancestor — what both branches diverged from.
const BASE_CODE = `import { db } from "./db"
import type { Session } from "./types"

export const validateSession = async (token: string): Promise<boolean> => {
  const session = await db.getSession(token)
  return session !== null
}`

// ours — feat/rate-limiting: adds a RateLimiter guard, keeps the boolean result.
const OURS_CODE = `import { db } from "./db"
import type { Session } from "./types"
import { RateLimiter } from "./rate-limiter"

const limiter = new RateLimiter(100)

export const validateSession = async (
  token: string,
): Promise<boolean> => {
  if (!limiter.allow(token)) {
    return false
  }

  const session = await db.getSession(token)
  return session !== null
}`

// theirs — fix/session-expiry: returns the Session, cleans up expired rows.
const THEIRS_CODE = `import { db } from "./db"
import type { Session } from "./types"

export const validateSession = async (
  token: string,
): Promise<Session | null> => {
  const session = await db.getSession(token)
  if (session === null) {
    return null
  }
  if (session.expiresAt < Date.now()) {
    await db.deleteExpired(session.id)
    return null
  }
  return session
}`

// What the learner opens: auth/session.ts with three unresolved conflicts.
const CONFLICTED_CODE = `import { db } from "./db"
import type { Session } from "./types"
<<<<<<< feat/rate-limiting
import { RateLimiter } from "./rate-limiter"

const limiter = new RateLimiter(100)
=======
>>>>>>> fix/session-expiry

export const validateSession = async (
  token: string,
<<<<<<< feat/rate-limiting
): Promise<boolean> => {
=======
): Promise<Session | null> => {
>>>>>>> fix/session-expiry
<<<<<<< feat/rate-limiting
  if (!limiter.allow(token)) {
    return false
  }

  const session = await db.getSession(token)
  return session !== null
=======
  const session = await db.getSession(token)
  if (session === null) {
    return null
  }
  if (session.expiresAt < Date.now()) {
    await db.deleteExpired(session.id)
    return null
  }
  return session
>>>>>>> fix/session-expiry
}`

// The correct three-way merge: feat's import + limiter, fix's return type and
// cleanup, and a custom body that keeps the rate-limit guard (now returning
// null to match the new contract) alongside the expiry logic.
const SOLUTION_CODE = `import { db } from "./db"
import type { Session } from "./types"
import { RateLimiter } from "./rate-limiter"

const limiter = new RateLimiter(100)

export const validateSession = async (
  token: string,
): Promise<Session | null> => {
  if (!limiter.allow(token)) {
    return null
  }

  const session = await db.getSession(token)
  if (session === null) {
    return null
  }
  if (session.expiresAt < Date.now()) {
    await db.deleteExpired(session.id)
    return null
  }
  return session
}`

// Hidden suite — the learner never sees or writes these. Each test pins down one
// branch's intent so that accepting either side wholesale fails:
//  1. Rate-limit guard must short-circuit BEFORE the lookup (feat's logic).
//  2. Expired sessions must be cleaned up and yield null (fix's logic).
//  3. A valid token must return the Session object, not a boolean (fix's contract).
const HIDDEN_TESTS = `import { validateSession } from "./session"
import { db } from "./db"
import { RateLimiter } from "./rate-limiter"
import type { Session } from "./types"

const validSession: Session = { id: "s1", token: "tok", expiresAt: Date.now() + 1000000 }

describe("validateSession (merged)", () => {
  it("rejects without hitting the store when rate-limited", async () => {
    jest.spyOn(RateLimiter.prototype, "allow").mockReturnValue(false)
    const lookup = jest.spyOn(db, "getSession").mockResolvedValue(validSession)

    const result = await validateSession("tok")

    expect(result).toBeNull()
    expect(lookup).toHaveBeenCalledTimes(0)
  })

  it("deletes expired sessions and returns null", async () => {
    jest.spyOn(RateLimiter.prototype, "allow").mockReturnValue(true)
    const expired: Session = { id: "s2", token: "tok", expiresAt: Date.now() - 1 }
    jest.spyOn(db, "getSession").mockResolvedValue(expired)
    const cleanup = jest.spyOn(db, "deleteExpired").mockResolvedValue(undefined)

    const result = await validateSession("tok")

    expect(result).toBeNull()
    expect(cleanup).toHaveBeenCalledWith("s2")
  })

  it("returns the session object for a valid token", async () => {
    jest.spyOn(RateLimiter.prototype, "allow").mockReturnValue(true)
    jest.spyOn(db, "getSession").mockResolvedValue(validSession)

    const result = await validateSession("tok")

    expect(result).toEqual(validSession)
  })
})`

export type GitTemplateFile = {
  readonly code: string
  readonly readOnly?: boolean
}

export type GitTemplate = {
  files: Record<string, GitTemplateFile>
  editableFile: string
  versions: {
    base: string
    ours: string
    theirs: string
  }
  oursLabel: string
  theirsLabel: string
  extraModules: string[]
  hiddenTests: string
  conflictCount: number
  hiddenTestCount: number
  solutionCode: string
  hints: string[]
  hintsByLang?: Partial<Record<string, string[]>>
}

export const gitMergeConflict: Readonly<GitTemplate> = {
  files: {
    "auth/session.ts": { code: CONFLICTED_CODE },
    "auth/types.ts": { code: TYPES_CODE, readOnly: true },
    "auth/db.ts": { code: DB_CODE, readOnly: true },
    "auth/rate-limiter.ts": { code: RATE_LIMITER_CODE, readOnly: true },
  },
  editableFile: "auth/session.ts",
  versions: {
    base: BASE_CODE,
    ours: OURS_CODE,
    theirs: THEIRS_CODE,
  },
  oursLabel: "feat/rate-limiting",
  theirsLabel: "fix/session-expiry",
  extraModules: [TYPES_CODE, RATE_LIMITER_CODE, DB_CODE],
  hiddenTests: HIDDEN_TESTS,
  conflictCount: 3,
  hiddenTestCount: 3,
  solutionCode: SOLUTION_CODE,
  hints: [
    "Read all three versions first (base, ours, theirs). Conflict 1 is the easy one — one side adds the `RateLimiter` import and the `limiter` instance, the other side is empty. Keep the side that has content.",
    "Conflict 2 is a contract decision: `Promise<boolean>` only tells callers yes/no, while `Promise<Session | null>` hands back the actual session. Pick the richer contract — the rest of the merge depends on it.",
    "Conflict 3 needs BOTH sides. Keep feat's rate-limit guard, but make it `return null` (not `false`) to match the new return type, then follow it with fix's lookup, expiry cleanup, and `return session`. Accepting either side alone drops the other's logic.",
  ],
  hintsByLang: {
    es: [
      "Lee primero las tres versiones (base, ours, theirs). El conflicto 1 es el fácil — un lado añade el import de `RateLimiter` y la instancia `limiter`, el otro está vacío. Quédate con el lado que tiene contenido.",
      "El conflicto 2 es una decisión de contrato: `Promise<boolean>` solo dice sí/no, mientras que `Promise<Session | null>` devuelve la sesión real. Elige el contrato más rico — el resto del merge depende de ello.",
      "El conflicto 3 necesita AMBOS lados. Conserva el guard de rate-limit de feat, pero haz que `return null` (no `false`) para encajar con el nuevo tipo de retorno, y a continuación pon el lookup, la limpieza de expiradas y el `return session` de fix. Aceptar un solo lado descarta la lógica del otro.",
    ],
  },
}
