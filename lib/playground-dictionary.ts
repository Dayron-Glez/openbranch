import type { Lang } from "./landing-dictionary"

export type PlaygroundDict = {
  readonly meta: {
    readonly title: string
    readonly description: string
  }
  readonly hub: {
    readonly eyebrow: string
    readonly heading: string
    readonly headingAccent: string
    readonly intro: string
    readonly startCta: string
    readonly continueCta: string
    readonly filterAll: string
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
  "category.code-review": { es: "Code Review", en: "Code Review" },
  "category.bug-fix": { es: "Bug Fix", en: "Bug Fix" },
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
  }
}
