export type Lang = "es" | "en"

export type NavLink = {
  readonly path: string
  readonly label: string
  readonly exact: boolean
}

export type StatItem = {
  readonly n: string
  readonly unit: string
  readonly label: string
}

export type TopicItem = {
  readonly icon: "branch" | "pr" | "flask" | "tag" | "fork" | "bulb"
  readonly title: string
  readonly description: string
  readonly count: string
  readonly updated: string
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
    readonly links: ReadonlyArray<NavLink>
    readonly searchPlaceholder: string
    readonly searchAria: string
    readonly githubAria: string
    readonly getStarted: string
    readonly switchLang: string
  }
  readonly hero: {
    readonly phrases: ReadonlyArray<string>
    readonly titleLead: string
    readonly subtitle: string
    readonly cta: string
    readonly replayAria: string
    readonly stats: ReadonlyArray<StatItem>
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
    readonly kicker: string
    readonly title: string
    readonly summary: string
    readonly authors: string
    readonly reads: string
    readonly likes: string
    readonly revisions: string
    readonly cta: string
    readonly previewAria: string
    readonly premiseHeading: string
    readonly premiseP1Lead: string
    readonly premiseP1Tail: string
    readonly featureFlags: string
    readonly premiseP2: string
    readonly ruleLabel: string
    readonly ruleBody: string
    readonly setupHeading: string
    readonly setupComment1: string
    readonly setupComment2: string
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
    readonly rss: string
    readonly status: string
  }
}

const GH = "https://github.com/Dayron-Glez/openbranch"

const es: LandingDict = {
  nav: {
    links: [
      { path: "/docs", label: "Documentación", exact: true },
      { path: "/docs/git", label: "Git", exact: false },
      { path: "/docs/testing", label: "Pruebas", exact: false },
      { path: "/docs/contributing", label: "Contribuir", exact: false },
    ],
    searchPlaceholder: "Buscar en la documentación...",
    searchAria: "Buscar en la documentación",
    githubAria: "GitHub",
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
    stats: [
      { n: "128", unit: "+", label: "Guías y recetas" },
      { n: "2.400", unit: "", label: "Contribuidores" },
      { n: "12,4", unit: "k", label: "Estrellas en GitHub" },
      { n: "47", unit: "", label: "Idiomas traducidos" },
    ],
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
      title: "Estrategias de ramas",
      description:
        "Trunk-based, release branches, GitFlow - cuándo cada una vale la pena y las señales de que se te quedó pequeña.",
      count: "24 guías",
      updated: "actualizado hace 2d",
    },
    {
      icon: "pr",
      title: "Pull requests y revisión",
      description:
        "Plantillas que sí se revisan, límites de tamaño que se respetan y cómo dejar un comentario que no ponga a nadie a la defensiva.",
      count: "18 guías",
      updated: "actualizado hace 5d",
    },
    {
      icon: "flask",
      title: "Patrones de pruebas",
      description:
        "Contract tests, higiene de snapshots, matar CI inestable - patrones que aguantan con 50 ingenieros y con 50.000.",
      count: "31 guías",
      updated: "actualizado hace 1sem",
    },
    {
      icon: "tag",
      title: "Releases y versionado",
      description:
        "Semver en la práctica, changelogs que tus usuarios sí leen y simulacros de rollback que no necesitan un héroe.",
      count: "14 guías",
      updated: "actualizado hace 1sem",
    },
    {
      icon: "fork",
      title: "Flujos de contribución",
      description:
        "Onboarding de nuevos contribuidores, RFCs que se entregan, gobernanza que escala sin ahogar el ritmo.",
      count: "22 guías",
      updated: "actualizado hace 3d",
    },
    {
      icon: "bulb",
      title: "Lecciones de equipos reales",
      description:
        'Post-mortems, rediseños y las historias de "deberíamos haber hecho esto 6 meses antes" que vale la pena leer.',
      count: "19 historias",
      updated: "actualizado ayer",
    },
  ],
  featured: {
    kicker: "guía · 7 min de lectura",
    title: "Trunk-based development, cuando no puedes enviar feature flags primero.",
    summary:
      "Qué hacer cuando tus pruebas son lentas, tu equipo es júnior y trunk-based suena a consejo temerario. Un camino intermedio probado en el campo.",
    authors: "Anya Kim y 2 maintainers",
    reads: "18,2k lecturas",
    likes: "940",
    revisions: "12 revisiones",
    cta: "Leer la guía",
    previewAria: "Vista previa de la guía",
    premiseHeading: "La premisa",
    premiseP1Lead: "La mayoría de las guías de trunk-based asumen dos cosas: las ",
    premiseP1Tail:
      " son baratas de añadir y tu CI corre en menos de cinco minutos. Si ninguna es cierta para ti, el consejo estándar empeorará las cosas en silencio.",
    featureFlags: "feature flags",
    premiseP2: "Esta es la versión que funciona antes de tener cualquiera de las dos.",
    ruleLabel: "Regla general",
    ruleBody:
      "Una rama con más de 24 horas es una rama de larga duración - aunque no fuera tu intención.",
    setupHeading: "El setup mínimo viable",
    setupComment1: "# rama desde trunk · objetivo de vida <24h",
    setupComment2: "# obliga nombres, tamaño y límites de edad antes del push",
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
    contributors: "2.400+ contribuidores · últimos 30 días",
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
          { label: "Revisiones", href: "/docs/contributing", external: false },
          { label: "Releases", href: "/docs/best-practices", external: false },
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
        links: [
          { label: "Changelog", href: `${GH}/releases`, external: true },
          { label: "Guía de estilo", href: "/docs", external: false },
          { label: "Traducciones", href: "/docs", external: false },
          { label: "Recursos de marca", href: "/docs", external: false },
        ],
      },
      {
        title: "Acerca de",
        links: [
          { label: "Maintainers", href: `${GH}/graphs/contributors`, external: true },
          { label: "Licencia · MIT", href: `${GH}/blob/main/LICENSE`, external: true },
          { label: "Sponsors", href: "https://github.com/sponsors/Dayron-Glez", external: true },
          { label: "Press kit", href: "/docs", external: false },
        ],
      },
    ],
    legal: "openbranch · v1.4 · construido por 2.400+ contribuidores",
    rss: "RSS",
    status: "Estado",
  },
}

