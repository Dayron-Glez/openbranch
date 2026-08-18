import type { PlaygroundDict } from "@/lib/playground-dictionary"

/**
 * Copy for the public profile.
 *
 * Flat `{ es, en }` entries assembled by `tx`, following
 * lib/playground-dictionary.ts rather than the side-by-side locale objects of
 * dictionaries/paths.ts. With two locales holding identical key structures,
 * the side-by-side form is half duplicated lines by construction — the flat
 * form keeps both translations of a string on one line instead.
 *
 * It carries its own `stats` block, in `PlaygroundDict["stats"]`'s shape so
 * `StatsStrip` takes it unchanged, because every string in the playground's is
 * addressed to the person who earned the numbers: "Tu progreso", "completaste
 * uno hoy", "Récord personal". On a page about someone else those are wrong,
 * and a stranger reading them is the whole failure mode.
 */

type LocalizedEntry = { readonly es: string; readonly en: string }
type Lang = keyof LocalizedEntry

const translations = {
  "meta.title": { es: "{username} · openbranch", en: "{username} · openbranch" },
  "meta.description": {
    es: "Lo que {username} ha leído y practicado en openbranch.",
    en: "What {username} has read and practised on openbranch.",
  },
  "id.memberSince": { es: "En openbranch desde {date}", en: "On openbranch since {date}" },
  "id.memberSinceUnknown": { es: "En openbranch", en: "On openbranch" },
  "id.seeOnLeaderboard": { es: "Ver en el leaderboard", en: "See on the leaderboard" },

  "rank.starting": { es: "Empezando", en: "Getting started" },
  "rank.topPercent": { es: "Top {percent}%", en: "Top {percent}%" },
  "rank.number": { es: "#{rank}", en: "#{rank}" },

  "paths.heading": { es: "Rutas recorridas", en: "Paths completed" },
  "paths.emptyTitle": { es: "Ninguna ruta recorrida todavía", en: "No paths completed yet" },
  "paths.emptyBody": {
    es: "Las rutas terminadas aparecerán aquí — una lectura y su reto, de principio a fin.",
    en: "Finished paths show up here — a guide and its challenge, end to end.",
  },

  "activity.heading": { es: "Actividad reciente", en: "Recent activity" },
  "activity.caption": {
    es: "Los {count} más recientes · el historial completo no vive en el perfil",
    en: "The {count} most recent · the full history does not live on the profile",
  },
  "activity.emptyTitle": { es: "Sin retos completados todavía", en: "No challenges completed yet" },
  "activity.emptyBody": {
    es: "El primer reto resuelto aparecerá aquí.",
    en: "The first solved challenge shows up here.",
  },
  "activity.first": {
    es: "Empieza a aparecer con el primer reto resuelto",
    en: "Starts filling in with the first solved challenge",
  },
  "activity.today": { es: "hoy", en: "today" },
  "activity.unknownDate": { es: "hace tiempo", en: "a while ago" },

  // Sub-line under the completed count — a record, never a nudge.
  "completed.all": { es: "El catálogo entero", en: "The whole catalogue" },
  "completed.inTracks": { es: "En {tracks}", en: "Across {tracks}" },
  "completed.none": { es: "Todavía sin retos", en: "No challenges yet" },

  "stats.eyebrow": { es: "Resumen", en: "Summary" },
  "stats.points": { es: "Puntos", en: "Points" },
  "stats.pointsToday": { es: "+{points} hoy", en: "+{points} today" },
  "stats.acrossTracksSingular": { es: "En 1 track", en: "Across 1 track" },
  "stats.acrossTracksPlural": { es: "En {count} tracks", en: "Across {count} tracks" },
  "stats.streak": { es: "Racha actual", en: "Current streak" },
  "stats.days": { es: "días", en: "days" },
  "stats.of": { es: "de {total}", en: "of {total}" },
  "stats.streakAlive": { es: "Viva", en: "Alive" },
  "stats.streakBroken": { es: "Terminó el {date}", en: "Ended {date}" },
  "stats.streakFirst": { es: "Todavía sin racha", en: "No streak yet" },
  "stats.completed": { es: "Completados", en: "Completed" },
  "stats.nextUp": { es: "Siguiente: track de {track}", en: "Next up: {track} track" },
  "stats.allTracksStarted": { es: "Todos los tracks empezados", en: "All tracks started" },
  "stats.best": { es: "Mejor racha", en: "Best streak" },
  "stats.bestNote": { es: "Su récord", en: "Their best" },

  // Share button — see features/profiles/components/ShareProfileButton.tsx
  "share.label": { es: "Compartir perfil", en: "Share profile" },
  "share.copied": { es: "Copiado", en: "Copied" },
  "share.text": {
    es: "El progreso de {username} en openbranch",
    en: "{username}'s progress on openbranch",
  },
} satisfies Record<string, LocalizedEntry>

