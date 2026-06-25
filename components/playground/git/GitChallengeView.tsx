"use client"

import { useState, useCallback, useTransition } from "react"
import { saveGitState, completeGitChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { GitTemplate } from "@/lib/playground/git-templates/git-merge-conflict"
import { PlaygroundBreadcrumb } from "@/components/playground/PlaygroundBreadcrumb"
import { useMergeEditor } from "./useMergeEditor"
import { useMergeRunner } from "./useMergeRunner"
import { MergeEditorPane } from "./MergeEditorPane"
import { GitSidebar } from "./GitSidebar"
import type { MergeTab } from "./MergeEditorToolbar"

type GitChallengeViewProps = {
  title: string
  template: GitTemplate
  initialCode: string | null
  slug: string
  lang: string
  playgroundPath: string
  challengePath: string
  dict: PlaygroundDict
}

export const GitChallengeView = ({
  title,
  template,
  initialCode,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: Readonly<GitChallengeViewProps>) => {
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<MergeTab>("merged")
  const [isPending, startTransition] = useTransition()

  const { runnerState, runHiddenTests } = useMergeRunner({
    hiddenTests: template.hiddenTests,
    extraModules: template.extraModules,
  })

  const editor = useMergeEditor({
    template,
    slug,
    lang,
    initialCode,
    runHiddenTests,
  })

  const handleToggleSolution = useCallback((): void => {
    setShowSolution((prev) => !prev)
  }, [])

  const handleSubmit = useCallback((): void => {
    startTransition(async () => {
      await saveGitState(slug, lang, editor.codeRef.current)
      await completeGitChallenge(slug, lang)
    })
  }, [slug, lang, editor.codeRef])

  const conflictsResolved = template.conflictCount - editor.conflictsRemaining
  const hiddenTestsPassed = runnerState.results.filter((result) => result.passed).length
  const totalHiddenTests = runnerState.results.length
  const allHiddenTestsPass = totalHiddenTests > 0 && hiddenTestsPassed === totalHiddenTests

  const canSubmit = editor.conflictsRemaining === 0 && !editor.hasTypeErrors && allHiddenTestsPass

  const activeHints = template.hintsByLang?.[lang] ?? template.hints

  return (
    <main
      data-pg-main
      className="relative z-1 flex h-full flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-330 flex-1 flex-col px-7 pt-10 max-[900px]:flex-none max-[900px]:pb-10 max-[520px]:px-5">
        <PlaygroundBreadcrumb
          playgroundPath={playgroundPath}
          challengePath={challengePath}
          title={title}
          inProgressLabel={dict.status.inProgress}
        />

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] grid-rows-1 gap-10 max-[900px]:grid-cols-1 max-[900px]:grid-rows-none">
          <MergeEditorPane
            template={template}
            code={editor.code}
            activeTab={activeTab}
            showSolution={showSolution}
            isFormatting={editor.isFormatting}
            dict={dict}
            onSelectTab={setActiveTab}
            onFormat={() => {
              editor.handleFormat().catch(() => undefined)
            }}
            onToggleSolution={handleToggleSolution}
            onRun={() => runHiddenTests(editor.codeRef.current)}
            onEditorChange={editor.handleEditorChange}
            onEditorMount={editor.handleEditorMount}
          />

          <GitSidebar
            title={title}
            challengePath={challengePath}
            hints={activeHints}
            conflictsResolved={conflictsResolved}
            totalConflicts={template.conflictCount}
            hasTypeErrors={editor.hasTypeErrors}
            hiddenTestsPassed={hiddenTestsPassed}
            totalHiddenTests={totalHiddenTests > 0 ? totalHiddenTests : template.hiddenTestCount}
            isRunning={runnerState.status === "running"}
            canSubmit={canSubmit}
            isPending={isPending}
            dict={dict}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  )
}
