"use client"

import type React from "react"
import { useState, useTransition, useRef, useCallback } from "react"
import Link from "next/link"
import { saveReviewState, completeChallenge } from "@/app/actions/playground"
import type { InlineComment, ReviewDecision } from "@/lib/playground/review-types"
import type { PlaygroundDict } from "@/lib/playground-dictionary"
import type { DiffFile } from "@/components/playground/DiffViewer"
import { DiffViewer } from "@/components/playground/DiffViewer"
import { ReviewPanel } from "@/components/playground/ReviewPanel"

const AUTOSAVE_DELAY_MS = 800

type ActiveChallengeViewProps = {
  readonly title: string
  readonly diffFiles: readonly DiffFile[] | null
  readonly initialComments: InlineComment[]
  readonly initialDecision: ReviewDecision
  readonly slug: string
  readonly lang: string
  readonly playgroundPath: string
  readonly challengePath: string
  readonly dict: PlaygroundDict
}

export const ActiveChallengeView = ({
  title,
  diffFiles,
  initialComments,
  initialDecision,
  slug,
  lang,
  playgroundPath,
  challengePath,
  dict,
}: ActiveChallengeViewProps): React.ReactElement => {
  const [comments, setComments] = useState<InlineComment[]>(initialComments)
  const [decision, setDecision] = useState<ReviewDecision>(initialDecision)
  const [isPending, startTransition] = useTransition()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleAutoSave = useCallback(
    (updatedComments: InlineComment[], updatedDecision: ReviewDecision): void => {
      if (saveTimeoutRef.current !== null) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        void saveReviewState(slug, lang, updatedComments, updatedDecision)
      }, AUTOSAVE_DELAY_MS)
    },
    [slug, lang]
  )

  const handleAddComment = useCallback(
    (comment: InlineComment): void => {
      const updated = [...comments, comment]
      setComments(updated)
      scheduleAutoSave(updated, decision)
    },
    [comments, decision, scheduleAutoSave]
  )

  const handleDeleteComment = useCallback(
    (id: string): void => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      const updated = comments.filter((c) => c.id !== id)
      setComments(updated)
      void saveReviewState(slug, lang, updated, decision)
    },
    [comments, decision, slug, lang]
  )

  const handleDecisionChange = useCallback(
    (newDecision: ReviewDecision): void => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      setDecision(newDecision)
      void saveReviewState(slug, lang, comments, newDecision)
    },
    [comments, slug, lang]
  )

  const handleSubmit = useCallback((): void => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    startTransition(async () => {
      await saveReviewState(slug, lang, comments, decision)
      await completeChallenge(slug, lang)
    })
  }, [slug, lang, comments, decision])

  return (
    <main
      data-pg-main
      className="relative z-1 flex h-[calc(100dvh-60px)] flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-[1320px] flex-1 flex-col px-7 pt-10 max-[900px]:flex-none max-[900px]:pb-10 max-[520px]:px-5">
        {/* breadcrumb */}
        <nav className="mb-[22px] shrink-0" aria-label="Breadcrumb">
          <ol className="text-fg-muted flex items-center gap-2 font-mono text-[12px]">
            <li>
              <Link href={playgroundPath} className="hover:text-fg-2 transition-colors">
                Playground
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <Link href={challengePath} className="hover:text-fg-2 transition-colors">
                {title}
              </Link>
            </li>
            <li className="text-fg-faint" aria-hidden="true">
              /
            </li>
            <li>
              <span className="inline-flex items-center gap-1.5 text-amber-400">
                <span className="size-[6px] rounded-full bg-amber-400" />
                {dict.status.inProgress}
              </span>
            </li>
          </ol>
        </nav>

        {/* two-column layout */}
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-[900px]:grid-cols-1">
          {/* ── left column: diff viewer ── */}
          <div className="min-w-0 min-[901px]:overflow-y-auto min-[901px]:pb-10">
            {diffFiles !== null ? (
              <DiffViewer
                files={diffFiles}
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                dict={{
                  addComment: dict.active.addComment,
                  cancelComment: dict.active.cancelComment,
                  deleteComment: dict.active.deleteComment,
                  commentPlaceholder: dict.active.commentPlaceholder,
                }}
              />
            ) : (
              <div className="border-line bg-bg-elev flex h-full min-h-[200px] items-center justify-center rounded-[var(--r-12)] border border-dashed">
                <p className="text-fg-muted font-mono text-[12px]">Diff not available</p>
              </div>
            )}
          </div>

          {/* ── right column: review panel ── */}
          <aside className="max-[900px]:order-first min-[901px]:overflow-y-auto min-[901px]:pb-10">
            <div className="flex flex-col gap-6">
              {/* title + exit */}
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

              <ReviewPanel
                commentsCount={comments.length}
                decision={decision}
                onDecisionChange={handleDecisionChange}
                onSubmit={handleSubmit}
                isPending={isPending}
                dict={{
                  submitButton: dict.active.submitButton,
                  decisionLabel: dict.active.decisionLabel,
                  decisionApprove: dict.active.decisionApprove,
                  decisionComment: dict.active.decisionComment,
                  decisionRequestChanges: dict.active.decisionRequestChanges,
                  commentSingular: dict.active.commentSingular,
                  commentPlural: dict.active.commentPlural,
                  noComments: dict.active.noComments,
                  submitRequirements: dict.active.submitRequirements,
                }}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
