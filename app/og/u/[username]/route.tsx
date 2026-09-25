import { notFound } from "next/navigation"
import { ImageResponse } from "next/og"
import { GitGraphLayer, loadOgFonts, OG_HEIGHT, OG_WIDTH } from "@/lib/og-card"
import { createClient } from "@/lib/supabase/server"
import { playgroundSource } from "@/lib/playground-source"
import { CATEGORY_ORDER, type CategoryKey } from "@/features/playground/domain/manifest"
import { getAllPaths } from "@/features/paths/server/path-catalog"
import { flattenSteps } from "@/features/paths/domain/paths"
import { isStepDone } from "@/features/paths/domain/path-status"
import {
  getProfileActivityAndBadges,
  getProfileOverview,
  getProfilePathProgress,
  getProfileRank,
  type ProfileOverview,
  type ProfileRank,
} from "@/features/profiles/server/profile-service"

export const revalidate = 3600

const EXACT_RANK_LIMIT = 100
const AVATAR_FETCH_TIMEOUT_MS = 2000

/**
 * Literal transcriptions of `--color-track-*` (app/global.css): Satori accepts
 * neither oklch() nor var(), so the hues are hardcoded to hex.
 */
const TRACK_HEX: Record<CategoryKey, string> = {
  git: "#7eb2ff",
  "code-review": "#da93ff",
  testing: "#00d9db",
  documentation: "#ff82c7",
  "bug-fix": "#ff8f3b",
}

const hexToRgb = (hex: string): string => {
  const value = Number.parseInt(hex.slice(1), 16)
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`
}

/** Same fallback as ProfileHeader's, so an avatar-less card reads the same. */
const getInitials = (username: string): string => username.slice(0, 2).toUpperCase()

/**
 * Fetched as a data URI so a slow or failing host cannot fail the whole
 * ImageResponse: there is no browser here to let an <img> fail natively, so it
 * has to be handled before the JSX tree is built at all.
 */
const loadAvatarDataUri = async (avatarUrl: string | null): Promise<string | null> => {
  if (avatarUrl === null) return null
  try {
    const response = await fetch(avatarUrl, {
      signal: AbortSignal.timeout(AVATAR_FETCH_TIMEOUT_MS),
    })
    if (!response.ok) return null
    const contentType = response.headers.get("content-type") ?? "image/png"
    const bytes = Buffer.from(await response.arrayBuffer())
    return `data:${contentType};base64,${bytes.toString("base64")}`
  } catch {
    return null
  }
}

const formatMemberSince = (isoDate: string): string =>
  new Intl.DateTimeFormat("es", { month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(isoDate)
  )

const formatRoutesMeta = (completedRouteCount: number): string | null => {
  if (completedRouteCount === 0) return null
  return completedRouteCount === 1 ? "1 ruta recorrida" : `${completedRouteCount} rutas recorridas`
}

/** >18 chars steps to 42px, >28 to 34px — never ellipsis (handoff §07). */
const usernameFontSize = (username: string): number => {
  if (username.length > 28) return 34
  if (username.length > 18) return 42
  return 52
}

type StripCell = {
  readonly label: string
  readonly state: "done" | "next" | "pending"
  readonly track: CategoryKey
}

/** Hardcoded because plain `toUpperCase()` overflows the 126px cell. */
const STRIP_LABEL: Record<CategoryKey, string> = {
  git: "GIT",
  "code-review": "REVIEW",
  testing: "TEST",
  documentation: "DOCS",
  "bug-fix": "BUG",
}

const buildStripCells = (
  challengeSlugs: readonly { readonly slug: string; readonly track: CategoryKey }[],
  completedSlugs: ReadonlySet<string>,
  nextTrack: CategoryKey | null
): readonly StripCell[] => {
  let nextCellAssigned = false
  return challengeSlugs.map(({ slug, track }) => {
    const done = completedSlugs.has(slug)
    const label = STRIP_LABEL[track]
    if (done) return { label, state: "done", track }
    if (!nextCellAssigned && track === nextTrack) {
      nextCellAssigned = true
      return { label, state: "next", track }
    }
    return { label, state: "pending", track }
  })
}

const Cell = ({ cell, isLast }: { readonly cell: StripCell; readonly isLast: boolean }) => {
  const base = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 126,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "solid",
    fontFamily: "Geist Mono",
    fontSize: 19,
    letterSpacing: "0.06em",
    marginRight: isLast ? 0 : 12,
  } as const

  if (cell.state === "done") {
    const rgb = hexToRgb(TRACK_HEX[cell.track])
    return (
      <div
        style={{
          ...base,
          borderColor: `rgba(${rgb},.35)`,
          background: `rgba(${rgb},.15)`,
          color: TRACK_HEX[cell.track],
        }}
      >
        {cell.label}
      </div>
    )
  }

  if (cell.state === "next") {
    return (
      <div style={{ ...base, borderColor: "#55d671", background: "#14171b", color: "#eceef1" }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "#55d671",
            marginRight: 10,
          }}
        />
        {cell.label}
      </div>
    )
  }

  return (
    <div style={{ ...base, borderColor: "#1f2328", background: "#0f1114", color: "#3e444c" }}>
      {cell.label}
    </div>
  )
}

const GhostMark = ({ muted }: { readonly muted: boolean }) => (
  <svg
    viewBox="0 0 64 64"
    width={214}
    height={214}
    style={{ position: "absolute", top: 116, right: 72 }}
  >
    <g fill="none" stroke="#2a323c" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="10" x2="18" y2="54" />
      <path d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50" />
      <circle cx="18" cy="10" r="3.6" fill="#2a323c" />
      <circle
        cx="40"
        cy="50"
        r="3.6"
        fill={muted ? "#2a323c" : "rgba(85,214,113,.45)"}
        stroke="none"
      />
      <circle cx="18" cy="54" r="3.6" fill="#2a323c" />
    </g>
  </svg>
)

type Headline = { readonly digit: number; readonly label: string }

const resolveHeadline = (
  completedCount: number,
  totalChallenges: number,
  sparse: boolean
): Headline => {
  if (sparse) return { digit: totalChallenges, label: "retos por delante" }
  if (completedCount >= totalChallenges && totalChallenges > 0) {
    return { digit: completedCount, label: "catálogo completo" }
  }
  return { digit: completedCount, label: `de ${totalChallenges} retos completados` }
}

type RankChip = { readonly text: string; readonly accent: boolean }

const resolveRankChip = (rank: ProfileRank | null): RankChip => {
  if (rank === null || rank.totalRanked === 0) {
    return { text: "Empezando", accent: false }
  }
  if (rank.rank <= EXACT_RANK_LIMIT) {
    return { text: `#${rank.rank} en openbranch`, accent: true }
  }
  const percentile = Math.max(1, Math.ceil((rank.rank / rank.totalRanked) * 100))
  return { text: `Top ${percentile}%`, accent: false }
}

