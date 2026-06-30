import { useState, useEffect } from "react"

export const CMD1 = 'openbranch recipe "trunk-based"'
export const CMD2 = "openbranch apply --to atlas/"

export function useTerminalAnimation() {
  const [step, setStep] = useState<number>(-1)
  const [cmd1Chars, setCmd1Chars] = useState<number>(0)
  const [cmd2Chars, setCmd2Chars] = useState<number>(0)

  useEffect(() => {
    const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setStep(9)
      setCmd1Chars(CMD1.length)
      setCmd2Chars(CMD2.length)
      return
    }
    const t = setTimeout(() => setStep(0), 2300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (step !== 0) return
    if (cmd1Chars < CMD1.length) {
      const t = setTimeout(() => setCmd1Chars((n) => n + 1), 55)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(1), 280)
    return () => clearTimeout(t)
  }, [step, cmd1Chars])

  useEffect(() => {
    if (step < 1 || step > 5) return
    const delays = [150, 120, 120, 120, 500]
    const t = setTimeout(() => setStep((s) => s + 1), delays[step - 1])
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (step !== 6) return
    if (cmd2Chars < CMD2.length) {
      const t = setTimeout(() => setCmd2Chars((n) => n + 1), 55)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(7), 280)
    return () => clearTimeout(t)
  }, [step, cmd2Chars])

  useEffect(() => {
    if (step !== 7 && step !== 8) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 7 ? 160 : 250)
    return () => clearTimeout(t)
  }, [step])

  return { step, cmd1Chars, cmd2Chars }
}
