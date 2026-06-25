import type React from "react"
import Link from "next/link"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { TestRunState } from "@/components/playground/TestCard"
import { HintPanel } from "@/components/playground/HintPanel"
import { ScrollArea } from "@/components/ui/scroll-area"
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
              dict.active.submitTests
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
