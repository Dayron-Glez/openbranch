/**
 * Names the two Supabase projects so nobody has to type a project ref.
 *
 * Every Supabase CLI command acts on whichever project is linked, and none of
 * them accept `--project-ref`. That makes the linked project ambient state you
 * cannot see from the command you are about to run — which is fine for `push`
 * and fatal for `reset`, since resetting while linked to production drops its
 * schema. So `reset` here refuses to run unless the link points at test.
 *
 * Usage:
 *   bun run db:which        — report the linked project
 *   bun run db:use:test     — link to openbranch-test
 *   bun run db:use:prod     — link to openbranch
 *   bun run db:reset        — reset the TEST database, refusing on production
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { spawnSync } from "node:child_process"

type ProjectName = "test" | "prod"

type Project = {
  readonly ref: string
  readonly label: string
  /** Whether destructive commands may target it. */
  readonly disposable: boolean
}

const PROJECTS: Readonly<Record<ProjectName, Project>> = {
  test: { ref: "uhoamryinrxtukymyxqt", label: "openbranch-test", disposable: true },
  prod: { ref: "hcfaephzphtyzqvhgfyn", label: "openbranch", disposable: false },
}

const LINK_FILE = join(process.cwd(), "supabase", ".temp", "linked-project.json")

/**
 * The annotation sits on the binding, not just the return type: TypeScript only
 * narrows after a never-returning call when the variable itself is annotated.
 */
const fail: (message: string) => never = (message) => {
  console.error(message)
  process.exit(1)
}

/** The currently linked project, or null when the repo has never been linked. */
const readLinkedRef = (): string | null => {
  if (!existsSync(LINK_FILE)) return null
  try {
    const parsed: unknown = JSON.parse(readFileSync(LINK_FILE, "utf8"))
    const ref = (parsed as { ref?: unknown }).ref
    return typeof ref === "string" ? ref : null
  } catch {
    return null
  }
}

const findByRef = (ref: string | null): Project | null =>
  Object.values(PROJECTS).find((project) => project.ref === ref) ?? null

const runSupabase = (args: readonly string[]): void => {
  const result = spawnSync("bunx", ["supabase", ...args], { stdio: "inherit", shell: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const describeLink = (): void => {
  const ref = readLinkedRef()
  const project = findByRef(ref)
  if (project === null) {
    console.log(ref === null ? "Not linked to any project." : `Linked to an unknown ref: ${ref}`)
    return
  }
  const suffix = project.disposable ? "" : "  ← PRODUCTION"
  console.log(`Linked to ${project.label} (${project.ref})${suffix}`)
}

const link = (name: ProjectName): void => {
  const project = PROJECTS[name]
  runSupabase(["link", "--project-ref", project.ref])
  describeLink()
}

/**
 * Resets only a disposable database. The guard reads the link itself rather
 * than trusting the caller, so it holds however the script is invoked.
 */
const reset = (): void => {
  const project = findByRef(readLinkedRef())
  if (project === null) {
    fail("Refusing to reset: no recognised project is linked. Run `bun run db:which`.")
  }
  if (!project.disposable) {
    fail(
      `Refusing to reset ${project.label} — that is production, and a reset would drop its schema.\n` +
        "Run `bun run db:use:test` first if you meant to reset the test database."
    )
  }
  console.log(`Resetting ${project.label}…`)
  runSupabase(["db", "reset", "--linked"])
  console.log(
    "\nDone. The auth schema is untouched, so your account still exists without a profile row.\n" +
      "Delete it under Authentication → Users and sign in again for a clean account."
  )
}

const command = process.argv[2]

switch (command) {
  case "which":
    describeLink()
    break
  case "use-test":
    link("test")
    break
  case "use-prod":
    link("prod")
    break
  case "reset":
    reset()
    break
  default:
    fail(`Unknown command: ${command ?? "(none)"}. Expected which, use-test, use-prod or reset.`)
}
