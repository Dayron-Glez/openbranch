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

const es: PlaygroundDict = {
  meta: {
    title: "Playground · openbranch",
    description:
      "Practica flujos de trabajo open source en un entorno aislado. Sin ramas reales, sin PRs, sin consecuencias.",
  },
  hub: {
    eyebrow: "aprende haciendo",
    heading: "Practica como si fuera",
    headingAccent: "producción — sin el riesgo.",
    intro:
      "Cada reto es un sandbox aislado. Corriges bugs reales, revisas PRs reales y escribes tests reales. Nada sale del playground.",
    startCta: "Empezar reto",
    continueCta: "Continuar",
    filterAll: "Todos",
  },
  difficulty: {
    beginner: "principiante",
    moderate: "moderado",
    demanding: "exigente",
  },
  category: {
    "code-review": "Code Review",
    "bug-fix": "Bug Fix",
    testing: "Testing",
    git: "Git",
    documentation: "Documentación",
  },
  status: {
    notStarted: "Sin empezar",
    inProgress: "En progreso",
    completed: "Completado",
  },
  badges: {
    heading: "Tus badges",
    "code-reviewer": {
      name: "Code Reviewer",
      description: "Completaste un reto de revisión de código",
    },
    "bug-hunter": {
      name: "Bug Hunter",
      description: "Encontraste y corregiste un bug real",
    },
    "test-writer": {
      name: "Test Writer",
      description: "Escribiste tests que protegen el comportamiento",
    },
  },
  time: {
    minutes: "min",
  },
}

const en: PlaygroundDict = {
  meta: {
    title: "Playground · openbranch",
    description:
      "Practice open source workflows in an isolated sandbox. No real branches, no PRs, no consequences.",
  },
  hub: {
    eyebrow: "learn by doing",
    heading: "Practice like it's",
    headingAccent: "production — without the risk.",
    intro:
      "Every challenge is an isolated sandbox. You fix real bugs, review real PRs, and write real tests. Nothing leaves the playground.",
    startCta: "Start challenge",
    continueCta: "Continue",
    filterAll: "All",
  },
  difficulty: {
    beginner: "beginner",
    moderate: "moderate",
    demanding: "demanding",
  },
  category: {
    "code-review": "Code Review",
    "bug-fix": "Bug Fix",
    testing: "Testing",
    git: "Git",
    documentation: "Documentation",
  },
  status: {
    notStarted: "Not started",
    inProgress: "In progress",
    completed: "Completed",
  },
  badges: {
    heading: "Your badges",
    "code-reviewer": {
      name: "Code Reviewer",
      description: "Completed a code review challenge",
    },
    "bug-hunter": {
      name: "Bug Hunter",
      description: "Found and fixed a real bug",
    },
    "test-writer": {
      name: "Test Writer",
      description: "Wrote tests that lock in behavior",
    },
  },
  time: {
    minutes: "min",
  },
}

const DICTS: Record<Lang, PlaygroundDict> = { es, en }

export const getPlaygroundDict = (lang: string): PlaygroundDict =>
  lang === "en" ? DICTS.en : DICTS.es
