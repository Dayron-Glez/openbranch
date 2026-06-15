import type { Lang } from "./landing-dictionary"

export type PlaygroundDict = {
  readonly meta: {
    readonly title: string
    readonly description: string
  }
  readonly detail: {
    readonly back: string
    readonly startChallenge: string
    readonly sandboxNote: string
    readonly metaCategory: string
    readonly metaDifficulty: string
    readonly metaTime: string
    readonly metaValidation: string
    readonly youllPractice: string
    readonly recommendedFirst: string
    readonly authTitle: string
    readonly authBody: string
    readonly authGithub: string
    readonly authPrivacyStrong: string
    readonly authPrivacyRest: string
    readonly signOut: string
    readonly signOutTitle: string
    readonly signOutBody: string
    readonly signOutConfirm: string
    readonly signOutCancel: string
  }
  readonly hub: {
    readonly eyebrow: string
    readonly heading: string
    readonly headingAccent: string
    readonly intro: string
    readonly startCta: string
    readonly continueCta: string
    readonly filterAll: string
    readonly sort: {
      readonly label: string
      readonly recommended: string
      readonly difficulty: string
      readonly duration: string
      readonly sortAsc: string
      readonly sortDesc: string
    }
  }
  readonly startingLine: {
    readonly eyebrow: string
    readonly heading: string
    readonly body: string
    readonly cta: string
  }
  readonly difficulty: {
    readonly beginner: string
    readonly moderate: string
    readonly demanding: string
  }
  readonly category: {
    readonly "code-review": string
    readonly "bug-fix": string
    readonly testing: string
    readonly git: string
    readonly documentation: string
  }
  readonly status: {
    readonly notStarted: string
    readonly inProgress: string
    readonly completed: string
  }
  readonly badges: {
    readonly heading: string
    readonly lockMessage: string
    readonly "first-merge": { readonly name: string; readonly description: string }
    readonly "review-corps": { readonly name: string; readonly description: string }
    readonly "coverage-hero": { readonly name: string; readonly description: string }
    readonly "ship-it": { readonly name: string; readonly description: string }
    readonly "streak-7": { readonly name: string; readonly description: string }
    readonly "all-tracks": { readonly name: string; readonly description: string }
  }
  readonly time: {
    readonly minutes: string
  }
}

type LocalizedEntry = { readonly es: string; readonly en: string }

