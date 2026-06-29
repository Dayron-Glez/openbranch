import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { TestRunState } from "@/components/playground/TestCard"
import { HintPanel } from "@/components/playground/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChallengeSidebarHeader } from "@/components/playground/ChallengeSidebarHeader"
import { ChallengeSubmitButton } from "@/components/playground/ChallengeSubmitButton"
import type { MutationResult } from "./types"
import { TestsPanel } from "./TestsPanel"
import { RegressionsPanel } from "./RegressionsPanel"
import { StatusBanners } from "./StatusBanners"

type TestingSidebarProps = {
  readonly title: string
  readonly challengePath: string
  readonly hints: readonly string[]
  readonly testState: TestRunState
  readonly mutations: readonly MutationResult[]
  readonly killedCount: number
  readonly allMutantsKilled: boolean
  readonly canSubmit: boolean
  readonly isPending: boolean
  readonly dict: PlaygroundDict
  readonly onSubmit: () => void
}

export const TestingSidebar = ({
  title,
  challengePath,
  hints,
  testState,
  mutations,
  killedCount,
  allMutantsKilled,
  canSubmit,
  isPending,
  dict,
  onSubmit,
}: TestingSidebarProps): React.ReactElement => {
  const hasRun = testState.tests.length > 0 || mutations.length > 0
  const baselineAllPass = testState.status === "pass"
  const isRunning = testState.status === "running"

  return (
    <aside className="max-[900px]:order-first">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-6 min-[901px]:pr-3 min-[901px]:pb-10">
          <ChallengeSidebarHeader
            title={title}
            challengePath={challengePath}
            exitLabel={dict.active.exitLabel}
          />

          <div className="border-line border-t" />

          <TestsPanel testState={testState} hasRun={hasRun} dict={dict} />

          {!isRunning && mutations.length > 0 && (
            <RegressionsPanel
              mutations={mutations}
              killedCount={killedCount}
              allMutantsKilled={allMutantsKilled}
              dict={dict}
            />
          )}

          <StatusBanners
            canSubmit={canSubmit}
            baselineAllPass={baselineAllPass}
            hasRun={hasRun}
            dict={dict}
          />

          <ChallengeSubmitButton
            label={dict.active.submitTests}
            submittingLabel={dict.active.submitting}
            disabled={!canSubmit || isPending}
            isPending={isPending}
            onClick={onSubmit}
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
  )
}