const en: LandingDict = {
  nav: {
    links: [
      { path: "/docs", label: "Docs", exact: true },
      { path: "/docs/git", label: "Git", exact: false },
      { path: "/docs/testing", label: "Testing", exact: false },
      { path: "/docs/contributing", label: "Contributing", exact: false },
    ],
    searchPlaceholder: "Search the docs...",
    searchAria: "Search the docs",
    githubAria: "GitHub",
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
    stats: [
      { n: "128", unit: "+", label: "Guides & recipes" },
      { n: "2,400", unit: "", label: "Contributors" },
      { n: "12.4", unit: "k", label: "GitHub stars" },
      { n: "47", unit: "", label: "Languages translated" },
    ],
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
      title: "Branching strategies",
      description:
        "Trunk-based, release branches, GitFlow - when each one earns its keep, and the warning signs you've outgrown it.",
      count: "24 guides",
      updated: "updated 2d ago",
    },
    {
      icon: "pr",
      title: "Pull requests & review",
      description:
        "Templates that get reviewed, size limits that stick, and how to leave a comment that doesn't make someone defensive.",
      count: "18 guides",
      updated: "updated 5d ago",
    },
    {
      icon: "flask",
      title: "Testing patterns",
      description:
        "Contract tests, snapshot hygiene, killing flaky CI - patterns that hold up at 50 engineers and 50,000.",
      count: "31 guides",
      updated: "updated 1w ago",
    },
    {
      icon: "tag",
      title: "Releases & versioning",
      description:
        "Semver in practice, changelogs your users actually read, and rollback drills that don't require a hero.",
      count: "14 guides",
      updated: "updated 1w ago",
    },
    {
      icon: "fork",
      title: "Contribution flows",
      description:
        "Onboarding new contributors, RFCs that ship, governance that scales without smothering momentum.",
      count: "22 guides",
      updated: "updated 3d ago",
    },
    {
      icon: "bulb",
      title: "Lessons from real teams",
      description:
        'Post-mortems, redesigns, and the "we should have done this 6 months earlier" stories worth reading.',
      count: "19 stories",
      updated: "updated yesterday",
    },
  ],
  featured: {
    kicker: "guide · 7 min read",
    title: "Trunk-based development, when you can't ship feature flags first.",
    summary:
      "What to do when your tests are slow, your team is junior, and trunk-based feels like reckless advice. A field-tested middle path.",
    authors: "Anya Kim & 2 maintainers",
    reads: "18.2k reads",
    likes: "940",
    revisions: "12 revisions",
    cta: "Read the guide",
    previewAria: "Guide preview",
    premiseHeading: "The premise",
    premiseP1Lead: "Most trunk-based guides assume two things: ",
    premiseP1Tail:
      " are cheap to add, and your CI runs in under five minutes. If neither is true for you, the standard advice will quietly make things worse.",
    featureFlags: "feature flags",
    premiseP2: "Here's the version that works before you have either.",
    ruleLabel: "Rule of thumb",
    ruleBody:
      "A branch older than 24 hours is a long-lived branch - even if you didn't mean it to be.",
    setupHeading: "The minimum viable setup",
    setupComment1: "# branch from trunk · <24h lifespan target",
    setupComment2: "# enforces naming, size, age limits before push",
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
    contributors: "2,400+ contributors · last 30 days",
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
          { label: "Reviews", href: "/docs/contributing", external: false },
          { label: "Releases", href: "/docs/best-practices", external: false },
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
        links: [
          { label: "Changelog", href: `${GH}/releases`, external: true },
          { label: "Style guide", href: "/docs", external: false },
          { label: "Translations", href: "/docs", external: false },
          { label: "Brand assets", href: "/docs", external: false },
        ],
      },
      {
        title: "About",
        links: [
          { label: "Maintainers", href: `${GH}/graphs/contributors`, external: true },
          { label: "License · MIT", href: `${GH}/blob/main/LICENSE`, external: true },
          { label: "Sponsors", href: "https://github.com/sponsors/Dayron-Glez", external: true },
          { label: "Press kit", href: "/docs", external: false },
        ],
      },
    ],
    legal: "openbranch · v1.4 · built by 2,400+ contributors",
    rss: "RSS",
    status: "Status",
  },
}

const DICTS: Record<Lang, LandingDict> = { es, en }

export function getLandingDict(lang: string): LandingDict {
  return lang === "en" ? DICTS.en : DICTS.es
}

export function localizedHref(lang: string, path: string): string {
  return lang === "en" ? `/en${path}` : path
}
