import { ImageResponse } from "next/og"
import { GitGraphLayer, loadOgFonts, OG_HEIGHT, OG_WIDTH } from "@/lib/og-card"
import { appName } from "@/lib/shared"

/**
 * The sitewide card, named by `seoFor` for every route that does not render one
 * of its own — guides and public profiles do, everything else lands here.
 *
 * A route rather than an `opengraph-image.tsx`, and under `/og` rather than
 * beside it: the proxy matcher excludes that prefix, and an extensionless route
 * outside it is rewritten into the `[lang]` catch-all and 404s. The two
 * neighbours here were built this way for the same reason.
 */
export const revalidate = false

/** `SITE_TAGLINE`, broken by hand: Satori wraps on no width of its own here. */
const TAGLINE_LINES: readonly string[] = ["The open guide to building", "software the right way"]

const FACETS: readonly string[] = ["guides", "learning paths", "playground"]

export async function GET(): Promise<ImageResponse> {
  const fonts = await loadOgFonts()

  return new ImageResponse(
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        position: "relative",
        overflow: "hidden",
        background: "#0b0c0e",
        fontFamily: "Geist",
        color: "#eceef1",
        display: "flex",
      }}
    >
      <GitGraphLayer />
      <div
        style={{
          position: "absolute",
          top: -240,
          right: -180,
          width: 900,
          height: 760,
          display: "flex",
          background:
            "radial-gradient(circle at 50% 50%, rgba(85,214,113,.13), rgba(85,214,113,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -320,
          left: -200,
          width: 900,
          height: 700,
          display: "flex",
          background:
            "radial-gradient(circle at 50% 50%, rgba(126,178,255,.07), rgba(126,178,255,0) 60%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: 5,
          background: "#55d671",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: OG_WIDTH,
          height: OG_HEIGHT,
          padding: "68px 72px 62px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg viewBox="0 0 64 64" width={64} height={64} style={{ marginRight: 22 }}>
            <g
              fill="none"
              stroke="#55d671"
              strokeWidth={3.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="10" x2="18" y2="54" />
              <path d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50" />
              <circle cx="18" cy="10" r="3.6" fill="#55d671" />
              <circle cx="40" cy="50" r="3.6" fill="#55d671" />
              <circle cx="18" cy="54" r="3.6" fill="#55d671" />
            </g>
          </svg>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              letterSpacing: "-0.024em",
              color: "#eceef1",
            }}
          >
            {appName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 74,
            fontWeight: 300,
            letterSpacing: "-0.032em",
            lineHeight: 1.14,
            color: "#eceef1",
          }}
        >
          {TAGLINE_LINES.map((line) => (
            // No `display: flex` on the line itself: Satori then lays the words
            // out as flex items and the gaps between them stop being spaces.
            <div key={line}>{line}</div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Geist Mono",
            fontSize: 26,
            color: "#b7bcc4",
          }}
        >
          {FACETS.map((facet, index) => (
            <div key={facet} style={{ display: "flex", alignItems: "center" }}>
              <span>{facet}</span>
              {index < FACETS.length - 1 && (
                <span style={{ color: "#3e444c", padding: "0 14px" }}>·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { width: OG_WIDTH, height: OG_HEIGHT, fonts }
  )
}
