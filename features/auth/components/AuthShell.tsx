import type { ReactElement, ReactNode } from "react"

/**
 * The split both auth screens share: card on the left, story panel on the
 * right, and nothing but the card below 760px.
 *
 * `background` is injected rather than imported because the ambient graphic
 * lives in another feature and this one may not reach sideways for it.
 */
type AuthShellProps = {
  readonly background: ReactNode
  /** Hidden on phones — under the fold it only adds scrolling to a one-button page. */
  readonly panel: ReactNode
  readonly children: ReactNode
}

export const AuthShell = ({ background, panel, children }: AuthShellProps): ReactElement => (
  <main data-pg-main className="bg-bg text-fg relative min-h-dvh">
    {background}
    <div className="relative z-1 mx-auto grid min-h-dvh max-w-[1440px] grid-cols-[640px_minmax(0,1fr)] max-[1100px]:grid-cols-[minmax(0,520px)_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:px-6 max-[760px]:py-7">
      {children}
      <div className="auth-rise-late flex p-5 pl-0 max-[760px]:hidden">{panel}</div>
    </div>
  </main>
)