export type ProfileDict = {
  readonly metaTitle: (username: string) => string
  readonly metaDescription: (username: string) => string
  readonly memberSince: (date: string) => string
  readonly memberSinceUnknown: string
  readonly seeOnLeaderboard: string
  readonly shareLabel: string
  readonly shareCopied: string
  readonly shareText: (username: string) => string
  readonly rankStarting: string
  readonly rankTopPercent: (percent: number) => string
  readonly rankNumber: (rank: number) => string
  readonly pathsHeading: string
  readonly pathsEmptyTitle: string
  readonly pathsEmptyBody: string
  readonly activityHeading: string
  readonly activityCaption: (count: number) => string
  readonly activityEmptyTitle: string
  readonly activityEmptyBody: string
  readonly activityFirst: string
  readonly activityPoints: (points: number) => string
  readonly today: string
  readonly unknownDate: string
  readonly completedAll: string
  readonly completedInTracks: (tracks: string) => string
  readonly completedNone: string
  /** Same shape as the playground's, third person throughout. */
  readonly stats: PlaygroundDict["stats"]
}

export const getProfileDict = (lang: string): ProfileDict => {
  const locale: Lang = lang === "en" ? "en" : "es"
  const tx = (key: keyof typeof translations): string => translations[key][locale]

  return {
    metaTitle: (username: string): string => tx("meta.title").replace("{username}", username),
    metaDescription: (username: string): string =>
      tx("meta.description").replace("{username}", username),
    memberSince: (date: string): string => tx("id.memberSince").replace("{date}", date),
    memberSinceUnknown: tx("id.memberSinceUnknown"),
    seeOnLeaderboard: tx("id.seeOnLeaderboard"),
    shareLabel: tx("share.label"),
    shareCopied: tx("share.copied"),
    shareText: (username: string): string => tx("share.text").replace("{username}", username),
    rankStarting: tx("rank.starting"),
    rankTopPercent: (percent: number): string =>
      tx("rank.topPercent").replace("{percent}", String(percent)),
    rankNumber: (rank: number): string => tx("rank.number").replace("{rank}", String(rank)),
    pathsHeading: tx("paths.heading"),
    pathsEmptyTitle: tx("paths.emptyTitle"),
    pathsEmptyBody: tx("paths.emptyBody"),
    activityHeading: tx("activity.heading"),
    activityCaption: (count: number): string =>
      tx("activity.caption").replace("{count}", String(count)),
    activityEmptyTitle: tx("activity.emptyTitle"),
    activityEmptyBody: tx("activity.emptyBody"),
    activityFirst: tx("activity.first"),
    activityPoints: (points: number): string => `+${points}`,
    today: tx("activity.today"),
    unknownDate: tx("activity.unknownDate"),
    completedAll: tx("completed.all"),
    completedInTracks: (tracks: string): string =>
      tx("completed.inTracks").replace("{tracks}", tracks),
    completedNone: tx("completed.none"),
    stats: {
      eyebrow: tx("stats.eyebrow"),
      points: tx("stats.points"),
      pointsToday: tx("stats.pointsToday"),
      acrossTracksSingular: tx("stats.acrossTracksSingular"),
      acrossTracksPlural: tx("stats.acrossTracksPlural"),
      streak: tx("stats.streak"),
      days: tx("stats.days"),
      of: tx("stats.of"),
      streakAlive: tx("stats.streakAlive"),
      streakBroken: tx("stats.streakBroken"),
      streakFirst: tx("stats.streakFirst"),
      completed: tx("stats.completed"),
      nextUp: tx("stats.nextUp"),
      allTracksStarted: tx("stats.allTracksStarted"),
      best: tx("stats.best"),
      bestNote: tx("stats.bestNote"),
    },
  }
}