const translations = {
  "meta.title": { es: "Playground · openbranch", en: "Playground · openbranch" },
  "meta.description": {
    es: "Practica flujos de trabajo open source en un entorno aislado. Sin ramas reales, sin PRs, sin consecuencias.",
    en: "Practice open source workflows in an isolated sandbox. No real branches, no PRs, no consequences.",
  },
  "hub.eyebrow": { es: "aprende haciendo", en: "learn by doing" },
  "hub.heading": { es: "Practica como si fuera", en: "Practice like it's" },
  "hub.headingAccent": { es: "producción — sin el riesgo.", en: "production — without the risk." },
  "hub.intro": {
    es: "Cada reto es un sandbox aislado. Corriges bugs reales, revisas PRs reales y escribes tests reales. Nada sale del playground.",
    en: "Every challenge is an isolated sandbox. You fix real bugs, review real PRs, and write real tests. Nothing leaves the playground.",
  },
  "hub.startCta": { es: "Empezar reto", en: "Start challenge" },
  "hub.continueCta": { es: "Continuar", en: "Continue" },
  "hub.filterAll": { es: "Todos", en: "All" },
  "hub.sort.label": { es: "Ordenar:", en: "Sort:" },
  "hub.sort.recommended": { es: "Recomendados", en: "Recommended" },
  "hub.sort.difficulty": { es: "Dificultad", en: "Difficulty" },
  "hub.sort.duration": { es: "Duración", en: "Duration" },
  "hub.sort.sortAsc": { es: "Ordenar ascendente", en: "Sort ascending" },
  "hub.sort.sortDesc": { es: "Ordenar descendente", en: "Sort descending" },
  "startingLine.eyebrow": { es: "línea de salida", en: "starting line" },
  "startingLine.heading": {
    es: "Tu primera rama empieza aquí.",
    en: "Your first branch starts here.",
  },
  "startingLine.body": {
    es: "{count} retos. Cada uno te mete en un repositorio real — sin teoría, solo el flujo de trabajo. Te recomendamos empezar con algo accesible.",
    en: "{count} challenges. Each one drops you into a real repository — no theory, just the workflow. We suggest starting with something gentle.",
  },
  "startingLine.cta": { es: "Empezar el primer reto", en: "Start first challenge" },
  "difficulty.beginner": { es: "principiante", en: "beginner" },
  "difficulty.moderate": { es: "moderado", en: "moderate" },
  "difficulty.demanding": { es: "exigente", en: "demanding" },
  "category.code-review": { es: "Revisión de código", en: "Code Review" },
  "category.bug-fix": { es: "Corrección de bugs", en: "Bug Fix" },
  "category.testing": { es: "Testing", en: "Testing" },
  "category.git": { es: "Git", en: "Git" },
  "category.documentation": { es: "Documentación", en: "Documentation" },
  "status.notStarted": { es: "Sin empezar", en: "Not started" },
  "status.inProgress": { es: "En progreso", en: "In progress" },
  "status.completed": { es: "Completado", en: "Completed" },
  "badges.heading": { es: "Badges", en: "Badges" },
  "badges.lockMessage": {
    es: "Completa retos para desbloquear badges. Cada uno marca una habilidad ganada, no solo una casilla marcada.",
    en: "Complete challenges to unlock badges. Each one marks a skill earned, not just a box ticked.",
  },
  "badges.first-merge.name": { es: "First Merge", en: "First Merge" },
  "badges.first-merge.description": {
    es: "Resolviste tu primer conflicto de merge",
    en: "Resolved your first merge conflict",
  },
  "badges.review-corps.name": { es: "Review Corps", en: "Review Corps" },
  "badges.review-corps.description": {
    es: "Completaste una revisión de código",
    en: "Completed a code review",
  },
  "badges.coverage-hero.name": { es: "Coverage Hero", en: "Coverage Hero" },
  "badges.coverage-hero.description": {
    es: "Escribiste tests que protegen el comportamiento",
    en: "Wrote tests that lock in behavior",
  },
  "badges.ship-it.name": { es: "Ship It", en: "Ship It" },
  "badges.ship-it.description": {
    es: "Encontraste y corregiste un bug real",
    en: "Found and fixed a real bug",
  },
  "badges.streak-7.name": { es: "7-Day Streak", en: "7-Day Streak" },
  "badges.streak-7.description": {
    es: "Practicaste 7 días seguidos",
    en: "Practiced 7 days in a row",
  },
  "badges.all-tracks.name": { es: "All Tracks", en: "All Tracks" },
  "badges.all-tracks.description": {
    es: "Completaste un reto en cada categoría",
    en: "Completed a challenge in every category",
  },
  "time.minutes": { es: "min", en: "min" },
  "detail.back": { es: "Volver al playground", en: "Back to all challenges" },
  "detail.startChallenge": { es: "Empezar reto", en: "Start challenge" },
  "detail.sandboxNote": {
    es: "Crea un sandbox privado · nada es público",
    en: "Forks a sandbox repo · nothing is public",
  },
  "detail.metaCategory": { es: "Categoría", en: "Category" },
  "detail.metaDifficulty": { es: "Dificultad", en: "Difficulty" },
  "detail.metaTime": { es: "Tiempo estimado", en: "Estimated time" },
  "detail.metaValidation": { es: "Validación", en: "Validation" },
  "detail.youllPractice": { es: "Practicarás", en: "You'll practice" },
  "detail.recommendedFirst": { es: "Recomendado primero", en: "Recommended first" },
  "detail.authTitle": { es: "Inicia sesión para empezar", en: "Sign in to start" },
  "detail.authBody": {
    es: "Los retos corren en un sandbox privado — tu progreso se guarda y nada se publica nunca.",
    en: "Challenges run in a private sandbox — your progress is saved, and nothing is ever posted publicly.",
  },
  "detail.authGithub": { es: "Continuar con GitHub", en: "Continue with GitHub" },
  "detail.authPrivacyStrong": {
    es: "No se solicita acceso al repositorio",
    en: "No repository access requested",
  },
  "detail.authPrivacyRest": {
    es: "— solo identidad. Leemos tu nombre de usuario para asociar tu progreso. Eso es todo.",
    en: "— identity only. We read your username to associate your progress. That's all.",
  },
  "detail.signOut": { es: "Cerrar sesión", en: "Sign out" },
  "detail.signOutTitle": { es: "¿Cerrar sesión?", en: "Sign out?" },
  "detail.signOutBody": {
    es: "Tu progreso está guardado. Puedes volver a iniciar sesión en cualquier momento.",
    en: "Your progress is saved. You can sign back in at any time.",
  },
  "detail.signOutConfirm": { es: "Cerrar sesión", en: "Sign out" },
  "detail.signOutCancel": { es: "Cancelar", en: "Cancel" },
} satisfies Record<string, LocalizedEntry>

