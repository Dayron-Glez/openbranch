import type { Lang } from "./landing-dictionary"

export type PlaygroundDict = {
  readonly active: {
    readonly exitLabel: string
    readonly submitButton: string
    readonly decisionLabel: string
    readonly decisionApprove: string
    readonly decisionComment: string
    readonly decisionRequestChanges: string
    readonly commentSingular: string
    readonly commentPlural: string
    readonly noComments: string
    readonly addComment: string
    readonly cancelComment: string
    readonly deleteComment: string
    readonly commentPlaceholder: string
    readonly submitRequirements: string
    readonly revealHint: string
    readonly hintsLabel: string
    readonly viewSolution: string
    readonly backToEdit: string
    readonly testsLabel: string
    readonly running: string
    readonly passing: string
    readonly waitingForEditor: string
    readonly syntaxError: string
    readonly fixSyntax: string
    readonly editToStart: string
    readonly allTestsPassing: string
    readonly fixTypeErrors: string
    readonly submitting: string
    readonly regressionsLabel: string
    readonly caught: string
    readonly writeTestsToStart: string
    readonly allRegressionsCaught: string
    readonly needMoreTests: string
    readonly submitTests: string
    readonly readOnlyLabel: string
    readonly run: string
    readonly conflictsLabel: string
    readonly conflictsResolved: string
    readonly typeChecksLabel: string
    readonly branchesPreservedLabel: string
    readonly resolveToStart: string
    readonly mergeClean: string
    readonly tabBase: string
    readonly tabOurs: string
    readonly tabTheirs: string
    readonly tabMerged: string
    readonly submitMerge: string
    readonly resetCode: string
    readonly prevConflict: string
    readonly nextConflict: string
    readonly enterFullscreen: string
    readonly exitFullscreen: string
    readonly docsChecklistHeading: string
    readonly docsSubmitButton: string
    readonly docsAllCriteriaMet: string
  }
  readonly result: {
    readonly heading: string
    readonly headingAccent: string
    readonly body: string
    readonly statCompleted: string
    readonly statTimeTaken: string
    readonly statChallengeBranch: string
    readonly trackSuffix: string
    readonly nextChallengeCta: string
    readonly backToHub: string
    readonly practiceAgain: string
    readonly badgeEarnedLabel: string
    readonly detailedScoringHeading: string
    readonly detailedScoringBody: string
    readonly keepGoing: string
    readonly allChallenges: string
    readonly buildsOnThis: string
    readonly newTrack: string
  }
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
    readonly practiceAgain: string
    readonly continueChallenge: string
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
    readonly "doc-writer": { readonly name: string; readonly description: string }
  }
  readonly time: {
    readonly minutes: string
  }
  readonly stats: {
    readonly eyebrow: string
    readonly points: string
    readonly pointsToday: string
    readonly acrossTracksSingular: string
    readonly acrossTracksPlural: string
    readonly streak: string
    readonly days: string
    readonly of: string
    readonly streakAlive: string
    readonly streakBroken: string
    readonly streakFirst: string
    readonly completed: string
    readonly nextUp: string
    readonly allTracksStarted: string
    readonly best: string
    readonly bestNote: string
  }
  readonly nudge: {
    readonly lead: string
    readonly sub: string
    readonly cta: string
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
  "badges.doc-writer.name": { es: "Doc Writer", en: "Doc Writer" },
  "badges.doc-writer.description": {
    es: "Escribiste documentación que guía a futuros colaboradores",
    en: "Wrote documentation that guides future contributors",
  },
  "time.minutes": { es: "min", en: "min" },
  "active.exitLabel": { es: "Salir del reto", en: "Exit challenge" },
  "active.submitButton": { es: "Enviar revisión", en: "Submit review" },
  "active.decisionLabel": { es: "Decisión de revisión", en: "Review decision" },
  "active.decisionApprove": { es: "Aprobar", en: "Approve" },
  "active.decisionComment": { es: "Comentar", en: "Comment" },
  "active.decisionRequestChanges": { es: "Solicitar cambios", en: "Request changes" },
  "active.commentSingular": { es: "comentario", en: "comment" },
  "active.commentPlural": { es: "comentarios", en: "comments" },
  "active.noComments": { es: "Sin comentarios aún", en: "No comments yet" },
  "active.addComment": { es: "Añadir", en: "Add comment" },
  "active.cancelComment": { es: "Cancelar", en: "Cancel" },
  "active.deleteComment": { es: "Eliminar", en: "Delete" },
  "active.commentPlaceholder": {
    es: "Escribe un comentario específico y accionable...",
    en: "Write a specific, actionable comment...",
  },
  "active.submitRequirements": {
    es: "Añade al menos un comentario y selecciona una decisión",
    en: "Add at least one comment and select a decision",
  },
  "active.revealHint": { es: "Mostrar pista", en: "Reveal hint" },
  "active.hintsLabel": { es: "Pistas", en: "Hints" },
  "active.viewSolution": { es: "Ver solución", en: "View solution" },
  "active.backToEdit": { es: "← Volver a editar", en: "← Back to editing" },
  "active.testsLabel": { es: "Tests", en: "Tests" },
  "active.running": { es: "ejecutando…", en: "running…" },
  "active.passing": { es: "pasando", en: "passing" },
  "active.waitingForEditor": { es: "esperando al editor", en: "waiting for editor" },
  "active.syntaxError": { es: "Error de sintaxis", en: "Syntax error" },
  "active.fixSyntax": {
    es: "Corrige la sintaxis para ejecutar los tests.",
    en: "Fix the syntax to run tests.",
  },
  "active.editToStart": {
    es: "Edita el código para empezar a ejecutar los tests.",
    en: "Edit the code above to start running tests.",
  },
  "active.allTestsPassing": {
    es: "¡Todos los tests pasan — listo para enviar!",
    en: "All tests passing — ready to submit!",
  },
  "active.fixTypeErrors": {
    es: "Corrige los errores de TypeScript antes de enviar.",
    en: "Fix TypeScript errors before submitting.",
  },
  "active.submitting": { es: "Enviando…", en: "Submitting…" },
  "active.regressionsLabel": { es: "Regresiones", en: "Regressions" },
  "active.caught": { es: "atrapadas", en: "caught" },
  "active.writeTestsToStart": {
    es: "Escribe tests para empezar a validar.",
    en: "Write tests to start validating.",
  },
  "active.allRegressionsCaught": {
    es: "¡Todas las regresiones atrapadas — listo para enviar!",
    en: "All regressions caught — ready to submit!",
  },
  "active.needMoreTests": {
    es: "Tus tests pasan, pero no atrapan todas las regresiones. Cubre más casos.",
    en: "Your tests pass, but they don't catch every regression. Cover more cases.",
  },
  "active.submitTests": { es: "Enviar tests", en: "Submit tests" },
  "active.readOnlyLabel": { es: "solo lectura", en: "read-only" },
  "active.run": { es: "Ejecutar", en: "Run" },
  "active.conflictsLabel": { es: "Conflictos resueltos", en: "Conflicts resolved" },
  "active.conflictsResolved": { es: "{k}/{n}", en: "{k}/{n}" },
  "active.typeChecksLabel": { es: "Type-checks", en: "Type-checks" },
  "active.branchesPreservedLabel": { es: "Ambas ramas preservadas", en: "Both branches preserved" },
  "active.resolveToStart": {
    es: "Resuelve los conflictos para empezar a validar.",
    en: "Resolve the conflicts to start validating.",
  },
  "active.mergeClean": {
    es: "¡Merge correcto — listo para enviar!",
    en: "Clean merge — ready to submit!",
  },
  "active.tabBase": { es: "base", en: "base" },
  "active.tabOurs": { es: "ours", en: "ours" },
  "active.tabTheirs": { es: "theirs", en: "theirs" },
  "active.tabMerged": { es: "merged", en: "merged" },
  "active.submitMerge": { es: "Enviar merge", en: "Submit merge" },
  "active.resetCode": { es: "Resetear código", en: "Reset code" },
  "active.prevConflict": { es: "Conflicto anterior", en: "Previous conflict" },
  "active.nextConflict": { es: "Conflicto siguiente", en: "Next conflict" },
  "active.enterFullscreen": { es: "Pantalla completa", en: "Enter fullscreen" },
  "active.exitFullscreen": { es: "Salir de pantalla completa", en: "Exit fullscreen" },
  "active.docsChecklistHeading": { es: "Lista de criterios", en: "Documentation checklist" },
  "active.docsSubmitButton": { es: "Enviar documentación", en: "Submit documentation" },
  "active.docsAllCriteriaMet": {
    es: "¡Todos los criterios cumplidos — listo para enviar!",
    en: "All criteria met — ready to submit!",
  },
  "result.heading": { es: "Reto", en: "Challenge" },
  "result.headingAccent": { es: "completado", en: "complete" },
  "result.body": {
    es: "Revisaste el diff y enviaste tu decisión. La rama se fusiona — o se bloquea. De cualquier forma, tomaste la llamada.",
    en: "You reviewed the diff and submitted a decision. The branch is merged — or blocked. Either way, you shipped a call.",
  },
  "result.statCompleted": { es: "Completado", en: "Completed" },
  "result.statTimeTaken": { es: "tiempo", en: "time taken" },
  "result.statChallengeBranch": { es: "rama del reto", en: "challenge branch" },
  "result.trackSuffix": { es: "track", en: "track" },
  "result.nextChallengeCta": { es: "Siguiente reto", en: "Next challenge" },
  "result.backToHub": { es: "Volver al playground", en: "Back to hub" },
  "result.practiceAgain": { es: "Practicar de nuevo", en: "Practice again" },
  "result.badgeEarnedLabel": { es: "Badge ganado", en: "Badge earned" },
  "result.detailedScoringHeading": {
    es: "Puntuación detallada próximamente",
    en: "Detailed scoring coming soon",
  },
  "result.detailedScoringBody": {
    es: "Estamos construyendo un sistema de evaluación automática que te dirá exactamente qué detectaste, qué te faltó y por qué importa. Por ahora, el mérito es tuyo — lo terminaste.",
    en: "We're building an automated grader that will tell you exactly what you caught, what you missed, and why it matters. For now, the rep is yours — you finished it.",
  },
  "result.keepGoing": { es: "Sigue adelante", en: "Keep going" },
  "result.allChallenges": { es: "Todos los retos", en: "All challenges" },
  "result.buildsOnThis": { es: "Continúa este", en: "Builds on this" },
  "result.newTrack": { es: "Nuevo track", en: "New track" },
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
  "detail.practiceAgain": { es: "Practicar de nuevo", en: "Practice again" },
  "detail.continueChallenge": { es: "Continuar reto", en: "Continue challenge" },
  "stats.eyebrow": { es: "Tu progreso", en: "Your progress" },
  "stats.points": { es: "Puntos", en: "Points" },
  "stats.pointsToday": { es: "+{points} hoy", en: "+{points} today" },
  "stats.acrossTracksSingular": { es: "En 1 track", en: "Across 1 track" },
  "stats.acrossTracksPlural": { es: "En {count} tracks", en: "Across {count} tracks" },
  "stats.streak": { es: "Racha actual", en: "Current streak" },
  "stats.days": { es: "días", en: "days" },
  "stats.of": { es: "de {total}", en: "of {total}" },
  "stats.streakAlive": {
    es: "Viva — completaste uno hoy",
    en: "Alive — you completed one today",
  },
  "stats.streakBroken": {
    es: "Terminó el {date} — una entrega la reinicia",
    en: "Ended {date} — one completion restarts it",
  },
  "stats.streakFirst": {
    es: "Tu primera entrega la inicia",
    en: "Your first completion starts it",
  },
  "stats.completed": { es: "Completados", en: "Completed" },
  "stats.nextUp": { es: "Siguiente: track de {track}", en: "Next up: {track} track" },
  "stats.allTracksStarted": { es: "Todos los tracks empezados", en: "All tracks started" },
  "stats.best": { es: "Mejor racha", en: "Best streak" },
  "stats.bestNote": { es: "Récord personal", en: "Personal best" },
  "nudge.lead": {
    es: "Puntos, rachas y un lugar en el tablero.",
    en: "Points, streaks and a place on the board.",
  },
  "nudge.sub": {
    es: "Inicia sesión para empezar a contar — el progreso se registra desde tu primera entrega.",
    en: "Sign in to start counting — progress is tracked from your first completion.",
  },
  "nudge.cta": { es: "Inicia sesión con GitHub", en: "Sign in with GitHub" },
} satisfies Record<string, LocalizedEntry>

