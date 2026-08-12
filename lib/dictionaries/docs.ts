export const docsDictionary = {
  es: {
    suggestGuide: "Sugerir una guía",
    markAsRead: "Marcar como leída",
    markedAsRead: "Leída",
    markHint: "Cuenta como paso completado en las rutas que incluyen esta guía",
    unmarkHint: "Quitarla de tu progreso",
    unmarkTitle: "¿Quitar esta guía de tu progreso?",
    unmarkBody:
      "Volverá a contar como pendiente en las rutas que la incluyen y se perderá la fecha en que la leíste por primera vez.",
    unmarkAction: "Quitar",
    cancel: "Cancelar",
    copyTemplate: {
      copy: "Copiar",
      copied: "Copiado",
      copyToClipboard: "Copiar al portapapeles",
      fullScreen: "Pantalla completa",
      expand: "Expandir",
      collapse: "Contraer",
      close: "Cerrar",
    },
  },
  en: {
    suggestGuide: "Suggest a guide",
    markAsRead: "Mark as read",
    markedAsRead: "Read",
    markHint: "Counts as a completed step in paths that include this guide",
    unmarkHint: "Remove it from your progress",
    unmarkTitle: "Remove this guide from your progress?",
    unmarkBody:
      "It will count as pending again in the paths that include it, and the date you first read it will be lost.",
    unmarkAction: "Remove",
    cancel: "Cancel",
    copyTemplate: {
      copy: "Copy",
      copied: "Copied",
      copyToClipboard: "Copy to clipboard",
      fullScreen: "Full screen",
      expand: "Expand",
      collapse: "Collapse",
      close: "Close",
    },
  },
} as const

export type DocsLocale = keyof typeof docsDictionary
export type DocsDictionary = (typeof docsDictionary)[DocsLocale]
