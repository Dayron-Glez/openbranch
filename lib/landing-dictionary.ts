export type Lang = "es" | "en"

export type HeroStatItem = {
  readonly label: string
  readonly value: string
  readonly unit?: string
  readonly subAccent?: string
  readonly subText: string
}

export type HeroStatsLabels = {
  readonly license: HeroStatItem
  readonly compatibility: HeroStatItem
  readonly guides: HeroStatItem
  readonly contributors: HeroStatItem
}

export type TopicItem = {
  readonly icon: "branch" | "pr" | "flask" | "tag" | "fork" | "bulb"
  readonly slug: string
  readonly countUnit: string
  readonly title: string
  readonly description: string
}

export type ValuePropItem = {
  readonly badge: string
  readonly title: string
  readonly body: string
}

export type FooterColumn = {
  readonly title: string
  readonly links: ReadonlyArray<{
    readonly label: string
    readonly href: string
    readonly external: boolean
  }>
}

export type LandingDict = {
  readonly nav: {
    readonly searchPlaceholder: string
    readonly searchAria: string
    readonly githubStarsAria: string
    readonly githubStarsTooltip: string
    readonly discordAria: string
    readonly discordTooltip: string
    readonly getStarted: string
    readonly switchLang: string
  }
  readonly hero: {
    readonly phrases: ReadonlyArray<string>
    readonly titleLead: string
    readonly subtitle: string
    readonly cta: string
    readonly replayAria: string
    readonly stats: HeroStatsLabels
  }
  readonly sections: {
    readonly topicsEyebrow: string
    readonly topicsHeading: string
    readonly topicsHeadingAccent: string
    readonly topicsIntro: string
    readonly featuredEyebrow: string
    readonly featuredHeading: string
    readonly featuredHeadingAccent: string
    readonly whyEyebrow: string
    readonly whyHeading: string
    readonly whyHeadingAccent: string
  }
  readonly topics: ReadonlyArray<TopicItem>
  readonly featured: {
    readonly cta: string
    readonly previewAria: string
    readonly updatedLabel: string
  }
  readonly valueProp: ReadonlyArray<ValuePropItem>
  readonly community: {
    readonly eyebrow: string
    readonly title: string
    readonly body: string
    readonly ctaPrimary: string
    readonly ctaSecondary: string
    readonly contributors: string
  }
  readonly footer: {
    readonly tagline: string
    readonly columns: ReadonlyArray<FooterColumn>
    readonly legal: string
  }
}

import { GH_URL as GH } from "@/lib/constants"

