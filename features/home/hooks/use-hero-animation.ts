import { useEffect, type RefObject } from "react"
import gsap from "gsap"

export function useHeroAnimation(
  markRef: RefObject<HTMLDivElement | null>,
  wordRefs: RefObject<HTMLSpanElement[]>,
  copyRef: RefObject<HTMLParagraphElement | null>,
  actionsRef: RefObject<HTMLDivElement | null>,
  terminalRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline()

      tl.set(markRef.current, { opacity: 1 })

      tl.fromTo(
        wordRefs.current,
        { clipPath: "inset(0 0 110% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.65, stagger: 0.09, ease: "power3.out" },
        "+=0.08"
      )

      tl.fromTo(
        copyRef.current,
        { y: 22, opacity: 0, filter: "blur(5px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" },
        "-=0.3"
      )

      tl.fromTo(
        actionsRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.5"
      )

      tl.fromTo(
        terminalRef.current,
        { y: 36, opacity: 0, scale: 0.965, filter: "blur(10px)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.85, ease: "power3.out" },
        "-=0.4"
      )

      return () => tl.kill()
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const els = [
        markRef.current,
        ...wordRefs.current,
        copyRef.current,
        actionsRef.current,
        terminalRef.current,
      ].filter(Boolean)
      gsap.set(els, { opacity: 1, clearProps: "clipPath,y,filter,scale" })
    })

    return () => mm.revert()
  }, [])
}
