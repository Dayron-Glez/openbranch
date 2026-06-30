"use client"

import { useCallback, useRef, useTransition } from "react"

export const useChallengeSubmit = (
  onSubmit: () => Promise<void>
): { isPending: boolean; handleSubmit: () => void } => {
  const [isPending, startTransition] = useTransition()
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit

  const handleSubmit = useCallback((): void => {
    startTransition(async () => {
      await onSubmitRef.current()
    })
  }, [startTransition])

  return { isPending, handleSubmit }
}
