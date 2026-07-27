export const docsDictionary = {
  es: {
    suggestGuide: "Sugerir una guía",
    markAsRead: "Marcar como leída",
    markedAsRead: "Leída",
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
