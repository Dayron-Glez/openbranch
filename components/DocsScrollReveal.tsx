"use client"

import { useEffect, useRef } from "react"

export function DocsScrollReveal({ children }: Readonly<{ children: React.ReactNode }>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const elements = Array.from(container.children) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    )

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      // Only animate elements strictly below the current viewport.
      // Skips both in-view content and anything already scrolled past.
      if (rect.top <= window.innerHeight) return
      el.classList.add("scroll-reveal")
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}
