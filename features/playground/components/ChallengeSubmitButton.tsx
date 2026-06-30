type ChallengeSubmitButtonProps = {
  readonly label: string
  readonly submittingLabel: string
  readonly disabled: boolean
  readonly isPending: boolean
  readonly onClick: () => void
}

export const ChallengeSubmitButton = ({
  label,
  submittingLabel,
  disabled,
  isPending,
  onClick,
}: ChallengeSubmitButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="bg-ob-accent text-accent-ink flex h-10 w-full items-center justify-center gap-2 rounded-(--r-8) font-mono text-[13.5px] font-medium transition-opacity disabled:opacity-40"
  >
    {isPending ? (
      <>
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {submittingLabel}
      </>
    ) : (
      label
    )}
  </button>
)