type MetaPart = string | { readonly text: string; readonly accent: boolean }

const buildMetaParts = (
  overview: ProfileOverview,
  completedRouteCount: number,
  sparse: boolean
): readonly MetaPart[] => {
  if (sparse) {
    const joinedNote =
      overview.memberSince === null ? null : `se unió en ${formatMemberSince(overview.memberSince)}`
    const parts: readonly (MetaPart | null)[] = ["ninguno completado todavía", joinedNote]
    return parts.filter((part): part is MetaPart => part !== null)
  }

  const pointsPart =
    overview.totalPoints > 0 ? { text: `${overview.totalPoints} puntos`, accent: true } : null
  return [
    pointsPart,
    `racha ${overview.currentStreak}`,
    formatRoutesMeta(completedRouteCount),
  ].filter((part): part is MetaPart => part !== null)
}

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/u/[username]">
): Promise<ImageResponse> {
  const { username } = await params
  const supabase = await createClient()

  const overview = await getProfileOverview(supabase, username)
  if (overview === null) notFound()

  const paths = getAllPaths("es")
  const [{ activity }, rank, pathProgress, fonts] = await Promise.all([
    getProfileActivityAndBadges(supabase, username),
    getProfileRank(supabase, username),
    getProfilePathProgress(supabase, username, paths),
    loadOgFonts(),
  ])

  const avatarDataUri = await loadAvatarDataUri(overview.avatarUrl)

  const stableChallenges = playgroundSource
    .getPages("es")
    .filter((page) => page.data.maturity === "stable")
  const totalChallenges = stableChallenges.length

  const completedCategories = new Set(
    CATEGORY_ORDER.filter((category) => activity.some((entry) => entry.category === category))
  )
  const nextTrack = CATEGORY_ORDER.find((category) => !completedCategories.has(category)) ?? null

  const completedSlugs = new Set(activity.map((entry) => entry.challengeSlug))
  const stripCells = buildStripCells(
    stableChallenges.map((page) => ({ slug: page.slugs[0], track: page.data.category })),
    completedSlugs,
    nextTrack
  )

  const completedRouteCount = paths.filter((learningPath) => {
    const steps = flattenSteps(learningPath)
    return steps.length > 0 && steps.every((step) => isStepDone(step, pathProgress))
  }).length

  const sparse = overview.completedCount === 0
  const { digit: headlineDigit, label: headlineLabel } = resolveHeadline(
    overview.completedCount,
    totalChallenges,
    sparse
  )
  const rankChip = resolveRankChip(rank)
  const metaParts = buildMetaParts(overview, completedRouteCount, sparse)

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
          top: -63,
          left: 504,
          width: 480,
          height: 756,
          display: "flex",
          background:
            "radial-gradient(ellipse 50% 60% at center, rgba(85,214,113,.06), rgba(85,214,113,0) 70%)",
        }}
      />

      {!sparse && (
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -160,
            width: 900,
            height: 760,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 50%, rgba(85,214,113,.13), rgba(85,214,113,0) 62%)",
          }}
        />
      )}
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

      <GhostMark muted={sparse} />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_WIDTH,
          height: 5,
          background: sparse ? "#2a2f36" : "#55d671",
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
          padding: "60px 72px 58px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            width: 1056,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: "#2a2f36",
                background: "#14171b",
                fontFamily: "Geist Mono",
                fontSize: 34,
                color: "#b7bcc4",
                marginRight: 26,
                overflow: "hidden",
              }}
            >
              {avatarDataUri !== null ? (
                <img
                  src={avatarDataUri}
                  alt=""
                  width={100}
                  height={100}
                  style={{ borderRadius: 999 }}
                />
              ) : (
                getInitials(overview.username)
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: usernameFontSize(overview.username),
                  fontWeight: 600,
                  letterSpacing: "-0.022em",
                  lineHeight: 1.04,
                  color: "#eceef1",
                }}
              >
                {overview.username}
              </div>
              <div
                style={{
                  fontFamily: "Geist Mono",
                  fontSize: 22,
                  color: "#6f7681",
                  marginTop: 9,
                }}
              >
                {`github.com/${overview.username}`}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#eceef1",
            }}
          >
            openbranch
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", width: 1056 }}>
          <div
            style={{
              width: 200,
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 300,
              fontWeight: 300,
              letterSpacing: "-0.055em",
              lineHeight: 0.74,
              color: sparse ? "#b7bcc4" : "#55d671",
            }}
          >
            {headlineDigit}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              marginLeft: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                width: 822,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "#eceef1",
                }}
              >
                {headlineLabel}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "Geist Mono",
                  fontSize: rankChip.accent ? 30 : 26,
                  padding: "12px 26px",
                  borderRadius: 999,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: rankChip.accent ? "rgba(85,214,113,.35)" : "#2a2f36",
                  background: rankChip.accent ? "rgba(85,214,113,.15)" : "#111316",
                  color: rankChip.accent ? "#55d671" : "#6f7681",
                  flexShrink: 0,
                  marginLeft: 24,
                }}
              >
                {rankChip.text}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              {stripCells.map((cell, index) => (
                <Cell
                  key={cell.label + index}
                  cell={cell}
                  isLast={index === stripCells.length - 1}
                />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontFamily: "Geist Mono",
                fontSize: 25,
                color: "#b7bcc4",
                marginTop: 24,
              }}
            >
              {metaParts.map((part, index) => {
                const text = typeof part === "string" ? part : part.text
                return (
                  <div key={text} style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: typeof part === "string" ? "#b7bcc4" : "#55d671" }}>
                      {text}
                    </span>
                    {index < metaParts.length - 1 && (
                      <span style={{ color: "#3e444c", padding: "0 13px" }}>·</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>,
    { width: OG_WIDTH, height: OG_HEIGHT, fonts }
  )
}
