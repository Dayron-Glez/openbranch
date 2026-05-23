"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { LogoMark } from "@/components/shared/LogoMark"
import { HeroTerminal } from "@/components/home/HeroTerminal"
import { IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { Button } from "@/components/ui/button"
import { useTerminalAnimation } from "@/lib/hooks/use-terminal-animation"
import { useHeroAnimation } from "@/lib/hooks/use-hero-animation"

type HeroProps = {
  readonly dict: LandingDict["hero"]
  readonly lang: string
}

export function Hero({ dict, lang }: HeroProps) {
  const PHRASES = dict.phrases
  const [logoRun, setLogoRun] = useState(0)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [phase, setPhase] = useState<"typing" | "waiting" | "deleting">("typing")

  const markRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<HTMLSpanElement[]>([])
  const copyRef = useRef<HTMLParagraphElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useHeroAnimation(markRef, wordRefs, copyRef, actionsRef, terminalRef)

  const titleWords = dict.titleLead.split(" ")
  const { step, cmd1Chars, cmd2Chars } = useTerminalAnimation()

  useEffect(() => {
    const phrase = PHRASES[phraseIdx]
    if (phase === "typing") {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 65)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase("deleting"), 3800)
      return () => clearTimeout(t)
    }
    if (phase === "deleting") {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed((d) => d.slice(0, -1)), 32)
        return () => clearTimeout(t)
      }
      setPhraseIdx((i) => (i + 1) % PHRASES.length)
      setPhase("typing")
    }
  }, [displayed, phase, phraseIdx, PHRASES])

  return (
    <section className="relative pt-18">
      <div className="text-center">
        <div ref={markRef} className="intro-mark mb-8 flex min-h-16 justify-center">
          <button
            type="button"
            className="text-fg appearance-none border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none"
            aria-label={dict.replayAria}
            onClick={() => setLogoRun((run) => run + 1)}
          >
            <LogoMark key={logoRun} size={64} animate className="overflow-visible" />
          </button>
        </div>

        <h1 className="mx-auto mb-6 text-[length:var(--text-hero)] leading-[1.12] font-normal tracking-[-0.03em] max-[980px]:text-[length:var(--text-6xl)] max-[520px]:text-[length:var(--text-5xl)]">
          {titleWords.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="intro-word"
              ref={(el) => {
                if (el) wordRefs.current[i] = el
              }}
            >
              {word}
              {i < titleWords.length - 1 ? " " : ""}
            </span>
          ))}
          <br />
          <span className="text-ob-accent font-medium">
            {displayed}
            <span
              aria-hidden
              className="bg-ob-accent ml-px inline-block w-0.5 translate-y-px animate-[ob-blink_1s_steps(1)_infinite] rounded-sm align-baseline"
              style={{ height: "0.85em" }}
            />
          </span>
        </h1>

        <p
          ref={copyRef}
          className="intro-copy text-fg-2 mx-auto mb-9 max-w-[48ch] text-lg leading-[1.55] text-pretty"
        >
          {dict.subtitle}
        </p>

        <div ref={actionsRef} className="intro-actions flex flex-wrap justify-center gap-2.5">
          <Button asChild variant="accent" className="group no-underline">
            <Link href={localizedHref(lang, "/docs")}>
              {dict.cta}
              <IconArrowRight className="transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
            </Link>
          </Button>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="intro-terminal relative mx-auto mt-16 max-w-230 before:absolute before:-inset-px before:-z-10 before:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(94,227,154,.20),transparent_60%)] before:blur-2xl before:content-['']"
      >
        <HeroTerminal step={step} cmd1Chars={cmd1Chars} cmd2Chars={cmd2Chars} />
      </div>

      <div className="border-line mt-12 grid grid-cols-4 border-y py-6 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
        {dict.stats.map(({ n, unit, label }, i) => (
          <div
            key={label}
            className={`border-line px-6 py-2 max-[980px]:py-4 ${i < 3 ? "border-r" : ""} ${i === 1 ? "max-[980px]:border-r-0" : ""} ${i < 2 ? "max-[980px]:border-b max-[980px]:pb-4" : ""} max-[520px]:border-r-0 max-[520px]:border-b max-[520px]:last:border-b-0`}
          >
            <div className="text-[length:var(--text-4xl)] font-medium tracking-normal">
              {n}
              {unit && <span className="text-fg-muted ml-0.5 text-base font-normal">{unit}</span>}
            </div>
            <div className="text-fg-muted mt-1 font-mono text-[length:var(--text-sm)] tracking-[0.06em] uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
