import type { ReactElement, ReactNode } from "react"
import { PlaygroundBreadcrumb } from "./PlaygroundBreadcrumb"
import { pageShellClass } from "@/shared/PageShell"
import { cn } from "@/lib/utils"

type ChallengeLayoutProps = {
  readonly mainContent: ReactNode
  readonly sidebarContent: ReactNode
  readonly playgroundPath: string
  readonly challengePath: string
  readonly title: string
  readonly inProgressLabel: string
  readonly mainClassName?: string
  readonly containerClassName?: string
  readonly gridClassName?: string
}

const DEFAULT_MAIN_CLASS =
  "relative z-1 flex h-full flex-col overflow-hidden max-[900px]:h-auto max-[900px]:overflow-visible"
const DEFAULT_CONTAINER_CLASS = cn(
  pageShellClass("wide"),
  "flex min-h-0 flex-1 flex-col pt-10 max-[900px]:flex-none max-[900px]:pb-10"
)
const DEFAULT_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-[900px]:grid-cols-1"

export const ChallengeLayout = ({
  mainContent,
  sidebarContent,
  playgroundPath,
  challengePath,
  title,
  inProgressLabel,
  mainClassName = DEFAULT_MAIN_CLASS,
  containerClassName = DEFAULT_CONTAINER_CLASS,
  gridClassName = DEFAULT_GRID_CLASS,
}: ChallengeLayoutProps): ReactElement => (
  <main data-pg-main className={mainClassName}>
    <div className={containerClassName}>
      <PlaygroundBreadcrumb
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        title={title}
        inProgressLabel={inProgressLabel}
      />
      <div className={gridClassName}>
        {mainContent}
        {sidebarContent}
      </div>
    </div>
  </main>
)
