/**
 * Copy for the public profile.
 *
 * It carries its own `stats` block rather than reusing the playground's,
 * because every string there is addressed to the person who earned the
 * numbers: "Tu progreso", "completaste uno hoy", "Récord personal". On a page
 * about someone else those are wrong, and a stranger reading them is the whole
 * failure mode. Same shape as `PlaygroundDict["stats"]` so `StatsStrip` takes
 * it unchanged.
 */
export const profileDictionary = {
  es: {
    metaTitle: (username: string): string => `${username} · openbranch`,
    metaDescription: (username: string): string =>
      `Lo que ${username} ha leído y practicado en openbranch.`,
    memberSince: (date: string): string => `En openbranch desde ${date}`,
    memberSinceUnknown: "En openbranch",
    seeOnLeaderboard: "Ver en el leaderboard",
    rankStarting: "Empezando",
    rankTopPercent: (percent: number): string => `Top ${percent}%`,
    rankNumber: (rank: number): string => `#${rank}`,
    pathsHeading: "Rutas recorridas",
    pathsEmptyTitle: "Ninguna ruta recorrida todavía",
    pathsEmptyBody:
      "Las rutas terminadas aparecerán aquí — una lectura y su reto, de principio a fin.",
    activityHeading: "Actividad reciente",
    activityCaption: (count: number): string =>
      `Los ${count} más recientes · el historial completo no vive en el perfil`,
    activityEmptyTitle: "Sin retos completados todavía",
    activityEmptyBody: "El primer reto resuelto aparecerá aquí.",
    activityFirst: "Empieza a aparecer con el primer reto resuelto",
    activityPoints: (points: number): string => `+${points}`,
    today: "hoy",
    unknownDate: "hace tiempo",
    /** Same shape as PlaygroundDict["stats"], third person throughout. */
    stats: {
      eyebrow: "Resumen",
      points: "Puntos",
      pointsToday: "+{points} hoy",
      acrossTracksSingular: "En 1 track",
      acrossTracksPlural: "En {count} tracks",
      streak: "Racha actual",
      days: "días",
      of: "de {total}",
      streakAlive: "Viva",
      streakBroken: "Terminó el {date}",
      streakFirst: "Todavía sin racha",
      completed: "Completados",
      nextUp: "Siguiente: track de {track}",
      allTracksStarted: "Todos los tracks empezados",
      best: "Mejor racha",
      bestNote: "Su récord",
    },
    /** Sub-line under the completed count — a record, not a nudge. */
    completedAll: "El catálogo entero",
    completedInTracks: (tracks: string): string => `En ${tracks}`,
    completedNone: "Todavía sin retos",
  },
  en: {
    metaTitle: (username: string): string => `${username} · openbranch`,
    metaDescription: (username: string): string =>
      `What ${username} has read and practised on openbranch.`,
    memberSince: (date: string): string => `On openbranch since ${date}`,
    memberSinceUnknown: "On openbranch",
    seeOnLeaderboard: "See on the leaderboard",
    rankStarting: "Getting started",
    rankTopPercent: (percent: number): string => `Top ${percent}%`,
    rankNumber: (rank: number): string => `#${rank}`,
    pathsHeading: "Paths completed",
    pathsEmptyTitle: "No paths completed yet",
    pathsEmptyBody: "Finished paths show up here — a guide and its challenge, end to end.",
    activityHeading: "Recent activity",
    activityCaption: (count: number): string =>
      `The ${count} most recent · the full history does not live on the profile`,
    activityEmptyTitle: "No challenges completed yet",
    activityEmptyBody: "The first solved challenge shows up here.",
    activityFirst: "Starts filling in with the first solved challenge",
    activityPoints: (points: number): string => `+${points}`,
    today: "today",
    unknownDate: "a while ago",
    stats: {
      eyebrow: "Summary",
      points: "Points",
      pointsToday: "+{points} today",
      acrossTracksSingular: "Across 1 track",
      acrossTracksPlural: "Across {count} tracks",
      streak: "Current streak",
      days: "days",
      of: "of {total}",
      streakAlive: "Alive",
      streakBroken: "Ended {date}",
      streakFirst: "No streak yet",
      completed: "Completed",
      nextUp: "Next up: {track} track",
      allTracksStarted: "All tracks started",
      best: "Best streak",
      bestNote: "Their best",
    },
    completedAll: "The whole catalogue",
    completedInTracks: (tracks: string): string => `Across ${tracks}`,
    completedNone: "No challenges yet",
  },
} as const

export type ProfileLocale = keyof typeof profileDictionary
export type ProfileDictionary = (typeof profileDictionary)[ProfileLocale]

export const resolveProfileLocale = (lang: string): ProfileLocale =>
  (lang as ProfileLocale) in profileDictionary ? (lang as ProfileLocale) : "es"
