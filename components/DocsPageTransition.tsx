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
      // y/transform intentionally omitted — a transform on this wrapper
      // breaks position:sticky on the fumadocs TOC (#nd-toc)
      gsap.from(ref.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        clearProps: "opacity",
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
