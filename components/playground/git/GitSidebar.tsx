import Link from "next/link"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import { HintPanel } from "@/components/playground/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"
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
}: Readonly<GitSidebarProps>) => {
  const showClean = canSubmit

  return (
    <aside className="max-[900px]:order-first">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-6 min-[901px]:pr-3 min-[901px]:pb-10">
          <div>
            <h1 className="text-fg mb-2 text-[20px] leading-[1.2] font-medium tracking-[-0.02em]">
              {title}
            </h1>
            <Link
              href={challengePath}
              className="text-fg-muted hover:text-fg-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] transition-colors duration-(--d-fast) ease-(--ease)"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-3 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 3L5 8l5 5" />
              </svg>
              {dict.active.exitLabel}
            </Link>
          </div>

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

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isPending}
            className="bg-ob-accent text-accent-ink flex h-10 w-full items-center justify-center gap-2 rounded-(--r-8) font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
          >
            {isPending ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {dict.active.submitting}
              </>
            ) : (
              dict.active.submitMerge
            )}
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
