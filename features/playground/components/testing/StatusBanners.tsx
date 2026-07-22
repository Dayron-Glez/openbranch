import type React from "react"
import type { PlaygroundDict } from "@/lib/playground-dictionary"

type StatusBannersProps = {
  readonly canSubmit: boolean
  readonly baselineAllPass: boolean
  readonly hasRun: boolean
  readonly dict: PlaygroundDict
}

const successClass = "ob-rise border-accent-ring bg-accent-soft rounded-(--r-8) border px-3 py-2.5"
const warnClass = "ob-rise border-warn/20 bg-warn/[0.04] rounded-(--r-8) border px-3 py-2.5"

export const StatusBanners = ({
  canSubmit,
  baselineAllPass,
  hasRun,
  dict,
}: StatusBannersProps): React.ReactElement => {
  const showNeedMore = !canSubmit && baselineAllPass && hasRun

  return (
    <>
      {canSubmit && (
        <div className={successClass}>
          <p className="text-ob-accent font-mono text-[12px]">{dict.active.allRegressionsCaught}</p>
        </div>
      )}
      {showNeedMore && (
        <div className={warnClass}>
          <p className="text-warn font-mono text-[12px]">{dict.active.needMoreTests}</p>
        </div>
      )}
    </>
  )
}
