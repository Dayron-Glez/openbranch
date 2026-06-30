"use client"

import { useState, useCallback, useRef } from "react"
import Editor from "@monaco-editor/react"
import { saveDocsState, completeTrackChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { DocsTemplateData } from "@/lib/playground/docs-types"
import { getDocsTemplateBySlug } from "@/lib/playground/docs-registry"
import { ChallengeLayout } from "@/components/playground/ChallengeLayout"
import { useChallengeSubmit } from "@/components/playground/useChallengeSubmit"
import { ScrollArea } from "@/components/ui/scroll-area"
import { configureMonaco, EDITOR_OPTIONS } from "@/components/playground/monacoTheme"
import { DocsChecklist } from "./DocsChecklist"
import { HintPanel } from "@/components/playground/HintPanel"
import { ChallengeSidebarHeader } from "@/components/playground/ChallengeSidebarHeader"

const AUTOSAVE_DELAY_MS = 800

type DocumentationChallengeViewProps = {
  readonly title: string
  readonly template: DocsTemplateData
  readonly initialContent: string | null
  readonly slug: string
  readonly lang: string
  readonly playgroundPath: string
  readonly challengePath: string
  readonly dict: PlaygroundDict
}

export const DocumentationChallengeView = ({
  title,
  template,
  initialContent,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: DocumentationChallengeViewProps) => {
  const { hints } = template
  const originalContent = template.files[template.editableFile]?.code ?? ""
  const sourceFile = Object.entries(template.files).find(([, file]) => file.readOnly)
  const sourceFilename = sourceFile?.[0] ?? ""
  const sourceCode = sourceFile?.[1].code ?? ""
  // Criteria are imported client-side from the registry — never passed as props from the server
  // to avoid the "Functions cannot be passed to Client Components" constraint.
  const criteria = getDocsTemplateBySlug(slug)?.criteria ?? []

  const [content, setContent] = useState<string>(initialContent ?? originalContent)

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = useCallback(
    (newContent: string): void => {
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        void saveDocsState(slug, lang, newContent)
      }, AUTOSAVE_DELAY_MS)
    },
    [slug, lang]
  )

  const handleEditorChange = useCallback(
    (value: string | undefined): void => {
      if (value === undefined) return
      setContent(value)
      scheduleAutoSave(value)
    },
    [scheduleAutoSave]
  )

  const { isPending, handleSubmit } = useChallengeSubmit(async () => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    await saveDocsState(slug, lang, content)
    await completeTrackChallenge(slug, lang)
  })

  return (
    <ChallengeLayout
      containerClassName="flex min-h-0 w-full flex-1 flex-col px-4 pt-10 max-[900px]:flex-none max-[900px]:pb-10 max-[520px]:px-3"
      gridClassName="grid min-h-0 flex-1 grid-cols-[1fr_300px] grid-rows-1 gap-6 max-[900px]:grid-cols-1 max-[900px]:grid-rows-none"
      playgroundPath={playgroundPath}
      challengePath={challengePath}
      title={title}
      inProgressLabel={dict.status.inProgress}
      mainContent={
        <div className="grid min-h-0 min-w-0 grid-cols-[3fr_2fr] gap-3 max-[900px]:grid-cols-1 max-[900px]:gap-4 min-[901px]:pb-10">
          {/* GATEWAY.md — editable */}
          <div className="border-line flex min-h-100 flex-col overflow-hidden rounded-(--r-8) border">
            <div className="border-line bg-bg-elev flex shrink-0 items-center border-b px-4 py-2.5">
              <span className="text-fg-2 font-mono text-[12px]">{template.editableFile}</span>
            </div>
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                language="markdown"
                theme="ob-dark"
                path={`file:///${template.editableFile}`}
                value={content}
                onChange={handleEditorChange}
                beforeMount={configureMonaco}
                options={{
                  ...EDITOR_OPTIONS,
                  wordWrap: "on",
                }}
              />
            </div>
          </div>

          {/* src/request.ts — read-only reference */}
          <div className="border-line flex min-h-100 flex-col overflow-hidden rounded-(--r-8) border max-[900px]:min-h-70">
            <div className="border-line bg-bg-elev flex shrink-0 items-center gap-2 border-b px-4 py-2.5">
              <span className="text-fg-2 font-mono text-[12px]">{sourceFilename}</span>
              <span className="text-fg-faint rounded bg-transparent px-1.5 py-0.5 font-mono text-[10px] ring-1 ring-current">
                {dict.active.readOnlyLabel}
              </span>
            </div>
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                language="typescript"
                theme="ob-dark"
                path={`file:///${sourceFilename}`}
                value={sourceCode}
                beforeMount={configureMonaco}
                options={{
                  ...EDITOR_OPTIONS,
                  readOnly: true,
                  fontSize: 12,
                  lineHeight: 20,
                }}
              />
            </div>
          </div>
        </div>
      }
      sidebarContent={
        <aside className="max-[900px]:order-first">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 min-[901px]:pr-3 min-[901px]:pb-10">
              <ChallengeSidebarHeader
                title={title}
                challengePath={challengePath}
                exitLabel={dict.active.exitLabel}
              />

              <div className="border-line border-t" />

              <DocsChecklist
                criteria={criteria}
                content={content}
                isPending={isPending}
                dict={dict}
                onSubmit={handleSubmit}
              />

              <div className="border-line border-t" />

              <HintPanel
                hints={hints}
                revealLabel={dict.active.revealHint}
                hintsLabel={dict.active.hintsLabel}
              />
            </div>
          </ScrollArea>
        </aside>
      }
    />
  )
}