const es: LandingDict = {
  nav: {
    searchPlaceholder: "Buscar documentación...",
    searchAria: "Buscar en la documentación",
    githubStarsAria: "Ver en GitHub",
    githubStarsTooltip: "¡Dale una estrella!",
    discordAria: "Discord",
    discordTooltip: "¡Únete al Discord!",
    getStarted: "Empezar",
    switchLang: "Cambiar idioma",
  },
  hero: {
    phrases: [
      "entregar software.",
      "fusionar ramas.",
      "revisar pull requests.",
      "escribir mejores pruebas.",
      "construir grandes equipos.",
    ],
    titleLead: "La guía abierta para",
    subtitle: "Un manual comunitario sobre cómo los equipos reales entregan software.",
    cta: "Leer el manual",
    replayAria: "Repetir la animación del logo de openbranch",
    stats: {
      license: { label: "Licencia", value: "MIT", subText: "libre y abierto, para siempre" },
      compatibility: {
        label: "Compatibilidad",
        value: "Cualquier stack",
        subText: "independiente del lenguaje",
      },
      guides: {
        label: "Guías activas",
        value: "",
        unit: "+",
        subAccent: "nuevas",
        subText: " cada semana",
      },
      contributors: {
        label: "Colaboradores",
        value: "Open",
        subAccent: "sé el #2",
        subText: " · únete pronto →",
      },
    },
  },
  sections: {
    topicsEyebrow: "Lo que encontrarás",
    topicsHeading: "Respuestas prácticas,",
    topicsHeadingAccent: "no opiniones disfrazadas de buenas prácticas.",
    topicsIntro:
      "Cada guía nace de una base de código real, validada por los maintainers que la enviaron, y se revisa cuando la realidad la contradice. Explora por tema.",
    featuredEyebrow: "Elección de la semana",
    featuredHeading: "Guías reales,",
    featuredHeadingAccent: "se leen como si emparejaras con alguien sénior.",
    whyEyebrow: "Por qué openbranch",
    whyHeading: "Construido como las bases de código",
    whyHeadingAccent: "que documenta.",
  },
  topics: [
    {
      icon: "branch",
      slug: "git",
      countUnit: "guías",
      title: "Git y flujos de trabajo",
      description:
        "Trunk-based, release branches, GitFlow - cuándo cada una vale la pena y las señales de que se te quedó pequeña.",
    },
    {
      icon: "pr",
      slug: "pull-requests",
      countUnit: "guías",
      title: "Pull requests y revisión",
      description:
        "Plantillas que sí se revisan, límites de tamaño que se respetan y cómo dejar un comentario que no ponga a nadie a la defensiva.",
    },
    {
      icon: "flask",
      slug: "testing",
      countUnit: "guías",
      title: "Pruebas",
      description:
        "Contract tests, higiene de snapshots, matar CI inestable - patrones que aguantan con 50 ingenieros y con 50.000.",
    },
    {
      icon: "tag",
      slug: "releases",
      countUnit: "guías",
      title: "Releases y versionado",
      description:
        "Semver en la práctica, changelogs que tus usuarios sí leen y simulacros de rollback que no necesitan un héroe.",
    },
    {
      icon: "fork",
      slug: "contributing",
      countUnit: "guías",
      title: "Contribuir al código abierto",
      description:
        "Onboarding de nuevos contribuidores, RFCs que se entregan, gobernanza que escala sin ahogar el ritmo.",
    },
    {
      icon: "bulb",
      slug: "best-practices",
      countUnit: "historias",
      title: "Buenas prácticas",
      description:
        'Post-mortems, rediseños y las historias de "deberíamos haber hecho esto 6 meses antes" que vale la pena leer.',
    },
  ],
  featured: {
    cta: "Leer la guía",
    previewAria: "Vista previa de la guía",
    updatedLabel: "actualizado",
  },
  valueProp: [
    {
      badge: "de la comunidad",
      title: "Cada guía es un PR.",
      body: "Sin guardianes. El mismo flujo que documentamos es el que usamos para escribir la documentación.",
    },
    {
      badge: "agnóstico al stack",
      title: "Sin agenda de framework.",
      body: "Si un patrón solo funciona en un stack, lo decimos. La mayoría aquí son más viejos que tu build tool.",
    },
    {
      badge: "versionado",
      title: "Consejos con caducidad.",
      body: "Cada guía está fechada, versionada y se revisa. Retiramos a propósito los patrones que no envejecieron bien.",
    },
  ],
  community: {
    eyebrow: "hecho por la comunidad",
    title: "El manual mejora cada vez que abres un PR.",
    body: "¿Encontraste un patrón que funcionó? ¿No estás de acuerdo con una guía? Abre un pull request, cuenta tu historia o solo añade una frase - así como trabajamos es como crece la documentación.",
    ctaPrimary: "Abre tu primer PR",
    ctaSecondary: "Explora el repo",
    contributors: "contribuidores",
  },
  footer: {
    tagline:
      "Un manual construido por la comunidad sobre cómo los equipos entregan software. Libre, código abierto, siempre en evolución.",
    columns: [
      {
        title: "Docs",
        links: [
          { label: "Ramas", href: "/docs/git", external: false },
          { label: "Pruebas", href: "/docs/testing", external: false },
          { label: "Revisiones", href: "/docs/pull-requests", external: false },
          { label: "Releases", href: "/docs/releases", external: false },
        ],
      },
      {
        title: "Comunidad",
        links: [
          { label: "Contribuidores", href: `${GH}/graphs/contributors`, external: true },
          { label: "Discusiones", href: `${GH}/discussions`, external: true },
          { label: "Proceso RFC", href: `${GH}/discussions`, external: true },
          {
            label: "Código de conducta",
            href: `${GH}/blob/main/CODE_OF_CONDUCT.md`,
            external: true,
          },
        ],
      },
      {
        title: "Recursos",
        links: [{ label: "Changelog", href: `${GH}/releases`, external: true }],
      },
      {
        title: "Acerca de",
        links: [
          { label: "Maintainers", href: `${GH}/graphs/contributors`, external: true },
          { label: "Licencia · MIT", href: `${GH}/blob/main/LICENSE`, external: true },
          { label: "Sponsors", href: "https://github.com/sponsors/Dayron-Glez", external: true },
        ],
      },
    ],
    legal: "openbranch",
  },
}

