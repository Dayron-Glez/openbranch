"use client"

import type React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/**
 * The single confirmation surface in the app. Built on Radix's AlertDialog
 * rather than Dialog because that is what a confirmation is: it takes
 * `role="alertdialog"`, focuses Cancel first, and — unlike Dialog — does not
 * dismiss on an outside click, so a stray click cannot silently answer the
 * question.
 *
 * The props are deliberately the same as the Dialog-based version this
 * replaced, so existing call sites did not have to change.
 */
type ConfirmDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly icon?: React.ReactNode
  readonly title: string
  readonly description: string
  readonly confirmLabel: string
  readonly cancelLabel: string
  readonly onConfirm: () => void
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmDialogProps): React.ReactElement => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="bg-bg-card border-line-2 w-[480px] max-w-[calc(100vw-2rem)] gap-0 rounded-(--r-16) p-0 shadow-(--sh-4)">
      <div className="px-8 pt-8 pb-7">
        {icon !== undefined && <div className="mb-5 flex justify-center">{icon}</div>}
        <AlertDialogTitle className="text-fg mb-2.5 text-center text-[19px] font-[550] tracking-[-0.02em]">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-fg-2 mb-7 text-center text-[13.5px] leading-[1.6]">
          {description}
        </AlertDialogDescription>
        <div className="flex gap-2.5">
          <AlertDialogCancel className="border-line bg-bg-elev text-fg-2 hover:text-fg m-0 h-10 flex-1 rounded-(--r-8) border text-[13px]">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-ob-accent text-accent-ink h-10 flex-1 rounded-(--r-8) text-[13px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {confirmLabel}
          </AlertDialogAction>
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>
)
