import fs from "node:fs/promises"
import path from "node:path"

/**
 * The canvas every social card shares. 1200×630 is what LinkedIn, X and Slack
 * all crop against; anything else gets letterboxed by at least one of them.
 */
export const OG_WIDTH = 1200
export const OG_HEIGHT = 630

const fontDir = path.join(process.cwd(), "assets", "fonts", "og")

export type OgFont = {
  readonly name: string
  readonly data: Buffer
  readonly weight: 300 | 400 | 600
}

/**
 * Satori resolves no webfonts of its own, so the three faces the cards use are
 * read off disk and handed to `ImageResponse` explicitly.
 */
export const loadOgFonts = async (): Promise<OgFont[]> => {
  const [light, semiBold, mono] = await Promise.all([
    fs.readFile(path.join(fontDir, "Geist-Light.ttf")),
    fs.readFile(path.join(fontDir, "Geist-SemiBold.ttf")),
    fs.readFile(path.join(fontDir, "GeistMono-Regular.ttf")),
  ])
  return [
    { name: "Geist", data: light, weight: 300 },
    { name: "Geist", data: semiBold, weight: 600 },
    { name: "Geist Mono", data: mono, weight: 400 },
  ]
}

/** Vertical "streets" of the git graph. */
const GRAPH_STREETS: readonly { readonly x: number; readonly y1: number; readonly y2: number }[] = [
  { x: 100, y1: 38, y2: 592 },
  { x: 250, y1: 60, y2: 560 },
  { x: 420, y1: 44, y2: 580 },
  { x: 600, y1: 70, y2: 548 },
  { x: 780, y1: 52, y2: 570 },
  { x: 950, y1: 44, y2: 592 },
  { x: 1110, y1: 70, y2: 560 },
]

const GRAPH_ARCS: readonly string[] = [
  "M100 200 C 100 162, 210 162, 250 200",
  "M250 340 C 250 378, 380 378, 420 340",
  "M420 452 C 420 414, 560 414, 600 452",
  "M600 240 C 600 278, 740 278, 780 240",
  "M780 390 C 780 352, 910 352, 950 390",
  "M950 150 C 950 112, 1070 112, 1110 150",
]

/** Three per street; the accent one marks the "active" commit. */
const GRAPH_NODES: readonly {
  readonly cx: number
  readonly cy: number
  readonly accent: boolean
}[] = [
  { cx: 100, cy: 126, accent: false },
  { cx: 100, cy: 328, accent: false },
  { cx: 100, cy: 478, accent: true },
  { cx: 250, cy: 138, accent: false },
  { cx: 250, cy: 277, accent: false },
  { cx: 250, cy: 454, accent: false },
  { cx: 420, cy: 113, accent: false },
  { cx: 420, cy: 265, accent: true },
  { cx: 420, cy: 491, accent: false },
  { cx: 600, cy: 164, accent: false },
  { cx: 600, cy: 315, accent: false },
  { cx: 600, cy: 479, accent: false },
  { cx: 780, cy: 138, accent: false },
  { cx: 780, cy: 315, accent: true },
  { cx: 780, cy: 504, accent: false },
  { cx: 950, cy: 113, accent: false },
  { cx: 950, cy: 290, accent: false },
  { cx: 950, cy: 491, accent: false },
  { cx: 1110, cy: 151, accent: false },
  { cx: 1110, cy: 340, accent: false },
  { cx: 1110, cy: 504, accent: true },
]

/**
 * `AmbientBackground`'s git graph with its `prefers-reduced-motion` end-state
 * baked in — there is no motion in a rendered image. The viewBox is rewritten
 * to the card’s own 1200×630 rather than relying on Satori's
 * `preserveAspectRatio="slice"`.
 */
export const GitGraphLayer = () => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      display: "flex",
      color: "rgba(183,188,196,.10)",
      maskImage: "radial-gradient(ellipse 90% 70% at 50% 50%, black 30%, transparent 80%)",
    }}
  >
    <svg width={OG_WIDTH} height={OG_HEIGHT} viewBox="0 0 1200 630">
      {GRAPH_STREETS.map((street) => (
        <path
          key={`street-${street.x}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={`M${street.x} ${street.y1} L ${street.x} ${street.y2}`}
        />
      ))}
      {GRAPH_ARCS.map((arc) => (
        <path
          key={arc}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d={arc}
        />
      ))}
      {GRAPH_NODES.map((node) => (
        <circle
          key={`${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={3}
          opacity={0.7}
          fill={node.accent ? "#55d671" : "currentColor"}
        />
      ))}
    </svg>
  </div>
)
