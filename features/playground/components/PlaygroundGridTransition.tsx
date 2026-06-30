"use client"

import { useLayoutEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import gsap from "gsap"

export const PlaygroundGridTransition = () => {
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useLayoutEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-challenge-card]", {
        opacity: 0,
        y: 10,
        duration: 0.22,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "all",
      })
    })
    return () => mm.revert()
  }, [searchParams])

  return null
}
