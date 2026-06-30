/**
 * 3-way merge utilities (diff3).
 *
 * This is a TypeScript port of the well-known `node-diff3` algorithm
 * (Khanna/Kunze/Wallach diff3), which is the same family of algorithms
 * GNU diff3 / git use to detect merge conflicts between a common ancestor
 * (base) and two derived versions (left/"ours" and right/"theirs").
 */

type Candidate = {
  buffer1index: number
  buffer2index: number
  chain: Candidate | null
}

const findSlot = (candidates: Candidate[], j: number, startAt: number): number => {
  for (let s = startAt; s < candidates.length; s++) {
    if (
      candidates[s].buffer2index < j &&
      (s === candidates.length - 1 || candidates[s + 1].buffer2index > j)
    ) {
      return s
    }
  }
  return candidates.length
}

const buildEquivalenceClasses = <T>(buffer: T[]): Map<T, number[]> => {
  const classes = new Map<T, number[]>()
  for (const [j, item] of buffer.entries()) {
    const arr = classes.get(item)
    if (arr) arr.push(j)
    else classes.set(item, [j])
  }
  return classes
}

/**
 * Longest Common Subsequence between two arrays of comparable items.
 * Returns the tail of a linked list (via `.chain`) describing the matches.
 */
function longestCommonSubsequence<T>(buffer1: T[], buffer2: T[]): Candidate {
  const equivalenceClasses = buildEquivalenceClasses(buffer2)

  const NULLRESULT: Candidate = { buffer1index: -1, buffer2index: -1, chain: null }
  const candidates: Candidate[] = [NULLRESULT]

  for (let i = 0; i < buffer1.length; i++) {
    const item = buffer1[i]
    const buffer2indices = equivalenceClasses.get(item) ?? []
    let r = 0
    let c = candidates[0]

    for (const j of buffer2indices) {
      const s = findSlot(candidates, j, r)

      if (s < candidates.length) {
        const newCandidate: Candidate = {
          buffer1index: i,
          buffer2index: j,
          chain: candidates[s],
        }
        if (r === candidates.length) candidates.push(c)
        else candidates[r] = c
        r = s + 1
        c = newCandidate
        if (r === candidates.length) break
      }
    }

    candidates[r] = c
  }

  return candidates.at(-1)!
}

type DiffIndex = {
  buffer1: [number, number]
  buffer2: [number, number]
}

function diffIndices<T>(buffer1: T[], buffer2: T[]): DiffIndex[] {
  const lcs = longestCommonSubsequence(buffer1, buffer2)
  const result: DiffIndex[] = []
  let tail1 = buffer1.length
  let tail2 = buffer2.length

  for (let candidate: Candidate | null = lcs; candidate !== null; candidate = candidate.chain) {
    const mismatchLength1 = tail1 - candidate.buffer1index - 1
    const mismatchLength2 = tail2 - candidate.buffer2index - 1
    tail1 = candidate.buffer1index
    tail2 = candidate.buffer2index

    if (mismatchLength1 || mismatchLength2) {
      result.push({
        buffer1: [tail1 + 1, mismatchLength1],
        buffer2: [tail2 + 1, mismatchLength2],
      })
    }
  }

  result.reverse()
  return result
}

export type StableRegion = {
  stable: true
  bufferContent: string[]
}

export type ConflictRegion = {
  stable: false
  aContent: string[]
  oContent: string[]
  bContent: string[]
}

export type MergeRegion = StableRegion | ConflictRegion

type Hunk = {
  ab: "a" | "b"
  oStart: number
  oLength: number
  abStart: number
  abLength: number
}

const buildConflictRegion = (
  a: string[],
  o: string[],
  b: string[],
  regionHunks: Hunk[],
  regionStart: number,
  regionEnd: number
): ConflictRegion => {
  const bounds = {
    a: [a.length, -1, o.length, -1],
    b: [b.length, -1, o.length, -1],
  }
  for (const h of regionHunks) {
    const oStart = h.oStart
    const oEnd = oStart + h.oLength
    const abStart = h.abStart
    const abEnd = abStart + h.abLength
    const t = bounds[h.ab]
    t[0] = Math.min(abStart, t[0])
    t[1] = Math.max(abEnd, t[1])
    t[2] = Math.min(oStart, t[2])
    t[3] = Math.max(oEnd, t[3])
  }
  const aStart = bounds.a[0] + (regionStart - bounds.a[2])
  const aEnd = bounds.a[1] + (regionEnd - bounds.a[3])
  const bStart = bounds.b[0] + (regionStart - bounds.b[2])
  const bEnd = bounds.b[1] + (regionEnd - bounds.b[3])
  return {
    stable: false,
    aContent: a.slice(aStart, aEnd),
    oContent: o.slice(regionStart, regionEnd),
    bContent: b.slice(bStart, bEnd),
  }
}

