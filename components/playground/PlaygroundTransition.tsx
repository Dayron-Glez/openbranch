"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

export const PlaygroundTransition = () => {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-pg-main]", {
        opacity: 0,
        y: 14,
        duration: 0.38,
        ease: "power2.out",
        clearProps: "all",
      })
    })
    return () => mm.revert()
  }, [pathname])

  return null
}
