/**
 * Verifies the weekly-pick rotation algorithm:
 *   1. Within a full cycle (N guides × N weeks), every guide appears exactly once.
 *   2. The same date always returns the same guide (determinism).
 *   3. No guide repeats across a cycle boundary (cross-cycle adjacency fix).
 *
 * Run: bun run scripts/verify-weekly-rotation.ts
 */

// --- Exact copies of the private helpers in lib/weekly-pick.ts ---

const mulberry32 = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s = Math.trunc(s)
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const arr = [...items]
  const rand = mulberry32(seed)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const getAbsoluteWeek = (date: Date): number =>
  Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000))

// --- Real guide list (mirrors source.getPages("es").filter + sort in weekly-pick.ts) ---

const guides = [
  "/es/docs/best-practices/blameless-post-mortems",
  "/es/docs/contributing/ci-guardrails",
  "/es/docs/git/branching-strategies",
  "/es/docs/pull-requests/review-culture",
  "/es/docs/releases/semver-in-practice",
  "/es/docs/testing/killing-flaky-ci",
]

const N = guides.length
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Mirrors the fixed getWeeklyPick logic exactly
const pickForDate = (date: Date): string => {
  const week = getAbsoluteWeek(date)
  const cycle = Math.floor(week / N)
  const position = week % N

  const shuffled = seededShuffle(guides, cycle)
  if (cycle > 0 && shuffled[0] === seededShuffle(guides, cycle - 1).at(-1)) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  return shuffled[position]
}

// --- Test helpers ---

const today = new Date()
const currentWeek = getAbsoluteWeek(today)
const currentCycle = Math.floor(currentWeek / N)
const cycleStartWeek = currentCycle * N
const cycleStartDate = new Date(cycleStartWeek * ONE_WEEK_MS)

// --- Test 1: all guides in the current cycle are unique ---

console.log(
  `\n[1] Full cycle ${currentCycle} — ${N} weeks, starting ${cycleStartDate.toISOString().slice(0, 10)}\n`
)

const cyclePicks: string[] = []
for (let w = 0; w < N; w++) {
  const date = new Date(cycleStartDate.getTime() + w * ONE_WEEK_MS)
  const pick = pickForDate(date)
  cyclePicks.push(pick)
  const slug = pick.split("/").at(-1)
  const marker = getAbsoluteWeek(date) === currentWeek ? " ← current week" : ""
  console.log(
    `  week ${cycleStartWeek + w}  (${date.toISOString().slice(0, 10)})  →  ${slug}${marker}`
  )
}

const uniqueInCycle = new Set(cyclePicks).size === N
console.log(
  `\n  ${uniqueInCycle ? "✓ PASS" : "✗ FAIL"} — all ${N} guides appear exactly once within the cycle`
)

// --- Test 2: determinism — same date always returns the same guide ---

const sameDate1 = pickForDate(today)
const sameDate2 = pickForDate(today)
const isDeterministic = sameDate1 === sameDate2
console.log(`\n[2] Determinism: same date → same guide  ${isDeterministic ? "✓ PASS" : "✗ FAIL"}`)

// --- Test 3: no repeat across cycle boundaries (checks 10 consecutive boundaries) ---

console.log(`\n[3] Cross-cycle boundary — no guide repeats across ${10} boundaries\n`)

let boundaryPass = true
for (let c = 1; c <= 10; c++) {
  const lastWeekOfPrevCycle = new Date((c * N - 1) * ONE_WEEK_MS)
  const firstWeekOfNextCycle = new Date(c * N * ONE_WEEK_MS)
  const prev = pickForDate(lastWeekOfPrevCycle)
  const next = pickForDate(firstWeekOfNextCycle)
  const ok = prev !== next
  if (!ok) boundaryPass = false
  console.log(
    `  cycle ${c - 1}→${c}  last=${prev.split("/").at(-1)}  first=${next.split("/").at(-1)}  ${ok ? "✓" : "✗ COLLISION"}`
  )
}

console.log(
  `\n  ${boundaryPass ? "✓ PASS" : "✗ FAIL"} — no cross-cycle collisions in 10 boundaries`
)

// --- Summary ---

const allPassed = uniqueInCycle && isDeterministic && boundaryPass
console.log(`\n${allPassed ? "✓ ALL CHECKS PASSED" : "✗ SOME CHECKS FAILED"}\n`)
if (!allPassed) process.exit(1)
