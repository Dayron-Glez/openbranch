import type { ReactNode } from "react"

type WorkspaceOnlyProps = {
  /** Rendered at >= WORKSPACE_MIN_WIDTH (see shared/viewport.ts). */
  readonly wide: ReactNode
  /** Rendered below WORKSPACE_MIN_WIDTH — e.g. NeedsWiderScreenNote. */
  readonly narrow: ReactNode
}

/**
 * Twin-node viewport gate: pure CSS, no client component, no hydration
 * flash. A `display:none` element is out of the a11y tree and unclickable,
 * so this both informs and prevents in one pass.
 */
export const WorkspaceOnly = ({ wide, narrow }: WorkspaceOnlyProps): ReactNode => (
  <>
    <div className="max-workspace:hidden">{wide}</div>
    <div className="max-workspace:block hidden">{narrow}</div>
  </>
)
