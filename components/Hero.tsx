"use client"

import { useState, useEffect, useRef, type RefObject } from "react"
import gsap from "gsap"
import Link from "next/link"
import { LogoMark } from "@/components/LogoMark"
import {
  Terminal,
  TerminalLine,
  Prompt,
  Ok,
  Highlight,
  Dim,
  BranchBlock,
  Cursor,
} from "@/components/Terminal"
import { IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"

const CMD1 = 'openbranch recipe "trunk-based"'
const CMD2 = "openbranch apply --to atlas/"

function useTerminalAnimation() {
  const [step, setStep] = useState(-1)
  const [cmd1Chars, setCmd1Chars] = useState(0)
  const [cmd2Chars, setCmd2Chars] = useState(0)

  // Kick off after the GSAP terminal entrance (~2 s) + buffer
  useEffect(() => {
    const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setStep(9)
      setCmd1Chars(CMD1.length)
      setCmd2Chars(CMD2.length)
      return
    }
    const t = setTimeout(() => setStep(0), 2300)
    return () => clearTimeout(t)
  }, [])

  // Step 0: type CMD1 char-by-char
  useEffect(() => {
    if (step !== 0) return
    if (cmd1Chars < CMD1.length) {
      const t = setTimeout(() => setCmd1Chars((n) => n + 1), 55)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(1), 280)
    return () => clearTimeout(t)
  }, [step, cmd1Chars])

  // Steps 1-5: sequential output lines
  useEffect(() => {
    if (step < 1 || step > 5) return
    const delays = [150, 120, 120, 120, 500]
    const t = setTimeout(() => setStep((s) => s + 1), delays[step - 1])
    return () => clearTimeout(t)
  }, [step])

  // Step 6: type CMD2 char-by-char
  useEffect(() => {
    if (step !== 6) return
    if (cmd2Chars < CMD2.length) {
      const t = setTimeout(() => setCmd2Chars((n) => n + 1), 55)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep(7), 280)
    return () => clearTimeout(t)
  }, [step, cmd2Chars])

  // Steps 7-8: success lines
  useEffect(() => {
    if (step !== 7 && step !== 8) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 7 ? 160 : 250)
    return () => clearTimeout(t)
  }, [step])

  return { step, cmd1Chars, cmd2Chars }
}

