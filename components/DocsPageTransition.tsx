"use client"

import { useRef, useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import gsap from "gsap"

export function DocsPageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useLayoutEffect(() => {
    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 10,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      })
    })
    return () => mm.revert()
  }, [pathname])

  return (
    <div ref={ref} className="docs-page-content">
      {children}
    </div>
  )
}
