"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

export function DocsPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(['[class*="grid-area:main"]', "#nd-toc"], {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        clearProps: "opacity",
      })
    })
    return () => mm.revert()
  }, [pathname])

  return <>{children}</>
}