function useHeroAnimation(
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

      // 1. Logo container — make it visible; CSS draw animation fires automatically
      tl.set(markRef.current, { opacity: 1 })

      // 2. Headline words — clip-path reveal, staggered ~90 ms each
      tl.fromTo(
        wordRefs.current,
        { clipPath: "inset(0 0 110% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.65, stagger: 0.09, ease: "power3.out" },
        "+=0.08"
      )

      // 3. Subtitle fade up (overlaps end of headline)
      tl.fromTo(
        copyRef.current,
        { y: 22, opacity: 0, filter: "blur(5px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" },
        "-=0.3"
      )

      // 4. CTA
      tl.fromTo(
        actionsRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.5"
      )

      // 5. Terminal — springs in last
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

const buttonBase =
  "inline-flex h-[42px] items-center gap-2 rounded-[var(--r-8)] border border-transparent px-5 text-sm font-medium leading-none tracking-[0] no-underline transition-[background,border-color,color,filter] duration-[var(--d-fast)] ease-[var(--ease)] [&_svg]:size-3.5"

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
  }, [displayed, phase, phraseIdx])

  const stats = dict.stats

  return (
    <section className="relative pt-18">
      {/* Centred intro content */}
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

        <h1 className="mx-auto mb-6 text-[48px] leading-[1.12] font-normal tracking-[-0.03em] max-[980px]:text-[38px] max-[520px]:text-[32px]">
          {titleWords.map((word, i) => (
            <span
              key={i}
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
              className="bg-ob-accent ml-px inline-block w-[2px] translate-y-[1px] animate-[ob-blink_1s_steps(1)_infinite] rounded-sm align-baseline"
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
          <Link
            href={localizedHref(lang, "/docs")}
            className={`${buttonBase} group bg-ob-accent text-accent-ink hover:brightness-[1.06]`}
          >
            {dict.cta}
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </Link>
        </div>
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="intro-terminal relative mx-auto mt-16 max-w-[920px] before:absolute before:inset-[-1px] before:-z-10 before:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(94,227,154,.20),transparent_60%)] before:blur-[40px] before:content-['']"
      >
        <Terminal>
          {/* CMD1 — typing in progress or fully styled */}
          {step >= 0 && (
            <TerminalLine>
              <Prompt />
              <span>
                {step === 0 ? (
                  <>
                    {CMD1.slice(0, cmd1Chars)}
                    <Cursor />
                  </>
                ) : (
                  <>
                    <Highlight>openbranch</Highlight>
                    {" recipe "}
                    <Dim>&quot;trunk-based&quot;</Dim>
                  </>
                )}
              </span>
            </TerminalLine>
          )}

          {/* Output: fetching */}
          {step >= 1 && (
            <TerminalLine>
              <Dim>→ fetching guide · 2.1 KB · cached</Dim>
            </TerminalLine>
          )}

          {/* Branch block: lines reveal one by one */}
          {step >= 2 && (
            <BranchBlock>
              <TerminalLine>
                <span className="text-ob-accent">●</span>
                <span>a4f1e2c</span>
                <Dim>Pull from main, branch with intent (&lt;24h)</Dim>
              </TerminalLine>
              {step >= 3 && (
                <TerminalLine>
                  <span>○</span>
                  <span>9b2d8a1</span>
                  <Dim>Wrap unfinished work in a feature flag</Dim>
                </TerminalLine>
              )}
              {step >= 4 && (
                <TerminalLine>
                  <span>○</span>
                  <span>7c0e44d</span>
                  <Dim>Open PR · &lt; 400 lines diff target</Dim>
                </TerminalLine>
              )}
              {step >= 5 && (
                <TerminalLine>
                  <span>○</span>
                  <span>3f12a89</span>
                  <Dim>Squash · merge · delete branch</Dim>
                </TerminalLine>
              )}
            </BranchBlock>
          )}

          {/* CMD2 — typing in progress or fully styled */}
          {step >= 6 && (
            <TerminalLine>
              <Prompt />
              <span>
                {step === 6 ? (
                  <>
                    {CMD2.slice(0, cmd2Chars)}
                    <Cursor />
                  </>
                ) : (
                  <>
                    <Highlight>openbranch</Highlight>
                    {" apply "}
                    <Dim>--to atlas/</Dim>
                  </>
                )}
              </span>
            </TerminalLine>
          )}

          {/* Success lines */}
          {step >= 7 && (
            <TerminalLine>
              <Ok />
              <span>
                Generated <Highlight>CONTRIBUTING.md</Highlight>
                {" · "}
                <Highlight>.github/PULL_REQUEST_TEMPLATE.md</Highlight>
              </span>
            </TerminalLine>
          )}
          {step >= 8 && (
            <TerminalLine>
              <Ok />
              <span>Wired branch protections · enforced PR size limit · 2-reviewer rule</span>
            </TerminalLine>
          )}

          {/* Idle cursor (step -1) or final prompt (step 9+) */}
          {(step === -1 || step >= 9) && (
            <TerminalLine>
              <Prompt />
              <Cursor />
            </TerminalLine>
          )}
        </Terminal>
      </div>

      {/* Stats strip — part of intro, no extra gap */}
      <div className="border-line mt-12 grid grid-cols-4 border-y py-6 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
        {stats.map(({ n, unit, label }, i) => (
          <div
            key={label}
            className={`border-line px-6 py-2 max-[980px]:py-4 ${i < 3 ? "border-r" : ""} ${i === 1 ? "max-[980px]:border-r-0" : ""} ${i < 2 ? "max-[980px]:border-b max-[980px]:pb-4" : ""} max-[520px]:border-r-0 max-[520px]:border-b max-[520px]:last:border-b-0`}
          >
            <div className="text-[28px] font-medium tracking-[0]">
              {n}
              {unit && <span className="text-fg-muted ml-0.5 text-base font-normal">{unit}</span>}
            </div>
            <div className="text-fg-muted mt-1 font-mono text-[11px] tracking-[0.06em] uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
