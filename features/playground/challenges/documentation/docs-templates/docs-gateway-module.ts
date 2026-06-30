import type { DocsCriterion, DocsTemplate } from "../../../domain/docs-types"

const REQUEST_TS_CODE = `export interface RequestOpts {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export const fetchUpstream = async (
  url: string,
  opts: RequestOpts = {}
): Promise<Response | null> => {
  const { headers = {}, timeoutMs = 5000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return null;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
};`

const GATEWAY_MD_INITIAL = `# Gateway Module

<!-- Write your documentation here. -->
<!-- Cover: what fetchUpstream does, its parameters with types and defaults, -->
<!-- what it returns and when it returns null, and a usage example. -->
`

const stripHtmlComments = (content: string): string => content.replace(/<!--[\s\S]*?-->/g, "")

const criteria: readonly DocsCriterion[] = [
  {
    id: "purpose-documented",
    label: "Function purpose explained",
    check: (content) => {
      const stripped = stripHtmlComments(content)
      return /fetchUpstream/i.test(stripped) ? "pass" : "fail"
    },
  },
  {
    id: "params-documented",
    label: "Parameters documented",
    check: (content) => {
      const stripped = stripHtmlComments(content)
      return /timeout/i.test(stripped) ? "pass" : "fail"
    },
  },
  {
    id: "null-case-documented",
    label: "Null return case explained",
    check: (content) => {
      const stripped = stripHtmlComments(content)
      return /null/i.test(stripped) ? "pass" : "fail"
    },
  },
  {
    id: "example-included",
    label: "Usage example included",
    check: (content) => (/```/.test(content) ? "pass" : "fail"),
  },
]

const hints: readonly string[] = [
  "Focus on what `Promise<Response | null>` means at the call site — what must the caller do before using the return value?",
  "The `timeoutMs` option has a default. Document it — a caller shouldn't need to read the source to know what 5000 means in context.",
  "A runnable example shows the `null` guard before calling `.json()`. The import path is `atlas/gateway/request`.",
]

const hintsByLang: Partial<Record<string, readonly string[]>> = {
  es: [
    "Fíjate en lo que `Promise<Response | null>` significa en el punto de uso — ¿qué debe hacer el código que llama antes de usar el valor de retorno?",
    "La opción `timeoutMs` tiene un valor por defecto. Documéntalo — quien llame a la función no debería tener que leer el código para saber qué significa 5000 en contexto.",
    "Un ejemplo ejecutable muestra el guard de `null` antes de llamar a `.json()`. La ruta de import es `atlas/gateway/request`.",
  ],
}

export const docsGatewayModule: DocsTemplate = {
  files: {
    "GATEWAY.md": { code: GATEWAY_MD_INITIAL },
    "src/request.ts": { code: REQUEST_TS_CODE, readOnly: true },
  },
  editableFile: "GATEWAY.md",
  criteria,
  hints,
  hintsByLang,
}
