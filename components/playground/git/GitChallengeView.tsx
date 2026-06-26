"use client"

import { useState, useCallback, useRef, useTransition } from "react"
import { saveGitState, completeGitChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { GitTemplate } from "@/lib/playground/git-templates/git-merge-conflict"
import type { GitBlockResolution } from "@/lib/playground/review-types"
import { PlaygroundBreadcrumb } from "@/components/playground/PlaygroundBreadcrumb"
import { useMergeEditor } from "./useMergeEditor"
import { useMergeRunner } from "./useMergeRunner"
import { MergeEditorPane } from "./MergeEditorPane"
import { GitFooterBar } from "./GitFooterBar"
import type { ThreeWayMergeEditorHandle } from "./ThreeWayMergeEditor"

const AUTOSAVE_DELAY_MS = 800
const AUTORUN_DELAY_MS = 1500

type GitChallengeViewProps = {
  title: string
  template: GitTemplate
  initialResolutions: readonly GitBlockResolution[] | null
  slug: string
  lang: string
  playgroundPath: string
  challengePath: string
  dict: PlaygroundDict
}

export const GitChallengeView = ({
  title,
  template,
  initialResolutions,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: Readonly<GitChallengeViewProps>) => {
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const resolvedInitially =
    initialResolutions?.filter((resolution) => resolution.resolution !== null).length ?? 0
  const [conflictsRemaining, setConflictsRemaining] = useState<number>(
    template.conflictCount - resolvedInitially
  )

  const codeRef = useRef<string>("")
  const resolutionsRef = useRef<readonly GitBlockResolution[]>(initialResolutions ?? [])
  const mergeEditorRef = useRef<ThreeWayMergeEditorHandle | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autorunTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { runnerState, runHiddenTests } = useMergeRunner({
    hiddenTests: template.hiddenTests,
    extraModules: template.extraModules,
  })

  const editor = useMergeEditor({ template, runHiddenTests })

  const scheduleAutoSave = useCallback((): void => {
    if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      void saveGitState(slug, lang, codeRef.current, resolutionsRef.current)
    }, AUTOSAVE_DELAY_MS)
  }, [slug, lang])

  const handleEditorChange = useCallback(
    (result: string, remaining: number): void => {
      codeRef.current = result
      setConflictsRemaining(remaining)
      scheduleAutoSave()
      if (remaining === 0) {
        if (autorunTimeoutRef.current !== null) clearTimeout(autorunTimeoutRef.current)
        autorunTimeoutRef.current = setTimeout(() => {
          runHiddenTests(codeRef.current)
        }, AUTORUN_DELAY_MS)
      }
    },
    [scheduleAutoSave, runHiddenTests]
  )

  const handleBlocksChange = useCallback(
    (newResolutions: readonly GitBlockResolution[]): void => {
      resolutionsRef.current = newResolutions
      scheduleAutoSave()
    },
    [scheduleAutoSave]
  )

  const handleToggleSolution = useCallback((): void => {
    setShowSolution((previous) => !previous)
  }, [])

  const handleSubmit = useCallback((): void => {
    startTransition(async () => {
      await saveGitState(slug, lang, codeRef.current, resolutionsRef.current)
      await completeGitChallenge(slug, lang)
    })
  }, [slug, lang])

  const handleReset = useCallback((): void => {
    setConflictsRemaining(template.conflictCount)
    mergeEditorRef.current?.reset()
  }, [template.conflictCount])

  const conflictsResolved = template.conflictCount - conflictsRemaining
  const hiddenTestsPassed = runnerState.results.filter((result) => result.passed).length
  const totalHiddenTests = runnerState.results.length
  const allHiddenTestsPass = totalHiddenTests > 0 && hiddenTestsPassed === totalHiddenTests

  const canSubmit = conflictsRemaining === 0 && editor.hasTypeErrors === false && allHiddenTestsPass

  const activeHints = template.hintsByLang?.[lang] ?? template.hints

  return (
    <main data-pg-main className="relative z-1 flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-7 pt-8 pb-3 max-[520px]:px-5">
        <PlaygroundBreadcrumb
          playgroundPath={playgroundPath}
          challengePath={challengePath}
          title={title}
          inProgressLabel={dict.status.inProgress}
        />
      </div>

      <div className="min-h-0 flex-1 px-7 max-[520px]:px-5">
        <MergeEditorPane
          template={template}
          showSolution={showSolution}
          isFormatting={editor.isFormatting}
          dict={dict}
          mergeEditorRef={mergeEditorRef}
          initialResolutions={initialResolutions ?? undefined}
          onFormat={() => {
            editor.handleFormat().catch(() => undefined)
          }}
          onToggleSolution={handleToggleSolution}
          onRun={() => runHiddenTests(codeRef.current)}
          onEditorChange={handleEditorChange}
          onBlocksChange={handleBlocksChange}
          onCenterMount={editor.handleEditorMount}
        />
      </div>

      <GitFooterBar
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
        onReset={handleReset}
      />
    </main>
  )
}
