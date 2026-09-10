import type { ReactNode } from "react"

type WorkspaceOnlyProps = {
  /** Rendered at >= WORKSPACE_MIN_WIDTH (see shared/viewport.ts). */
  readonly wide: ReactNode
  /** Rendered below WORKSPACE_MIN_WIDTH. */
  readonly narrow: ReactNode
}

/**
 * Pure CSS, so no client component and no hydration flash. A `display:none`
 * element is out of the a11y tree and unclickable, so this both informs and
 * prevents in one pass.
 *
 * The wide branch must keep `h-full`: it sits between the app shell's scroll
 * container and a workspace `<main class="h-full">`, and an auto-height wrapper
 * breaks that percentage chain, collapsing every editor to content height.
 */
export const WorkspaceOnly = ({ wide, narrow }: WorkspaceOnlyProps): ReactNode => (
  <>
    <div className="max-workspace:hidden h-full">{wide}</div>
    <div className="max-workspace:block hidden">{narrow}</div>
  </>
)
