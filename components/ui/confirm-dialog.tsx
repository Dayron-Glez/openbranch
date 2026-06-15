"use client"

import type React from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-bg-card border-line-2 w-[480px] max-w-[calc(100vw-2rem)] gap-0 rounded-[var(--r-16)] p-0 shadow-[var(--sh-4)]">
      <div className="px-8 pt-8 pb-7">
        {icon !== undefined && <div className="mb-5 flex justify-center">{icon}</div>}
        <DialogTitle className="text-fg mb-2.5 text-center text-[19px] font-[550] tracking-[-0.02em]">
          {title}
        </DialogTitle>
        <DialogDescription className="text-fg-2 mb-7 text-center text-[13.5px] leading-[1.6]">
          {description}
        </DialogDescription>
        <div className="flex gap-2.5">
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="border-line h-10 flex-1 rounded-[var(--r-8)] border text-[13px]"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-ob-accent text-accent-ink h-10 flex-1 rounded-[var(--r-8)] text-[13px] font-medium hover:brightness-105 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
)
