"use client"

import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { TrackColorToken } from "@/features/playground/domain/manifest"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconLayoutGrid } from "@/icons"

type FilterCategory = {
  readonly key: string
  readonly label: string
  readonly count: number
  readonly icon: ReactNode
  readonly colorToken: TrackColorToken
}

type SortDict = {
  readonly label: string
  readonly recommended: string
  readonly difficulty: string
  readonly duration: string
  readonly sortAsc: string
  readonly sortDesc: string
}

type FilterBarProps = {
  readonly basePath: string
  readonly active: string | undefined
  readonly activeSort: string
  readonly categories: ReadonlyArray<FilterCategory>
  readonly total: number
  readonly allLabel: string
  readonly sortDict: SortDict
}

const SORT_KEYS = [
  "recommended",
  "difficulty-asc",
  "difficulty-desc",
  "duration-asc",
  "duration-desc",
] as const
type SortKey = (typeof SORT_KEYS)[number]

type SliderRect = {
  readonly left: number
  readonly width: number
}

/** `null` is the "all categories" row, which has no track colour of its own. */
type DotToken = TrackColorToken | null

/**
 * `pl-2.5` replaces the base `pl-8` that reserves room for Radix's checked dot,
 * and `[&>span:first-child]:hidden` drops that dot: it is absolutely positioned
 * at `left-2`, a different column from our own, so the selected row read as
 * misaligned. `size-4` normalises Tabler icons, which ship width/height="24".
 */
const MENU_ROW_CLASS =
  "grid grid-cols-[8px_16px_1fr_auto] items-center gap-2.5 pl-2.5 data-[state=checked]:text-fg [&>span:first-child]:hidden [&_svg]:size-4 [&_svg]:shrink-0"

const dotToneClass = (colorToken: DotToken, active: boolean): string => {
  if (colorToken === null) return "bg-fg-muted shadow-[0_0_0_3px_var(--color-bg-hover)]"
  if (active) return "bg-(--track) shadow-[0_0_0_3px_var(--track-soft),0_0_8px_var(--track-soft)]"
  return "bg-(--track) shadow-[0_0_0_3px_var(--track-soft)]"
}

/**
 * The single dot every filter row carries. Radix's own checked-state dot is
 * hidden in the menu (it sits in a different column and reads as a misaligned
 * second dot), so this one shows selection via the same glow the tabs use.
 */
const FilterDot = ({
  colorToken,
  active,
}: {
  readonly colorToken: DotToken
  readonly active: boolean
}): ReactNode => (
  <span
    data-track={colorToken ?? undefined}
    aria-hidden="true"
    className={`size-2 shrink-0 self-center rounded-full transition-shadow duration-(--d-base) ease-(--ease) ${dotToneClass(colorToken, active)}`}
  />
)

