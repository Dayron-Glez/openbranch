import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

type StatusBannersProps = {
  readonly canSubmit: boolean
  readonly baselineAllPass: boolean
  readonly hasRun: boolean
  readonly hasTypeErrors: boolean
  readonly dict: PlaygroundDict
}

const successClass = "border-accent-ring bg-accent-soft rounded-(--r-8) border px-3 py-2.5"
const warnClass = "rounded-(--r-8) border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5"

export const StatusBanners = ({
  canSubmit,
  baselineAllPass,
  hasRun,
  hasTypeErrors,
  dict,
}: StatusBannersProps): React.ReactElement => {
  const showNeedMore = !canSubmit && baselineAllPass && hasRun && !hasTypeErrors

  return (
    <>
      {canSubmit && (
        <div className={successClass}>
          <p className="text-ob-accent font-mono text-[12px]">{dict.active.allRegressionsCaught}</p>
        </div>
      )}
      {showNeedMore && (
        <div className={warnClass}>
          <p className="font-mono text-[12px] text-amber-400">{dict.active.needMoreTests}</p>
        </div>
      )}
      {hasTypeErrors && (
        <div className={warnClass}>
          <p className="font-mono text-[12px] text-amber-400">{dict.active.fixTypeErrors}</p>
        </div>
      )}
    </>
  )
}
