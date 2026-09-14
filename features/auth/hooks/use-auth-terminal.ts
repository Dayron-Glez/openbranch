import { useEffect, useState } from "react"

export const AUTH_COMMANDS = [
  "git switch -c fix/session-expiry",
  "git merge main",
  "git commit",
] as const

const TYPE_MS = 38
const AFTER_COMMAND_MS = 260
const REVEAL_MS = 210
const START_DELAY_MS = 420

/**
 * Beats of the sequence. 0/1/4 type a command, 2 and 3 reveal the conflict
 * report the merge produced, 5 leaves the cursor blinking.
 */
const TYPING_BEATS: Readonly<Record<number, number>> = { 0: 0, 1: 1, 4: 2 }
const DONE_BEAT = 5

export type AuthTerminalState = {
  /** Characters typed so far of each command in `AUTH_COMMANDS`. */
  readonly typedChars: readonly number[]
  readonly beat: number
  readonly done: boolean
}

const fullyTyped = (): number[] => AUTH_COMMANDS.map((command) => command.length)

/**
 * Drives the login terminal the way the home hero drives its own: a timer
 * machine rather than CSS, because the reveal order carries the meaning (the
 * conflict has to land *after* the merge command, not alongside it).
 *
 * Reduced motion skips straight to the finished frame — the content is the
 * point, the typing is decoration.
 */
export const useAuthTerminal = (): AuthTerminalState => {
  const [beat, setBeat] = useState<number>(-1)
  const [typedChars, setTypedChars] = useState<readonly number[]>([0, 0, 0])

  useEffect(() => {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTypedChars(fullyTyped())
      setBeat(DONE_BEAT)
      return
    }
    const timer = setTimeout(() => setBeat(0), START_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const commandIndex = TYPING_BEATS[beat]
    if (commandIndex === undefined) return

    const target = AUTH_COMMANDS[commandIndex]
    if (typedChars[commandIndex] < target.length) {
      const timer = setTimeout(() => {
        setTypedChars((current) =>
          current.map((count, index) => (index === commandIndex ? count + 1 : count))
        )
      }, TYPE_MS)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => setBeat((current) => current + 1), AFTER_COMMAND_MS)
    return () => clearTimeout(timer)
  }, [beat, typedChars])

  useEffect(() => {
    if (beat !== 2 && beat !== 3) return
    const timer = setTimeout(() => setBeat((current) => current + 1), REVEAL_MS)
    return () => clearTimeout(timer)
  }, [beat])

  return { typedChars, beat, done: beat >= DONE_BEAT }
}
