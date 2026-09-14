/**
 * OAuth failures arrive as an opaque reason string on the query. Every reason
 * the callback can emit needs copy here, plus `unknown` — an identity provider
 * is free to invent codes we have never seen, and the screen still has to say
 * something true.
 */
export const authDictionary = {
  es: {
    eyebrow: "Iniciar sesión",
    title: "Conserva lo que",
    titleAccent: "practicas.",
    lead: "Todo esto se lee sin cuenta. Iniciar sesión es lo que hace que tu progreso, tu racha y tus retos completados se queden.",
    github: "Continuar con GitHub",
    redirecting: "Redirigiendo a GitHub…",
    redirectingNote: "github.com/login/oauth · volverás a",
    browse: "Explorar sin cuenta",

    storyEyebrow: "Por qué una cuenta",
    storyTitle: "Contribuir es una destreza que se gana",
    storyTitleAccent: "haciéndolo mal primero, en un sitio seguro.",
    storyLead:
      "Repositorios reales, conflictos reales, revisión real. Tu cuenta recuerda cuáles terminaste y en cuál te quedaste a medias.",
    statChallenges: "retos",
    statTracks: "vías",
    statGuides: "guías",

    errorTitle: "El inicio de sesión no se completó",
    errorAccessDenied: "GitHub devolvió {code}. No se guardó nada y no se creó ninguna cuenta.",
    errorExchange:
      "No pudimos canjear el código de GitHub por una sesión. No se guardó nada y no se creó ninguna cuenta.",
    errorUnknown:
      "Algo se torció al volver de GitHub. No se guardó nada y no se creó ninguna cuenta.",
    errorRetry: "Probar otra vez con GitHub",
    errorBrowse: "Seguir explorando sin cuenta",

    welcomeTitle: "Bienvenido,",
    welcomeLead: "Tu cuenta está activa. Se han encendido tres cosas:",
    welcomePointProgress: "Tu progreso y tus rachas se guardan a partir de ahora",
    welcomePointBoard: "Estás en el tablero",
    welcomePointProfile: "Perfil público en",
    welcomeCta: "Empezar tu primer reto",

    signedInWith: "Sesión iniciada con GitHub",
    signedInTitle: "Ya estás dentro.",
    signedInOpen: "Tienes un reto a medias:",
    signedInNone: "No tienes ningún reto a medias.",
    signedInContinue: "Continuar donde lo dejaste",
    signedInGo: "Ir al playground",
    streak: "{count} días de racha",

    signOut: "Cerrar sesión",
    signOutTitle: "¿Cerrar sesión?",
    signOutBody: "Tu progreso está guardado. Puedes volver a iniciar sesión cuando quieras.",
    signOutConfirm: "Cerrar sesión",
    signOutCancel: "Cancelar",
  },
  en: {
    eyebrow: "Sign in",
    title: "Keep what you",
    titleAccent: "practise.",
    lead: "Everything here is readable without an account. Signing in is what makes your progress, streak and completions stick.",
    github: "Continue with GitHub",
    redirecting: "Redirecting to GitHub…",
    redirectingNote: "github.com/login/oauth · you will come back to",
    browse: "Browse without an account",

    storyEyebrow: "Why an account",
    storyTitle: "Contributing is a skill you get by",
    storyTitleAccent: "doing it badly first, somewhere safe.",
    storyLead:
      "Real repositories, real conflicts, real review. Your account remembers which ones you finished and what you were in the middle of.",
    statChallenges: "challenges",
    statTracks: "tracks",
    statGuides: "guides",

    errorTitle: "Sign-in didn't complete",
    errorAccessDenied: "GitHub returned {code}. Nothing was saved and no account was created.",
    errorExchange:
      "We could not exchange GitHub's code for a session. Nothing was saved and no account was created.",
    errorUnknown:
      "Something went wrong on the way back from GitHub. Nothing was saved and no account was created.",
    errorRetry: "Try GitHub again",
    errorBrowse: "Keep browsing without an account",

    welcomeTitle: "Welcome,",
    welcomeLead: "Your account is live. Three things switched on:",
    welcomePointProgress: "Progress and streaks are saved from now on",
    welcomePointBoard: "You're on the leaderboard",
    welcomePointProfile: "Public profile at",
    welcomeCta: "Start your first challenge",

    signedInWith: "Signed in with GitHub",
    signedInTitle: "You're already in.",
    signedInOpen: "One challenge is still open:",
    signedInNone: "You have no challenge in progress.",
    signedInContinue: "Continue where you left off",
    signedInGo: "Go to the playground",
    streak: "{count}-day streak",

    signOut: "Sign out",
    signOutTitle: "Sign out?",
    signOutBody: "Your progress is saved. You can sign back in at any time.",
    signOutConfirm: "Sign out",
    signOutCancel: "Cancel",
  },
} as const

export type AuthLocale = keyof typeof authDictionary
export type AuthDictionary = (typeof authDictionary)[AuthLocale]

export const resolveAuthLocale = (lang: string): AuthLocale =>
  (lang as AuthLocale) in authDictionary ? (lang as AuthLocale) : "es"
