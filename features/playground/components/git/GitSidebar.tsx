import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { HintPanel } from "@/features/playground/components/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChallengeSidebarHeader } from "@/features/playground/components/ChallengeSidebarHeader"
import { ChallengeSubmitButton } from "@/features/playground/components/ChallengeSubmitButton"
import { MergeGatesPanel } from "./MergeGatesPanel"

type GitSidebarProps = {
  title: string
  challengePath: string
  hints: string[]
  conflictsResolved: number
  totalConflicts: number
  hasTypeErrors: boolean
  hiddenTestsPassed: number
  totalHiddenTests: number
  isRunning: boolean
  canSubmit: boolean
  isPending: boolean
  dict: PlaygroundDict
  onSubmit: () => void
  onReset: () => void
}

export const GitSidebar = ({
  title,
  challengePath,
  hints,
  conflictsResolved,
  totalConflicts,
  hasTypeErrors,
  hiddenTestsPassed,
  totalHiddenTests,
  isRunning,
  canSubmit,
  isPending,
  dict,
  onSubmit,
  onReset,
}: Readonly<GitSidebarProps>) => {
  const showClean = canSubmit

  return (
    <aside className="max-workspace:order-first">
      <ScrollArea className="h-full">
        <div className="workspace:pr-3 workspace:pb-10 flex flex-col gap-6">
          <ChallengeSidebarHeader
            title={title}
            challengePath={challengePath}
            exitLabel={dict.active.exitLabel}
          />

          <div className="border-line border-t" />

          <MergeGatesPanel
            conflictsResolved={conflictsResolved}
            totalConflicts={totalConflicts}
            hasTypeErrors={hasTypeErrors}
            hiddenTestsPassed={hiddenTestsPassed}
            totalHiddenTests={totalHiddenTests}
            isRunning={isRunning}
            dict={dict}
          />

          {showClean && (
            <div className="ob-rise border-accent-ring bg-accent-soft rounded-(--r-8) border px-3 py-2.5">
              <p className="text-ob-accent font-mono text-[12px]">{dict.active.mergeClean}</p>
            </div>
          )}

          <ChallengeSubmitButton
            label={dict.active.submitMerge}
            submittingLabel={dict.active.submitting}
            disabled={!canSubmit || isPending}
            isPending={isPending}
            onClick={onSubmit}
          />

          <button
            type="button"
            onClick={onReset}
            className="text-fg-muted hover:text-fg-2 font-mono text-[12px] transition-colors"
          >
            {dict.active.resetCode}
          </button>

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
