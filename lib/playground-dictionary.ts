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
    readonly "code-reviewer": { readonly name: string; readonly description: string }
    readonly "bug-hunter": { readonly name: string; readonly description: string }
    readonly "test-writer": { readonly name: string; readonly description: string }
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
  "badges.heading": { es: "Tus badges", en: "Your badges" },
  "badges.code-reviewer.name": { es: "Code Reviewer", en: "Code Reviewer" },
  "badges.code-reviewer.description": {
    es: "Completaste un reto de revisión de código",
    en: "Completed a code review challenge",
  },
  "badges.bug-hunter.name": { es: "Bug Hunter", en: "Bug Hunter" },
  "badges.bug-hunter.description": {
    es: "Encontraste y corregiste un bug real",
    en: "Found and fixed a real bug",
  },
  "badges.test-writer.name": { es: "Test Writer", en: "Test Writer" },
  "badges.test-writer.description": {
    es: "Escribiste tests que protegen el comportamiento",
    en: "Wrote tests that lock in behavior",
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
      "code-reviewer": {
        name: tx("badges.code-reviewer.name"),
        description: tx("badges.code-reviewer.description"),
      },
      "bug-hunter": {
        name: tx("badges.bug-hunter.name"),
        description: tx("badges.bug-hunter.description"),
      },
      "test-writer": {
        name: tx("badges.test-writer.name"),
        description: tx("badges.test-writer.description"),
      },
    },
    time: {
      minutes: tx("time.minutes"),
    },
  }
}