const en: LandingDict = {
  nav: {
    searchPlaceholder: "Search the docs...",
    searchAria: "Search the docs",
    githubStarsAria: "View on GitHub",
    githubStarsTooltip: "Give us a star!",
    discordAria: "Discord",
    discordTooltip: "Join our Discord!",
    getStarted: "Get started",
    switchLang: "Change language",
  },
  hero: {
    phrases: [
      "shipping software.",
      "merging branches.",
      "reviewing pull requests.",
      "writing better tests.",
      "building great teams.",
    ],
    titleLead: "The open guide to",
    subtitle: "A community handbook on how real teams actually ship software.",
    cta: "Read the handbook",
    replayAria: "Replay openbranch logo animation",
    stats: {
      license: { label: "License", value: "MIT", subText: "free & open, forever" },
      compatibility: {
        label: "Compatibility",
        value: "Any stack",
        subText: "language-agnostic",
      },
      guides: {
        label: "Guides live",
        value: "",
        unit: "+",
        subAccent: "new",
        subText: " ones every week",
      },
      contributors: {
        label: "Contributors",
        value: "Open",
        subAccent: "be #2",
        subText: " · join early →",
      },
    },
  },
  sections: {
    topicsEyebrow: "What you'll find",
    topicsHeading: "Practical answers,",
    topicsHeadingAccent: "not opinions disguised as best practices.",
    topicsIntro:
      "Every guide is rooted in a real codebase, signed off by the maintainers who shipped it, and revisited when reality disagrees. Browse by topic.",
    featuredEyebrow: "This week's pick",
    featuredHeading: "Real guides,",
    featuredHeadingAccent: "read like you're pairing with someone senior.",
    whyEyebrow: "Why openbranch",
    whyHeading: "Built like the codebases",
    whyHeadingAccent: "it documents.",
  },
  topics: [
    {
      icon: "branch",
      slug: "git",
      countUnit: "guides",
      title: "Git & Workflows",
      description:
        "Trunk-based, release branches, GitFlow - when each one earns its keep, and the warning signs you've outgrown it.",
    },
    {
      icon: "pr",
      slug: "pull-requests",
      countUnit: "guides",
      title: "Pull requests & review",
      description:
        "Templates that get reviewed, size limits that stick, and how to leave a comment that doesn't make someone defensive.",
    },
    {
      icon: "flask",
      slug: "testing",
      countUnit: "guides",
      title: "Testing",
      description:
        "Contract tests, snapshot hygiene, killing flaky CI - patterns that hold up at 50 engineers and 50,000.",
    },
    {
      icon: "tag",
      slug: "releases",
      countUnit: "guides",
      title: "Releases & versioning",
      description:
        "Semver in practice, changelogs your users actually read, and rollback drills that don't require a hero.",
    },
    {
      icon: "fork",
      slug: "contributing",
      countUnit: "guides",
      title: "Contributing to OSS",
      description:
        "Onboarding new contributors, RFCs that ship, governance that scales without smothering momentum.",
    },
    {
      icon: "bulb",
      slug: "best-practices",
      countUnit: "stories",
      title: "Best Practices",
      description:
        'Post-mortems, redesigns, and the "we should have done this 6 months earlier" stories worth reading.',
    },
  ],
  featured: {
    cta: "Read the guide",
    previewAria: "Guide preview",
    updatedLabel: "updated",
  },
  valueProp: [
    {
      badge: "community-owned",
      title: "Every guide is a PR.",
      body: "No gatekeepers. The same workflow we document is the one we use to write the docs.",
    },
    {
      badge: "stack-agnostic",
      title: "No framework agenda.",
      body: "If a pattern only works in one stack, we say so. Most patterns here are older than your build tool.",
    },
    {
      badge: "versioned",
      title: "Advice with an expiry.",
      body: "Every guide is dated, versioned, and revisited. We retire patterns that haven't aged well, on purpose.",
    },
  ],
  community: {
    eyebrow: "made by the community",
    title: "The handbook gets better every time you open a PR.",
    body: "Found a pattern that worked? Disagree with an existing guide? Open a pull request, write up your story, or just add a sentence - the way we work is the way the docs grow.",
    ctaPrimary: "Open your first PR",
    ctaSecondary: "Browse the repo",
    contributors: "contributors",
  },
  footer: {
    tagline:
      "A community-built handbook for how teams ship software. Free, open source, always evolving.",
    columns: [
      {
        title: "Docs",
        links: [
          { label: "Branching", href: "/docs/git", external: false },
          { label: "Testing", href: "/docs/testing", external: false },
          { label: "Reviews", href: "/docs/pull-requests", external: false },
          { label: "Releases", href: "/docs/releases", external: false },
        ],
      },
      {
        title: "Community",
        links: [
          { label: "Contributors", href: `${GH}/graphs/contributors`, external: true },
          { label: "Discussions", href: `${GH}/discussions`, external: true },
          { label: "RFC process", href: `${GH}/discussions`, external: true },
          { label: "Code of conduct", href: `${GH}/blob/main/CODE_OF_CONDUCT.md`, external: true },
        ],
      },
      {
        title: "Resources",
        links: [{ label: "Changelog", href: `${GH}/releases`, external: true }],
      },
      {
        title: "About",
        links: [
          { label: "Maintainers", href: `${GH}/graphs/contributors`, external: true },
          { label: "License · MIT", href: `${GH}/blob/main/LICENSE`, external: true },
          { label: "Sponsors", href: "https://github.com/sponsors/Dayron-Glez", external: true },
        ],
      },
    ],
    legal: "openbranch",
  },
}

const DICTS: Record<Lang, LandingDict> = { es, en }

export function getLandingDict(lang: string): LandingDict {
  return lang === "en" ? DICTS.en : DICTS.es
}

export function localizedHref(lang: string, path: string): string {
  return lang === "en" ? `/en${path}` : path
}
