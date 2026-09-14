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
  "relative z-1 flex h-full flex-col overflow-hidden max-workspace:h-auto max-workspace:overflow-visible"
const DEFAULT_CONTAINER_CLASS = cn(
  pageShellClass("wide"),
  "flex min-h-0 flex-1 flex-col pt-10 max-workspace:flex-none max-workspace:pb-10"
)
const DEFAULT_GRID_CLASS =
  "grid min-h-0 flex-1 grid-cols-[1fr_340px] gap-10 max-workspace:grid-cols-1"

export const ChallengeLayout = ({
  mainContent,
  sidebarContent,
  playgroundPath,
  challengePath,
  title,
  inProgressLabel,
  mainClassName,
  containerClassName,
  gridClassName,
}: ChallengeLayoutProps): ReactElement => (
  <main data-pg-main className={cn(DEFAULT_MAIN_CLASS, mainClassName)}>
    <div className={cn(DEFAULT_CONTAINER_CLASS, containerClassName)}>
      <PlaygroundBreadcrumb
        playgroundPath={playgroundPath}
        challengePath={challengePath}
        title={title}
        inProgressLabel={inProgressLabel}
      />
      <div className={cn(DEFAULT_GRID_CLASS, gridClassName)}>
        {mainContent}
        {sidebarContent}
      </div>
    </div>
  </main>
)
