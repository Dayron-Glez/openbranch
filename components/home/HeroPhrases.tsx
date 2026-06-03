"use client"

const TYPE_INTERVAL_MS = 65
const DELETE_INTERVAL_MS = 32
const HOLD_DURATION_MS = 3800

const createTypewriter = (textNode: HTMLElement, phrases: readonly string[]) => {
  if (phrases.length === 0) return { stop: () => {} }

  if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    textNode.textContent = phrases[0]
    return { stop: () => {} }
  }

  let animationFrameId = 0
  let lastFrameTime = performance.now()
  let elapsedSinceStepMs = 0
  let phraseIndex = 0
  let visibleCharCount = 0
  let phase: "typing" | "waiting" | "deleting" = "typing"
  let holdUntilTime = 0

  const typeNextChar = (currentTime: number) => {
    visibleCharCount += 1
    if (visibleCharCount < phrases[phraseIndex].length) return false
    visibleCharCount = phrases[phraseIndex].length
    phase = "waiting"
    holdUntilTime = currentTime + HOLD_DURATION_MS
    return true
  }

  const deleteNextChar = () => {
    visibleCharCount -= 1
    if (visibleCharCount > 0) return false
    visibleCharCount = 0
    phraseIndex = (phraseIndex + 1) % phrases.length
    phase = "typing"
    return true
  }

  const advanceWaiting = (currentTime: number) => {
    if (currentTime < holdUntilTime) return
    phase = "deleting"
    elapsedSinceStepMs = 0
  }

  const advanceTypingOrDeleting = (currentTime: number) => {
    elapsedSinceStepMs += currentTime - lastFrameTime
    const stepIntervalMs = phase === "typing" ? TYPE_INTERVAL_MS : DELETE_INTERVAL_MS
    while (elapsedSinceStepMs >= stepIntervalMs) {
      elapsedSinceStepMs -= stepIntervalMs
      const phaseChanged = phase === "typing" ? typeNextChar(currentTime) : deleteNextChar()
      if (phaseChanged) break
    }
    textNode.textContent = phrases[phraseIndex].slice(0, visibleCharCount)
  }

  const renderFrame = (currentTime: number) => {
    if (phase === "waiting") {
      advanceWaiting(currentTime)
    } else {
      advanceTypingOrDeleting(currentTime)
    }

    lastFrameTime = currentTime
    animationFrameId = requestAnimationFrame(renderFrame)
  }

  animationFrameId = requestAnimationFrame(renderFrame)
  return {
    stop: () => cancelAnimationFrame(animationFrameId),
  }
}

type HeroPhrasesProps = {
  readonly phrases: readonly string[]
}

export function HeroPhrases({ phrases }: HeroPhrasesProps) {
  return (
    <span className="text-ob-accent inline-block w-full font-medium max-[520px]:min-h-[2.24em]">
      <span
        ref={(textNode) => {
          if (!textNode) return
          const typewriter = createTypewriter(textNode, phrases)
          return () => typewriter.stop()
        }}
      />
      <span
        aria-hidden
        className="bg-ob-accent ml-px inline-block w-0.5 translate-y-px animate-[ob-blink_1s_steps(1)_infinite] rounded-sm align-baseline"
        style={{ height: "0.85em" }}
      />
    </span>
  )
}