const toHunk =
  (ab: "a" | "b") =>
  (h: DiffIndex): Hunk => ({
    ab,
    oStart: h.buffer1[0],
    oLength: h.buffer1[1],
    abStart: h.buffer2[0],
    abLength: h.buffer2[1],
  })

const compareHunks = (x: Hunk, y: Hunk): number => x.oStart - y.oStart || x.ab.localeCompare(y.ab)

const appendStable = (
  results: MergeRegion[],
  o: string[],
  currOffset: number,
  endOffset: number
): number => {
  if (endOffset > currOffset) {
    results.push({ stable: true, bufferContent: o.slice(currOffset, endOffset) })
    return endOffset
  }
  return currOffset
}

const buildMergeResult = (
  a: string[],
  o: string[],
  b: string[],
  hunk: Hunk,
  regionHunks: Hunk[],
  regionStart: number,
  regionEnd: number
): MergeRegion | null => {
  if (regionHunks.length === 1) {
    if (hunk.abLength === 0) return null
    const buffer = hunk.ab === "a" ? a : b
    return { stable: true, bufferContent: buffer.slice(hunk.abStart, hunk.abStart + hunk.abLength) }
  }
  return buildConflictRegion(a, o, b, regionHunks, regionStart, regionEnd)
}

export function diff3MergeRegions(a: string[], o: string[], b: string[]): MergeRegion[] {
  const hunks: Hunk[] = [
    ...diffIndices(o, a).map(toHunk("a")),
    ...diffIndices(o, b).map(toHunk("b")),
  ].sort(compareHunks)

  const results: MergeRegion[] = []
  let currOffset = 0

  while (hunks.length) {
    const hunk = hunks.shift() as Hunk
    const regionStart = hunk.oStart
    let regionEnd = hunk.oStart + hunk.oLength
    const regionHunks: Hunk[] = [hunk]
    currOffset = appendStable(results, o, currOffset, regionStart)

    while (hunks.length) {
      const nextHunk = hunks[0]
      if (nextHunk.oStart > regionEnd) break
      regionEnd = Math.max(regionEnd, nextHunk.oStart + nextHunk.oLength)
      regionHunks.push(hunks.shift() as Hunk)
    }

    const region = buildMergeResult(a, o, b, hunk, regionHunks, regionStart, regionEnd)
    if (region !== null) results.push(region)
    currOffset = appendStable(results, o, currOffset, regionEnd)
  }

  appendStable(results, o, currOffset, o.length)
  return results
}

function arraysEqual(x: string[], y: string[]): boolean {
  if (x.length !== y.length) return false
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false
  return true
}

export type MergeBlock =
  | { type: "stable"; lines: string[] }
  | { type: "conflict"; left: string[]; base: string[]; right: string[] }

export function diff3Merge(left: string, base: string, right: string): MergeBlock[] {
  const a = splitLines(left)
  const o = splitLines(base)
  const b = splitLines(right)

  const regions = diff3MergeRegions(a, o, b)
  const blocks: MergeBlock[] = []
  let stableBuffer: string[] = []

  const flush = () => {
    if (stableBuffer.length) {
      blocks.push({ type: "stable", lines: stableBuffer })
      stableBuffer = []
    }
  }

  for (const region of regions) {
    if (region.stable) {
      stableBuffer.push(...region.bufferContent)
    } else if (arraysEqual(region.aContent, region.bContent)) {
      stableBuffer.push(...region.aContent)
    } else {
      flush()
      blocks.push({
        type: "conflict",
        left: region.aContent,
        base: region.oContent,
        right: region.bContent,
      })
    }
  }

  flush()
  return blocks
}

export function splitLines(text: string): string[] {
  if (text === "") return []
  return text.replaceAll("\r\n", "\n").split("\n")
}

export function hasConflicts(left: string, base: string, right: string): boolean {
  return diff3Merge(left, base, right).some((b) => b.type === "conflict")
}

export type LineRange = {
  start: number
  count: number
}

export function changedLineRanges(base: string, other: string): LineRange[] {
  const o = splitLines(base)
  const n = splitLines(other)
  return diffIndices(o, n).map((d) => ({ start: d.buffer2[0], count: d.buffer2[1] }))
}
