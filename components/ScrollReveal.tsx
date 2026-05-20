"use client"

import { useEffect } from "react"

export function ScrollReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"))

    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"))
      return
    }

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
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.12,
      }
    )

    items.forEach((item) => {
      if (!revealIfVisible(item)) observer.observe(item)
    })

    return () => observer.disconnect()
  }, [])

  return null
}
