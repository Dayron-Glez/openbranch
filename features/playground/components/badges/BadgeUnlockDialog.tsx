"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/shared/LogoMark"
import { TRACK_BY_BADGE_KEY, type BadgeKey } from "@/features/playground/domain/manifest"
import { BadgeUnlockIcon } from "./BadgeUnlockIcon"

type BadgeUnlockDialogProps = {
  readonly badgeKey: BadgeKey
  readonly name: string
  readonly description: string
  readonly eyebrow: string
  readonly newTag: string
  readonly continueLabel: string
}

/** Two full turns plus the half that brings the face round from face-down. */
const SPIN_FROM = 900
const SPIN_DURATION = 1.9
const SPIN_START = 0.25

/** Late in the spin, so the glyph draws as the card lands rather than mid-blur. */
const ICON_CUE = SPIN_START + SPIN_DURATION * 0.7
/** The card has landed face-on; the glow and the gloss belong after this. */
const SETTLE = SPIN_START + SPIN_DURATION

const UnlockReveal = ({
  badgeKey,
  name,
  description,
  eyebrow,
  newTag,
  continueLabel,
}: BadgeUnlockDialogProps): ReactNode => {
  const [iconShown, setIconShown] = useState<boolean>(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const glossRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const copy = copyRef.current
    const glow = glowRef.current
    const gloss = glossRef.current
    if (card === null || copy === null || glow === null || gloss === null) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline()
      tl.fromTo(
        card,
        { rotateY: SPIN_FROM, scale: 0.62, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }
      )
        // `power2.inOut`, not `power3`: cubic peaks at ~2.7× its average speed
        // against quadratic's 2×, and peak velocity is what smears the face.
        .to(card, { rotateY: 0, duration: SPIN_DURATION, ease: "power2.inOut" }, SPIN_START)
        .call(() => setIconShown(true), [], ICON_CUE)
        .fromTo(
          copy,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          SPIN_START + SPIN_DURATION * 0.8
        )
        // The halo only makes sense once the face is toward you.
        .fromTo(
          glow,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
          SETTLE - 0.25
        )
        // A travel plus a separate fade in and fade out, not one tween ending
        // lit: a sweep left at opacity 1 is a permanent smear across the card.
        .fromTo(
          gloss,
          { xPercent: -190 },
          { xPercent: 190, duration: 0.9, ease: "power1.inOut" },
          SETTLE
        )
        .fromTo(gloss, { opacity: 0 }, { opacity: 1, duration: 0.2 }, SETTLE)
        .to(gloss, { opacity: 0, duration: 0.32 }, SETTLE + 0.55)
      return () => tl.kill()
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(card, { rotateY: 0, scale: 1, opacity: 1 })
      gsap.set(copy, { y: 0, opacity: 1 })
      gsap.set(glow, { opacity: 1, scale: 1 })
      gsap.set(gloss, { opacity: 0 })
      setIconShown(true)
    })

    return () => mm.revert()
  }, [badgeKey])

  const track = TRACK_BY_BADGE_KEY.get(badgeKey)
  // Milestone badges (streak-7, all-tracks) belong to no track, so they carry
  // the product accent wherever a track colour would go.
  const accent = track === undefined ? "var(--color-ob-accent)" : "var(--track)"
  const ring = track === undefined ? "var(--color-accent-ring)" : "var(--track-ring)"

  // The badge's colour lives in the edge and the halo; flooding the face buries
  // the glyph.
  const faceSurface =
    "absolute inset-0 grid place-items-center overflow-hidden rounded-(--r-16) border"
  const faceStyle = {
    borderColor: ring,
    backgroundImage: `linear-gradient(148deg, color-mix(in oklab, ${accent} 9%, var(--color-bg-elev)), var(--color-bg-elev) 58%)`,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 40px -12px rgba(0,0,0,0.75)`,
  } as const

  return (
    <>
      <div data-track={track?.colorToken} className="relative" style={{ perspective: "1100px" }}>
        {/* Outside the transformed card, so it does not turn with it. */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute -inset-10 opacity-0"
          style={{
            background: `radial-gradient(closest-side, color-mix(in oklab, ${accent} 34%, transparent), transparent 72%)`,
          }}
        />
        <div
          ref={cardRef}
          className="relative size-[172px] opacity-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className={`${faceSurface} ${track === undefined ? "text-ob-accent" : "text-(color:--track)"}`}
            style={{ ...faceStyle, backfaceVisibility: "hidden" }}
          >
            <span
              className="grid place-items-center [&_svg]:size-[76px]"
              style={{
                filter: `drop-shadow(0 0 14px color-mix(in oklab, ${accent} 45%, transparent))`,
              }}
            >
              {iconShown && <BadgeUnlockIcon badgeKey={badgeKey} playKey={0} />}
            </span>
            <div
              ref={glossRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 opacity-0"
              style={{
                background:
                  "linear-gradient(75deg, transparent, rgba(255,255,255,0.10) 42%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.10) 58%, transparent)",
                mixBlendMode: "overlay",
              }}
            />
          </div>
          <div
            className={`${faceSurface} text-fg-faint`}
            style={{ ...faceStyle, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <LogoMark size={44} />
          </div>
        </div>
      </div>

      <div ref={copyRef} className="mt-7 flex flex-col items-center text-center opacity-0">
        <p className="text-fg-2 mb-2 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase">
          {eyebrow}
          <span className="bg-accent-soft border-accent-ring text-ob-accent rounded-full border px-1.5 py-0.5 text-[9.5px] tracking-[0.04em] normal-case">
            {newTag}
          </span>
        </p>
        <DialogPrimitive.Title className="text-fg mb-2 text-[22px] font-medium">
          {name}
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="text-fg-2 max-w-[300px] text-[14px] leading-[1.6]">
          {description}
        </DialogPrimitive.Description>

        {/* Clicking outside and Esc both dismiss, but neither announces itself —
            this is the only visible way out. */}
        <DialogPrimitive.Close asChild>
          <Button variant="outline" className="bg-bg-elev mt-7 border-transparent">
            {continueLabel}
          </Button>
        </DialogPrimitive.Close>
      </div>
    </>
  )
}

export const BadgeUnlockDialog = (props: BadgeUnlockDialogProps): ReactNode => {
  const [open, setOpen] = useState<boolean>(true)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        {/**
         * A plain, unanimated element — not `Dialog.Overlay`, and carrying no
         * `pg-dialog-overlay` class or `data-state`, deliberately.
         *
         * `Dialog.Portal` wraps each child in its own `Presence`, which holds
         * a node mounted until the exit animation it is watching for reports
         * back. Any animated overlay here never gets that report, and the
         * stranded `inset-0` node sits at opacity 0 with pointer events live,
         * silently swallowing every click on the result page. Nothing looks
         * wrong; the page is simply dead. With no animation to wait on,
         * `Presence` drops this the moment the dialog closes.
         *
         * It loses nothing by being plain: dismissal belongs to `Content`'s
         * `DismissableLayer`, and this only ever needed to darken the page.
         */}
        <div aria-hidden className="fixed inset-0 z-50 bg-black/90 backdrop-blur-[7px]" />
        <DialogPrimitive.Content
          ref={contentRef}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            contentRef.current?.focus()
          }}
          className="fixed top-1/2 left-1/2 z-50 flex w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none"
        >
          <UnlockReveal {...props} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
