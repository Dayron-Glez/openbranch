"use client"

import type React from "react"
import { useState, useCallback } from "react"
import type { InlineComment } from "@/lib/playground/review-types"

export type DiffLineType = "added" | "removed" | "context" | "hunk"

export type DiffLine = {
  readonly type: DiffLineType
  readonly content: string
}

export type DiffFile = {
  readonly filename: string
  readonly additions: number
  readonly deletions: number
  readonly lines: readonly DiffLine[]
}

type DiffViewerDict = {
  readonly addComment: string
  readonly cancelComment: string
  readonly deleteComment: string
  readonly commentPlaceholder: string
}

type DiffViewerProps = {
  readonly files: readonly DiffFile[]
  readonly comments: InlineComment[]
  readonly onAddComment: (comment: InlineComment) => void
  readonly onDeleteComment: (id: string) => void
  readonly dict: DiffViewerDict
}

const CommentIcon = (): React.ReactElement => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6A1.5 1.5 0 0 1 12.5 11H9l-3 3v-3H3.5A1.5 1.5 0 0 1 2 9.5v-6z" />
  </svg>
)

const TrashIcon = (): React.ReactElement => (
  <svg
    viewBox="0 0 16 16"
    className="size-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 4h11M6 4V2.5h4V4M5 4l.5 9.5h5L11 4" />
  </svg>
)

type DiffCommentItemProps = {
  readonly comment: InlineComment
  readonly onDelete: (id: string) => void
  readonly deleteLabel: string
}

const DiffCommentItem = ({
  comment,
  onDelete,
  deleteLabel,
}: DiffCommentItemProps): React.ReactElement => (
  <div className="border-line border-ob-accent/40 bg-ob-accent/[0.04] group/comment flex items-start gap-3 border-l-2 px-4 py-2.5">
    <p className="text-fg-2 flex-1 font-mono text-[12px] leading-[1.6] whitespace-pre-wrap">
      {comment.content}
    </p>
    <button
      onClick={() => onDelete(comment.id)}
      className="text-fg-faint hover:text-danger mt-0.5 shrink-0 opacity-0 transition-all group-hover/comment:opacity-100"
      aria-label={deleteLabel}
      type="button"
    >
      <TrashIcon />
    </button>
  </div>
)

const BG_CLASS: Partial<Record<DiffLineType, string>> = {
  added: "bg-ob-accent/[0.07]",
  removed: "bg-danger/[0.07]",
}

const PREFIX_COLOR_CLASS: Partial<Record<DiffLineType, string>> = {
  added: "text-ob-accent",
  removed: "text-danger",
}

const PREFIX_CHAR: Partial<Record<DiffLineType, string>> = {
  added: "+",
  removed: "-",
}

export const DiffViewer = ({
  files,
  comments,
  onAddComment,
  onDeleteComment,
  dict,
}: DiffViewerProps): React.ReactElement => {
  const [openFormKey, setOpenFormKey] = useState<string | null>(null)
  const [inputText, setInputText] = useState<string>("")

  const handleToggleForm = useCallback(
    (key: string): void => {
      setOpenFormKey(openFormKey === key ? null : key)
      setInputText("")
    },
    [openFormKey]
  )

  const handleAddComment = useCallback(
    (filename: string, lineIndex: number): void => {
      if (!inputText.trim()) return
      onAddComment({
        id: `${filename}-${lineIndex}-${Date.now()}`,
        filename,
        lineIndex,
        content: inputText.trim(),
      })
      setOpenFormKey(null)
      setInputText("")
    },
    [inputText, onAddComment]
  )

  return (
    <div className="flex flex-col gap-4">
      {files.map((file) => (
        <div
          key={file.filename}
          className="border-line overflow-hidden rounded-[var(--r-8)] border"
        >
          {/* file header */}
          <div className="border-line bg-bg-elev flex items-center justify-between gap-4 border-b px-4 py-2.5">
            <span className="text-fg-2 truncate font-mono text-[12px]">{file.filename}</span>
            <span className="flex shrink-0 items-center gap-2.5 font-mono text-[11.5px]">
              <span className="text-ob-accent">+{file.additions}</span>
              <span className="text-danger">−{file.deletions}</span>
            </span>
          </div>

          {/* lines */}
          <div className="bg-bg-card overflow-x-auto">
            {file.lines.map((line, lineIndex) => {
              const lineKey = `${file.filename}::${lineIndex}`
              const isFormOpen = openFormKey === lineKey
              const lineComments = comments.filter(
                (c) => c.filename === file.filename && c.lineIndex === lineIndex
              )

              if (line.type === "hunk") {
                return (
                  <div
                    key={lineKey}
                    className="border-line bg-bg-elev text-fg-muted border-y px-4 py-0.5 font-mono text-[11.5px] select-none"
                  >
                    {line.content}
                  </div>
                )
              }

              const bgClass = BG_CLASS[line.type] ?? ""
              const prefixColorClass = PREFIX_COLOR_CLASS[line.type] ?? "text-fg-faint"
              const prefix = PREFIX_CHAR[line.type] ?? " "

              return (
                <div key={lineKey}>
                  {/* code line */}
                  <div
                    className={`group/line flex font-mono text-[12.5px] leading-[1.75] ${bgClass}`}
                  >
                    <div className="relative flex w-8 shrink-0 items-center justify-center">
                      <span
                        className={`text-center text-[12.5px] transition-opacity select-none group-hover/line:opacity-0 ${prefixColorClass}`}
                      >
                        {prefix}
                      </span>
                      <button
                        className="text-fg-muted hover:text-ob-accent absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/line:opacity-100"
                        onClick={() => handleToggleForm(lineKey)}
                        aria-label={dict.addComment}
                        type="button"
                      >
                        <CommentIcon />
                      </button>
                    </div>
                    <span className="text-fg-2 flex-1 pr-4 whitespace-pre">{line.content}</span>
                  </div>

                  {/* existing comments for this line */}
                  {lineComments.map((comment) => (
                    <DiffCommentItem
                      key={comment.id}
                      comment={comment}
                      onDelete={onDeleteComment}
                      deleteLabel={dict.deleteComment}
                    />
                  ))}

                  {/* comment form */}
                  {isFormOpen && (
                    <div className="border-line border-ob-accent/50 border-l-2 px-4 py-3">
                      <textarea
                        className="border-line focus:border-ob-accent/50 bg-bg-elev text-fg-2 placeholder:text-fg-muted w-full resize-y rounded-[var(--r-8)] border p-2.5 font-mono text-[12.5px] leading-[1.6] outline-none"
                        placeholder={dict.commentPlaceholder}
                        value={inputText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setInputText(e.target.value)
                        }
                        rows={3}
                        autoFocus
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                          if (e.key === "Escape") {
                            setOpenFormKey(null)
                            setInputText("")
                          }
                        }}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenFormKey(null)
                            setInputText("")
                          }}
                          className="text-fg-muted hover:text-fg-2 px-3 py-1.5 font-mono text-[12px] transition-colors duration-(--d-fast) ease-(--ease)"
                        >
                          {dict.cancelComment}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddComment(file.filename, lineIndex)}
                          disabled={!inputText.trim()}
                          className="bg-ob-accent text-accent-ink rounded-[var(--r-8)] px-3 py-1.5 font-mono text-[12px] font-medium transition-opacity disabled:opacity-40"
                        >
                          {dict.addComment}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
