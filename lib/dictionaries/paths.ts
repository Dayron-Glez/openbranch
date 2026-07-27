export const pathsDictionary = {
  es: {
    sectionHeading: "Rutas de aprendizaje",
    sectionSub: "Guías y retos encadenados en un recorrido que suma",
    breadcrumbPaths: "Rutas",
    guideLabel: "Guía",
    challengeLabel: "Reto",
    partOfPath: "Parte de una ruta",
    stepOf: (n: number, total: number): string => `Paso ${n} de ${total}`,
    stepsCount: (n: number): string => `${n} paso${n === 1 ? "" : "s"}`,
    sectionOf: (n: number, total: number): string => `Parte ${n} de ${total}`,
    startWithGuide: "Empieza con la guía",
    startThePath: "Empezar la ruta",
    openGuide: "Abrir guía",
    openChallenge: "Abrir reto",
    startChallenge: "Empezar reto",
    youAreHere: "Estás aquí",
    available: "Disponible",
    completed: "Completado",
    practiced: (done: number, total: number): string =>
      `${done} de ${total} practicado${total === 1 ? "" : "s"}`,
    nextInPath: "Siguiente en esta ruta",
    pathComplete: "Ruta completada",
    pathInProgress: "En la ruta",
    youFinishedThePath: "Completaste la ruta.",
    continuePath: "Continuar la ruta",
    explorePaths: "Explorar otra ruta",
    guestReading: "Leyendo como invitado.",
    guestSignInPrompt:
      "Inicia sesión para trackear qué retos completaste y seguir donde lo dejaste.",
    signIn: "Iniciar sesión con GitHub",
    allPaths: "Ver todas",
    pathShape: (guides: number, challenges: number): string =>
      `${guides} guía${guides === 1 ? "" : "s"} · ${challenges} reto${challenges === 1 ? "" : "s"}`,
    indexEyebrow: "aprende en orden",
    indexHeading: "Un tema no se entiende de una sentada.",
    indexIntro:
      "Una guía te da una idea; un reto te da una hora de práctica. Una ruta los encadena hasta que el trabajo entero — leer, decidir, practicar, documentar — encaja como una sola cosa.",
    needsWiderScreenTitle: "Necesita más pantalla",
    needsWiderScreenBody: "Abre este reto desde una tablet o un portátil para poder resolverlo.",
  },
  en: {
    sectionHeading: "Learning paths",
    sectionSub: "Guides and challenges chained into a journey that adds up",
    breadcrumbPaths: "Paths",
    guideLabel: "Guide",
    challengeLabel: "Challenge",
    partOfPath: "Part of a path",
    stepOf: (n: number, total: number): string => `Step ${n} of ${total}`,
    stepsCount: (n: number): string => `${n} step${n === 1 ? "" : "s"}`,
    sectionOf: (n: number, total: number): string => `Part ${n} of ${total}`,
    startWithGuide: "Start with the guide",
    startThePath: "Start the path",
    openGuide: "Open guide",
    openChallenge: "Open challenge",
    startChallenge: "Start challenge",
    youAreHere: "You're here",
    available: "Available",
    completed: "Completed",
    practiced: (done: number, total: number): string => `${done} of ${total} practiced`,
    nextInPath: "Next in this path",
    pathComplete: "Path complete",
    pathInProgress: "On this path",
    youFinishedThePath: "You finished the path.",
    continuePath: "Continue the path",
    explorePaths: "Explore another path",
    guestReading: "Reading as a guest.",
    guestSignInPrompt:
      "Sign in to track which challenges you've completed and pick up where you left off.",
    signIn: "Sign in with GitHub",
    allPaths: "See all",
    pathShape: (guides: number, challenges: number): string =>
      `${guides} guide${guides === 1 ? "" : "s"} · ${challenges} challenge${challenges === 1 ? "" : "s"}`,
    indexEyebrow: "learn in order",
    indexHeading: "A topic doesn't land in one sitting.",
    indexIntro:
      "A guide gives you an idea; a challenge gives you an hour of practice. A path chains them until the whole job — read, decide, practise, document — fits together as one thing.",
    needsWiderScreenTitle: "Needs more screen",
    needsWiderScreenBody: "Open this challenge from a tablet or laptop to work through it.",
  },
} as const

export type PathsLocale = keyof typeof pathsDictionary
export type PathsDictionary = (typeof pathsDictionary)[PathsLocale]

export const resolvePathsLocale = (lang: string): PathsLocale =>
  (lang as PathsLocale) in pathsDictionary ? (lang as PathsLocale) : "es"
