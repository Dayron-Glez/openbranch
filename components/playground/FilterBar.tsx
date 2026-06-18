"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
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

type FilterCategory = {
  readonly key: string
  readonly label: string
  readonly count: number
  readonly icon: ReactNode
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

  return (
    <div className="mb-8 flex items-center gap-3">
      <Tabs value={value} onValueChange={handleValueChange} className="flex-1 overflow-hidden">
        <TabsList className="border-line bg-bg-card h-auto w-auto justify-start overflow-x-auto rounded-[var(--r-10)] border p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-bg-elev data-[state=active]:text-ob-accent data-[state=inactive]:text-fg-muted data-[state=inactive]:hover:bg-bg-elev/60 flex shrink-0 items-center gap-1.5 rounded-[var(--r-8)] px-2.5 py-1.5 text-[12.5px] shadow-none data-[state=active]:shadow-sm [&_svg]:size-3.5 [&_svg]:shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            {allLabel}
            <span className="font-mono text-[10px]">{total}</span>
          </TabsTrigger>

          {categories.map(({ key, label, count, icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-bg-elev data-[state=active]:text-ob-accent data-[state=inactive]:text-fg-muted data-[state=inactive]:hover:bg-bg-elev/60 flex shrink-0 items-center gap-1.5 rounded-[var(--r-8)] px-2.5 py-1.5 text-[12.5px] shadow-none data-[state=active]:shadow-sm [&_svg]:size-3.5 [&_svg]:shrink-0"
            >
              {icon}
              {label}
              <span className="font-mono text-[10px]">{count}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-fg-muted gap-1.5 font-mono text-[12px] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                className="text-fg-muted w-7 px-0 font-mono text-[13px] focus-visible:ring-0 focus-visible:ring-offset-0"
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
    </div>
  )
}
