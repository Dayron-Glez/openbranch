"use client"

import type React from "react"
import { useState, useRef, useMemo, useCallback, useTransition } from "react"
import { saveTestingState, completeTestingChallenge } from "@/app/actions/playground"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { TestingTemplate } from "@/lib/playground/sandpack-templates/testing-fetchupstream"
import { PlaygroundBreadcrumb } from "@/components/playground/PlaygroundBreadcrumb"
import type { LocalizedMutant } from "./types"
import { useTestingRunner } from "./useTestingRunner"
import { useTestingEditor } from "./useTestingEditor"
import { EditorPane } from "./EditorPane"
import { TestingSidebar } from "./TestingSidebar"

type TestingChallengeViewProps = {
  title: string
  template: TestingTemplate
  initialTestCode: string | null
  slug: string
  lang: string
  playgroundPath: string
  challengePath: string
  dict: PlaygroundDict
}

export const TestingChallengeView = ({
  title,
  template,
  initialTestCode,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: Readonly<TestingChallengeViewProps>): React.ReactElement => {
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<"test" | "source">("test")
  const [isPending, startTransition] = useTransition()

  const showSolutionRef = useRef<boolean>(false)
  showSolutionRef.current = showSolution

  const localizedMutants = useMemo<readonly LocalizedMutant[]>(
    () =>
      template.mutants.map((mutant) => ({
        id: mutant.id,
        label: mutant.labelByLang?.[lang] ?? mutant.label,
        code: mutant.code,
      })),
    [template.mutants, lang]
  )

  const { testState, mutations, runTests } = useTestingRunner({
    correctSource: template.correctSource,
    mutants: localizedMutants,
    showSolutionRef,
  })

  const editor = useTestingEditor({
    template,
    slug,
    lang,
    initialTestCode,
    runTests,
    showSolutionRef,
  })

  const handleToggleSolution = useCallback((): void => {
    setShowSolution((prev) => {
      const next = !prev
      if (!next) runTests(editor.testCodeRef.current)
      return next
    })
  }, [editor, runTests])

  const handleSubmit = useCallback((): void => {
    startTransition(async () => {
      await saveTestingState(slug, lang, editor.testCodeRef.current)
      await completeTestingChallenge(slug, lang)
    })
  }, [slug, lang, editor.testCodeRef])

  const killedCount = mutations.filter((mutation) => mutation.killed).length
  const allMutantsKilled = mutations.length > 0 && killedCount === mutations.length
  const enoughTests = testState.totalCount >= template.minTests
  const canSubmit = testState.status === "pass" && enoughTests && allMutantsKilled
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
          <EditorPane
            template={template}
            testCode={editor.testCode}
            activeTab={activeTab}
            showSolution={showSolution}
            isFormatting={editor.isFormatting}
            dict={dict}
            onSelectTab={setActiveTab}
            onFormat={() => {
              editor.handleFormat().catch(() => undefined)
            }}
            onToggleSolution={handleToggleSolution}
            onRun={() => runTests(editor.testCodeRef.current)}
            onEditorChange={editor.handleEditorChange}
            onEditorMount={editor.handleEditorMount}
          />

          <TestingSidebar
            title={title}
            challengePath={challengePath}
            hints={activeHints}
            testState={testState}
            mutations={mutations}
            killedCount={killedCount}
            allMutantsKilled={allMutantsKilled}
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