export const FilterBar = ({
  basePath,
  active,
  activeSort,
  categories,
  total,
  allLabel,
  sortDict,
}: FilterBarProps) => {
  const router = useRouter()
  const value = active ?? "all"
  const tabListRef = useRef<HTMLDivElement>(null)
  const [sliderRect, setSliderRect] = useState<SliderRect | null>(null)

  const measureSlider = (): void => {
    const list = tabListRef.current
    if (list === null) return
    const activeTab = list.querySelector<HTMLElement>('[data-state="active"]')
    if (activeTab === null) return
    setSliderRect({ left: activeTab.offsetLeft, width: activeTab.offsetWidth })
  }

  // The sliding indicator mirrors Radix's own active-trigger layout, so it has to
  // read real DOM measurements back out after each render rather than derive from props.
  useLayoutEffect(() => {
    measureSlider()
  }, [value])

  useLayoutEffect(() => {
    window.addEventListener("resize", measureSlider)
    return () => window.removeEventListener("resize", measureSlider)
  }, [])

  const buildUrl = (category: string | undefined, sort: string): string => {
    const params = new URLSearchParams()
    if (category !== undefined && category !== "all") params.set("category", category)
    if (sort !== "recommended") params.set("sort", sort)
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  const handleValueChange = (val: string): void => {
    router.push(buildUrl(val === "all" ? undefined : val, activeSort), { scroll: false })
  }

  const handleSortChange = (sort: string): void => {
    router.push(buildUrl(active, sort), { scroll: false })
  }

  const currentSort = (SORT_KEYS as ReadonlyArray<string>).includes(activeSort)
    ? (activeSort as SortKey)
    : "recommended"

  const getActiveField = (): "recommended" | "difficulty" | "duration" => {
    if (currentSort === "recommended") return "recommended"
    if (currentSort.startsWith("difficulty")) return "difficulty"
    return "duration"
  }
  const activeField = getActiveField()

  const activeDir: "asc" | "desc" = currentSort.endsWith("-desc") ? "desc" : "asc"

  const fieldLabel: Record<string, string> = {
    recommended: sortDict.recommended,
    difficulty: sortDict.difficulty,
    duration: sortDict.duration,
  }

  const handleFieldChange = (field: string): void => {
    if (field === "recommended") {
      handleSortChange("recommended")
    } else {
      handleSortChange(`${field}-${activeDir}`)
    }
  }

  const handleDirToggle = (): void => {
    const nextDir = activeDir === "asc" ? "desc" : "asc"
    handleSortChange(`${activeField}-${nextDir}`)
  }

  // One list feeds both surfaces, so "all" can never drift out of shape from the
  // category rows again — it is just the first option, with a null track.
  const filterOptions: ReadonlyArray<{
    readonly key: string
    readonly label: string
    readonly count: number
    readonly icon: ReactNode
    readonly colorToken: DotToken
  }> = [
    { key: "all", label: allLabel, count: total, icon: <IconLayoutGrid />, colorToken: null },
    ...categories,
  ]

  const activeOption = filterOptions.find((option) => option.key === value) ?? filterOptions[0]

  const renderSortControl = (bordered: boolean): ReactNode => {
    const chipClass = bordered ? "border-line-2 bg-bg-elev border" : ""
    return (
      <div className="flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`text-fg-muted gap-1.5 font-mono text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0 ${chipClass}`}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
              </svg>
              {sortDict.label} {fieldLabel[activeField]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[160px]"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuRadioGroup value={activeField} onValueChange={handleFieldChange}>
              <DropdownMenuRadioItem value="recommended">
                {sortDict.recommended}
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              <DropdownMenuRadioItem value="difficulty">
                {sortDict.difficulty}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="duration">{sortDict.duration}</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {activeField !== "recommended" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDirToggle}
                className={`text-fg-muted w-7 px-0 font-mono text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0 ${chipClass}`}
                aria-label={activeDir === "asc" ? sortDict.sortDesc : sortDict.sortAsc}
              >
                {activeDir === "asc" ? "↑" : "↓"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {activeDir === "asc" ? sortDict.sortDesc : sortDict.sortAsc}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <div className="mb-8">
      {/* tablet/desktop: tab strip + sort, single pill */}
      <div className="border-line-2 bg-bg-elev hidden min-w-0 items-center gap-1 rounded-(--r-10) border p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] min-[641px]:flex">
        <Tabs
          value={value}
          onValueChange={handleValueChange}
          className="min-w-0 flex-1 overflow-hidden"
        >
          <TabsList
            ref={tabListRef}
            className="relative h-auto w-auto justify-start gap-0.5 overflow-x-auto overflow-y-visible rounded-none border-0 bg-transparent p-0 shadow-none"
          >
            {sliderRect !== null && (
              <span
                aria-hidden="true"
                className="bg-bg-card pointer-events-none absolute top-0.5 bottom-0.5 z-0 rounded-(--r-8) shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_0_0_1px_var(--color-accent-ring)] transition-[left,width] duration-(--d-slow) ease-(--ease)"
                style={{ left: sliderRect.left, width: sliderRect.width }}
              />
            )}
            {filterOptions.map(({ key, label, count, icon, colorToken }) => (
              <TabsTrigger
                key={key}
                value={key}
                className="text-fg-2 data-[state=active]:text-ob-accent data-[state=inactive]:hover:text-fg relative z-10 flex shrink-0 items-baseline gap-1.5 rounded-(--r-8) bg-transparent px-2.5 py-1.5 text-[12.5px] shadow-none data-[state=active]:shadow-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:self-center"
              >
                <FilterDot colorToken={colorToken} active={key === value} />
                {icon}
                {label}
                <span className="text-fg-muted font-mono text-[10px]">{count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div aria-hidden="true" className="bg-line-2 my-1 w-px shrink-0 self-stretch" />

        {renderSortControl(false)}
      </div>

      {/* mobile: category and sort collapse into two dropdown chips, side by side */}
      <div className="flex items-center gap-2 min-[641px]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="border-line-2 bg-bg-elev text-fg-2 min-w-0 flex-1 justify-start gap-1.5 font-mono text-[12.5px]"
            >
              <FilterDot colorToken={activeOption.colorToken} active={false} />
              {activeOption.icon}
              <span className="min-w-0 flex-1 truncate text-left">{activeOption.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[220px]">
            <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
              {filterOptions.map(({ key, label, count, icon, colorToken }, index) => (
                <Fragment key={key}>
                  {index === 1 && <DropdownMenuSeparator />}
                  <DropdownMenuRadioItem value={key} className={MENU_ROW_CLASS}>
                    <FilterDot colorToken={colorToken} active={key === value} />
                    {icon}
                    <span className="min-w-0 truncate">{label}</span>
                    <span className="text-fg-muted font-mono text-[10px]">{count}</span>
                  </DropdownMenuRadioItem>
                </Fragment>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {renderSortControl(true)}
      </div>
    </div>
  )
}
