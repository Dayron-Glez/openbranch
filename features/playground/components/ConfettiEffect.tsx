"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

export const ConfettiEffect = (): null => {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.2 },
        colors: ["#5EE39A", "#3ACC82", "#A78BFA", "#60A5FA", "#F9A8D4", "#FCD34D", "#ECEEF1"],
        gravity: 1.1,
        scalar: 0.85,
        drift: 0,
      })?.catch(() => null)
    }, 350)
    return () => clearTimeout(timer)
  }, [])

  return null
}