export const getPlaygroundDict = (lang: string): PlaygroundDict => {
  const locale: Lang = lang === "en" ? "en" : "es"
  const tx = (key: keyof typeof translations): string => translations[key][locale]

  return {
    meta: {
      title: tx("meta.title"),
      description: tx("meta.description"),
    },
    hub: {
      eyebrow: tx("hub.eyebrow"),
      heading: tx("hub.heading"),
      headingAccent: tx("hub.headingAccent"),
      intro: tx("hub.intro"),
      startCta: tx("hub.startCta"),
      continueCta: tx("hub.continueCta"),
      filterAll: tx("hub.filterAll"),
      sort: {
        label: tx("hub.sort.label"),
        recommended: tx("hub.sort.recommended"),
        difficulty: tx("hub.sort.difficulty"),
        duration: tx("hub.sort.duration"),
        sortAsc: tx("hub.sort.sortAsc"),
        sortDesc: tx("hub.sort.sortDesc"),
      },
    },
    startingLine: {
      eyebrow: tx("startingLine.eyebrow"),
      heading: tx("startingLine.heading"),
      body: tx("startingLine.body"),
      cta: tx("startingLine.cta"),
    },
    difficulty: {
      beginner: tx("difficulty.beginner"),
      moderate: tx("difficulty.moderate"),
      demanding: tx("difficulty.demanding"),
    },
    category: {
      "code-review": tx("category.code-review"),
      "bug-fix": tx("category.bug-fix"),
      testing: tx("category.testing"),
      git: tx("category.git"),
      documentation: tx("category.documentation"),
    },
    status: {
      notStarted: tx("status.notStarted"),
      inProgress: tx("status.inProgress"),
      completed: tx("status.completed"),
    },
    badges: {
      heading: tx("badges.heading"),
      lockMessage: tx("badges.lockMessage"),
      "first-merge": {
        name: tx("badges.first-merge.name"),
        description: tx("badges.first-merge.description"),
      },
      "review-corps": {
        name: tx("badges.review-corps.name"),
        description: tx("badges.review-corps.description"),
      },
      "coverage-hero": {
        name: tx("badges.coverage-hero.name"),
        description: tx("badges.coverage-hero.description"),
      },
      "ship-it": {
        name: tx("badges.ship-it.name"),
        description: tx("badges.ship-it.description"),
      },
      "streak-7": {
        name: tx("badges.streak-7.name"),
        description: tx("badges.streak-7.description"),
      },
      "all-tracks": {
        name: tx("badges.all-tracks.name"),
        description: tx("badges.all-tracks.description"),
      },
    },
    time: {
      minutes: tx("time.minutes"),
    },
    detail: {
      back: tx("detail.back"),
      startChallenge: tx("detail.startChallenge"),
      sandboxNote: tx("detail.sandboxNote"),
      metaCategory: tx("detail.metaCategory"),
      metaDifficulty: tx("detail.metaDifficulty"),
      metaTime: tx("detail.metaTime"),
      metaValidation: tx("detail.metaValidation"),
      youllPractice: tx("detail.youllPractice"),
      recommendedFirst: tx("detail.recommendedFirst"),
      authTitle: tx("detail.authTitle"),
      authBody: tx("detail.authBody"),
      authGithub: tx("detail.authGithub"),
      authPrivacyStrong: tx("detail.authPrivacyStrong"),
      authPrivacyRest: tx("detail.authPrivacyRest"),
      signOut: tx("detail.signOut"),
      signOutTitle: tx("detail.signOutTitle"),
      signOutBody: tx("detail.signOutBody"),
      signOutConfirm: tx("detail.signOutConfirm"),
      signOutCancel: tx("detail.signOutCancel"),
    },
  }
}
