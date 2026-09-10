"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export const ScrollReveal = (): null => {
  const pathname = usePathname()

  useEffect(() => {
    const reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches

    const revealIfVisible = (item: HTMLElement) => {
      const rect = item.getBoundingClientRect()
      const entersViewport = rect.top < globalThis.innerHeight * 0.78 && rect.bottom > 0
      if (entersViewport) item.classList.add("is-visible")
      return entersViewport
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: "0px 0px -14% 0px", threshold: 0.12 }
    )

    // Queried inside rAF because Next may still be committing RSC content when
    // useEffect fires on a back navigation, leaving elements unlaid-out.
    const frame = requestAnimationFrame(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"))

      if (reducedMotion) {
        items.forEach((item) => item.classList.add("is-visible"))
        return
      }

      items.forEach((item) => {
        if (!revealIfVisible(item)) observer.observe(item)
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [pathname])

  return null
}