export const getPlaygroundDict = (lang: string): PlaygroundDict => {
  const locale: Lang = lang === "en" ? "en" : "es"
  const tx = (key: keyof typeof translations): string => translations[key][locale]

  return {
    active: {
      exitLabel: tx("active.exitLabel"),
      submitButton: tx("active.submitButton"),
      decisionLabel: tx("active.decisionLabel"),
      decisionApprove: tx("active.decisionApprove"),
      decisionComment: tx("active.decisionComment"),
      decisionRequestChanges: tx("active.decisionRequestChanges"),
      commentSingular: tx("active.commentSingular"),
      commentPlural: tx("active.commentPlural"),
      noComments: tx("active.noComments"),
      addComment: tx("active.addComment"),
      cancelComment: tx("active.cancelComment"),
      deleteComment: tx("active.deleteComment"),
      commentPlaceholder: tx("active.commentPlaceholder"),
      submitRequirements: tx("active.submitRequirements"),
      revealHint: tx("active.revealHint"),
      hintsLabel: tx("active.hintsLabel"),
      viewSolution: tx("active.viewSolution"),
      backToEdit: tx("active.backToEdit"),
      testsLabel: tx("active.testsLabel"),
      running: tx("active.running"),
      passing: tx("active.passing"),
      waitingForEditor: tx("active.waitingForEditor"),
      syntaxError: tx("active.syntaxError"),
      fixSyntax: tx("active.fixSyntax"),
      editToStart: tx("active.editToStart"),
      allTestsPassing: tx("active.allTestsPassing"),
      fixTypeErrors: tx("active.fixTypeErrors"),
      submitting: tx("active.submitting"),
      regressionsLabel: tx("active.regressionsLabel"),
      caught: tx("active.caught"),
      writeTestsToStart: tx("active.writeTestsToStart"),
      allRegressionsCaught: tx("active.allRegressionsCaught"),
      needMoreTests: tx("active.needMoreTests"),
      submitTests: tx("active.submitTests"),
      readOnlyLabel: tx("active.readOnlyLabel"),
      run: tx("active.run"),
      conflictsLabel: tx("active.conflictsLabel"),
      conflictsResolved: tx("active.conflictsResolved"),
      typeChecksLabel: tx("active.typeChecksLabel"),
      branchesPreservedLabel: tx("active.branchesPreservedLabel"),
      resolveToStart: tx("active.resolveToStart"),
      mergeClean: tx("active.mergeClean"),
      tabBase: tx("active.tabBase"),
      tabOurs: tx("active.tabOurs"),
      tabTheirs: tx("active.tabTheirs"),
      tabMerged: tx("active.tabMerged"),
      submitMerge: tx("active.submitMerge"),
      resetCode: tx("active.resetCode"),
      prevConflict: tx("active.prevConflict"),
      nextConflict: tx("active.nextConflict"),
      enterFullscreen: tx("active.enterFullscreen"),
      exitFullscreen: tx("active.exitFullscreen"),
      docsChecklistHeading: tx("active.docsChecklistHeading"),
      docsSubmitButton: tx("active.docsSubmitButton"),
      docsAllCriteriaMet: tx("active.docsAllCriteriaMet"),
    },
    result: {
      heading: tx("result.heading"),
      headingAccent: tx("result.headingAccent"),
      body: tx("result.body"),
      statCompleted: tx("result.statCompleted"),
      statTimeTaken: tx("result.statTimeTaken"),
      statChallengeBranch: tx("result.statChallengeBranch"),
      trackSuffix: tx("result.trackSuffix"),
      nextChallengeCta: tx("result.nextChallengeCta"),
      backToHub: tx("result.backToHub"),
      practiceAgain: tx("result.practiceAgain"),
      badgeEarnedLabel: tx("result.badgeEarnedLabel"),
      detailedScoringHeading: tx("result.detailedScoringHeading"),
      detailedScoringBody: tx("result.detailedScoringBody"),
      keepGoing: tx("result.keepGoing"),
      allChallenges: tx("result.allChallenges"),
      buildsOnThis: tx("result.buildsOnThis"),
      newTrack: tx("result.newTrack"),
    },
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
      "doc-writer": {
        name: tx("badges.doc-writer.name"),
        description: tx("badges.doc-writer.description"),
      },
    },
    time: {
      minutes: tx("time.minutes"),
    },
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
    nudge: {
      lead: tx("nudge.lead"),
      sub: tx("nudge.sub"),
      cta: tx("nudge.cta"),
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
      practiceAgain: tx("detail.practiceAgain"),
      continueChallenge: tx("detail.continueChallenge"),
    },
  }
}
