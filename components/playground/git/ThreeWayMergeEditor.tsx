"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react"
import { Editor, type Monaco, type OnMount } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { cn } from "@/lib/utils"
import { changedLineRanges, diff3Merge } from "@/lib/playground/diff3"
import type { GitBlockResolution } from "@/lib/playground/review-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import "./merge-editor.css"

// ─── Types ────────────────────────────────────────────────────────────────────

type Resolution = "left" | "right" | "both-lr" | "both-rl" | "base"

export type ThreeWayMergeEditorHandle = {
  reset: () => void
}

export type ThreeWayMergeEditorProps = {
  /** Common ancestor / base version. */
  base: string
  /** Left ("ours") version. */
  left: string
  /** Right ("theirs") version. */
  right: string
  /** Monaco language id (e.g. "typescript", "json"). */
  language?: string
  /** Called whenever the merged result text or remaining conflict count changes. */
  onChange?: (result: string, conflictsRemaining: number) => void
  /** Called whenever block resolutions change — for persistence. */
  onBlocksChange?: (resolutions: readonly GitBlockResolution[]) => void
  /** Resolutions from a previous session — applied over the diff3 initial blocks. */
  initialResolutions?: readonly GitBlockResolution[]
  /** Called when the center (result) editor mounts — for type-checking integration. */
  onCenterMount?: OnMount
  /** Called before the center editor mounts — for Monaco language/theme setup. */
  onBeforeMount?: (monaco: Monaco) => void
  /** Virtual file path for the center editor (enables TypeScript type-checking). */
  centerPath?: string
  /** Title for the left pane. */
  leftTitle?: string
  /** Title for the center (result) pane. */
  resultTitle?: string
  /** Title for the right pane. */
  rightTitle?: string
  /** Color theme. */
  theme?: "light" | "dark"
  /** Height of the editor area. Omit to fill the parent container. */
  height?: number | string
  className?: string
  /**
   * When provided, conflicts are parsed from git conflict markers
   * (`<<<<<<<` / `=======` / `>>>>>>>`) instead of running diff3 on
   * `base`/`left`/`right`. Use this when the exercise has hand-crafted
   * conflict zones that don't match the algorithmic diff3 output.
   */
  conflictedCode?: string
  /** Localizable labels for icon-only buttons. Falls back to English. */
  labels?: {
    readonly prevConflict?: string
    readonly nextConflict?: string
    readonly enterFullscreen?: string
    readonly exitFullscreen?: string
  }
}

type Block =
  | { kind: "stable"; lines: string[] }
  | {
      kind: "conflict"
      id: number
      left: string[]
      base: string[]
      right: string[]
      resolution: Resolution | null
    }

type Region = {
  id: number
  resolution: Resolution | null
  startLine: number
  endLine: number
  leftRange: [number, number] | null
  rightRange: [number, number] | null
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const buildBlocks = (left: string, base: string, right: string): Block[] => {
  const merged = diff3Merge(left, base, right)
  let id = 0
  return merged.map<Block>((b) =>
    b.type === "stable"
      ? { kind: "stable", lines: b.lines }
      : { kind: "conflict", id: id++, left: b.left, base: b.base, right: b.right, resolution: null }
  )
}

/**
 * Parses a file that contains git conflict markers (`<<<<<<<`, `=======`,
 * `>>>>>>>`) into the same `Block[]` format that `buildBlocks` produces.
 * Use this when the exercise supplies hand-crafted conflict zones that don't
 * necessarily correspond to the algorithmic diff3 output of the two branches.
 */
const parseMarkers = (conflictedCode: string): Block[] => {
  const lines = conflictedCode.replaceAll("\r\n", "\n").split("\n")
  const blocks: Block[] = []
  const stableLines: string[] = []
  type ParseState = "stable" | "left" | "right"
  let state: ParseState = "stable"
  let leftLines: string[] = []
  let rightLines: string[] = []
  let id = 0

  for (const line of lines) {
    if (line.startsWith("<<<<<<<")) {
      if (stableLines.length) {
        blocks.push({ kind: "stable", lines: [...stableLines] })
        stableLines.length = 0
      }
      state = "left"
      leftLines = []
    } else if (line.startsWith("=======") && state === "left") {
      state = "right"
      rightLines = []
    } else if (line.startsWith(">>>>>>>") && state === "right") {
      blocks.push({
        kind: "conflict",
        id: id++,
        left: leftLines,
        base: [],
        right: rightLines,
        resolution: null,
      })
      state = "stable"
    } else if (state === "right") {
      rightLines.push(line)
    } else if (state === "left") {
      leftLines.push(line)
    } else {
      stableLines.push(line)
    }
  }

  if (stableLines.length) blocks.push({ kind: "stable", lines: stableLines })
  return blocks
}

const resolutionLines = (b: Extract<Block, { kind: "conflict" }>, res: Resolution): string[] => {
  switch (res) {
    case "left":
      return b.left
    case "right":
      return b.right
    case "base":
      return b.base
    case "both-lr":
      return [...b.left, ...b.right]
    case "both-rl":
      return [...b.right, ...b.left]
  }
}

const leftActive = (res: Resolution | null): boolean =>
  res === "left" || res === "both-lr" || res === "both-rl"

const rightActive = (res: Resolution | null): boolean =>
  res === "right" || res === "both-lr" || res === "both-rl"

const toggleSide = (res: Resolution | null, side: "left" | "right"): Resolution | null => {
  const l = leftActive(res)
  const r = rightActive(res)
  const nextL = side === "left" ? !l : l
  const nextR = side === "right" ? !r : r
  if (nextL && nextR) return side === "left" ? "both-rl" : "both-lr"
  if (nextL) return "left"
  if (nextR) return "right"
  return null
}

const renderBlocks = (blocks: Block[]): { text: string; regions: Region[]; remaining: number } => {
  const lines: string[] = []
  const regions: Region[] = []
  let remaining = 0

  for (const b of blocks) {
    if (b.kind === "stable") {
      lines.push(...b.lines)
      continue
    }
    const startLine = lines.length + 1
    if (b.resolution === null) {
      remaining++
      const leftStart = lines.length + 1
      lines.push(...b.left)
      const leftEnd = lines.length
      const rightStart = lines.length + 1
      lines.push(...b.right)
      const rightEnd = lines.length
      regions.push({
        id: b.id,
        resolution: null,
        startLine,
        endLine: Math.max(startLine, lines.length),
        leftRange: b.left.length ? [leftStart, leftEnd] : null,
        rightRange: b.right.length ? [rightStart, rightEnd] : null,
      })
    } else {
      const resLines = resolutionLines(b, b.resolution)
      lines.push(...resLines)
      regions.push({
        id: b.id,
        resolution: b.resolution,
        startLine,
        endLine: Math.max(startLine, lines.length),
        leftRange: null,
        rightRange: null,
      })
    }
  }

  return { text: lines.join("\n"), regions, remaining }
}

// ─── Decoration helpers ───────────────────────────────────────────────────────

const zone = (
  monaco: Monaco,
  startLine: number,
  endLine: number,
  className: string
): editor.IModelDeltaDecoration => ({
  range: new monaco.Range(startLine, 1, Math.max(startLine, endLine), 1),
  options: { isWholeLine: true, className, marginClassName: className },
})

const lineClass = (
  monaco: Monaco,
  line: number,
  className: string
): editor.IModelDeltaDecoration => ({
  range: new monaco.Range(line, 1, line, 1),
  options: { isWholeLine: true, className },
})

// ─── Theme ────────────────────────────────────────────────────────────────────

let themesDefined = false
const defineThemes = (monaco: Monaco): void => {
  if (themesDefined) return
  themesDefined = true
  monaco.editor.defineTheme("merge-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: { "editor.background": "#ffffff" },
  })
  monaco.editor.defineTheme("merge-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#16161e",
      "editorGutter.background": "#16161e",
      "editorLineNumber.foreground": "#4b4b5c",
      "editorLineNumber.activeForeground": "#8b8ba7",
      "editor.lineHighlightBackground": "#1c1c26",
    },
  })
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const SvgProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

const IconChevronUp = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M3 10l5-5 5 5" />
  </svg>
)

const IconChevronDown = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M3 6l5 5 5-5" />
  </svg>
)

const IconChevronLeft = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M10 3L5 8l5 5" />
  </svg>
)

const IconChevronRight = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M6 3l5 5-5 5" />
  </svg>
)

const IconX = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="2" className={className} aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

const IconGitMerge = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <circle cx="5" cy="3.5" r="1.5" />
    <circle cx="5" cy="12.5" r="1.5" />
    <circle cx="11" cy="6" r="1.5" />
    <path d="M5 5v6" />
    <path d="M11 7.5v.5a3 3 0 0 1-3 3H5" />
  </svg>
)

const IconCheck = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="2" className={className} aria-hidden="true">
    <path d="M2.5 8l3.5 3.5 7-7" />
  </svg>
)

const IconExpand = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />
  </svg>
)

const IconCompress = ({ className }: { className?: string }) => (
  <svg {...SvgProps} strokeWidth="1.8" className={className} aria-hidden="true">
    <path d="M2 6h4V2M14 6h-4V2M2 10h4v4M14 10h-4v4" />
  </svg>
)

// ─── GutterLane ───────────────────────────────────────────────────────────────

type LanePin = { id: number; top: number; resolution: Resolution | null }

type GutterLaneProps = {
  side: "left" | "right"
  pins: LanePin[]
  onToggle: (id: number, side: "left" | "right") => void
  onMouseDown: (e: ReactMouseEvent<HTMLDivElement>) => void
}

type PinButtonProps = {
  pin: LanePin
  side: "left" | "right"
  active: boolean
  onToggle: (id: number, side: "left" | "right") => void
}

const PinButton = ({ pin, side, active, onToggle }: Readonly<PinButtonProps>) => {
  const sideName = side === "left" ? "Local" : "Remote"
  const actionLabel = active ? `Remove ${sideName} from result` : `Apply ${sideName} to result`
  const activeClass =
    side === "left"
      ? "border-sky-400/60 bg-sky-500/25 text-sky-200"
      : "border-amber-400/60 bg-amber-500/25 text-amber-200"
  const inactiveClass =
    side === "left"
      ? "border-sky-500/30 bg-[#1c1c26] text-sky-300 hover:border-sky-400/70 hover:bg-sky-500/20"
      : "border-amber-500/30 bg-[#1c1c26] text-amber-300 hover:border-amber-400/70 hover:bg-amber-500/20"
  const stateClass = active ? activeClass : inactiveClass
  const inactiveIcon =
    side === "left" ? (
      <IconChevronRight className="size-3.5" />
    ) : (
      <IconChevronLeft className="size-3.5" />
    )
  const icon = active ? <IconX className="size-3" /> : inactiveIcon

  return (
    <button
      key={pin.id}
      type="button"
      onClick={() => onToggle(pin.id, side)}
      style={{ top: pin.top }}
      title={actionLabel}
      aria-label={actionLabel}
      className={cn(
        "absolute left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[5px] border text-[11px] shadow-sm transition-colors",
        stateClass
      )}
    >
      {icon}
    </button>
  )
}

const GutterLane = ({ side, pins, onToggle, onMouseDown }: Readonly<GutterLaneProps>) => {
  const isActive = (res: Resolution | null): boolean =>
    side === "left" ? leftActive(res) : rightActive(res)

  return (
    <div
      role="slider"
      aria-label={`Drag to resize ${side} pane`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
      tabIndex={0}
      className="relative w-7 shrink-0 cursor-col-resize border-x border-[#2a2a35] bg-[#13131a]"
      onMouseDown={onMouseDown}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault()
      }}
    >
      <div className="h-8 border-b border-[#2a2a35] bg-[#1c1c26]" />
      <div className="absolute inset-x-0 top-8 bottom-0 overflow-hidden">
        {pins.map((pin) => (
          <PinButton
            key={pin.id}
            pin={pin}
            side={side}
            active={isActive(pin.resolution)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Pane ─────────────────────────────────────────────────────────────────────

type PaneProps = {
  title: string
  accent: "left" | "right" | "result"
  value: string
  language: string
  theme: string
  path?: string
  options: editor.IStandaloneEditorConstructionOptions
  beforeMount?: (monaco: Monaco) => void
  onMount: (ed: editor.IStandaloneCodeEditor, monaco: Monaco) => void
  style?: CSSProperties
}

const Pane = ({
  title,
  accent,
  value,
  language,
  theme,
  path,
  options,
  beforeMount,
  onMount,
  style,
}: Readonly<PaneProps>) => (
  <div className="flex min-w-0 flex-col bg-[#16161e]" style={style}>
    <div className="flex h-8 items-center gap-2 border-b border-[#2a2a35] bg-[#1c1c26] px-3 text-xs font-medium text-zinc-400">
      <span
        className={cn(
          "size-2 rounded-full",
          accent === "left" && "bg-sky-400",
          accent === "right" && "bg-amber-400",
          accent === "result" && "bg-emerald-400"
        )}
      />
      <span className="truncate">{title}</span>
    </div>
    <div className="min-h-0 flex-1">
      <Editor
        value={value}
        language={language}
        theme={theme}
        path={path}
        options={options}
        beforeMount={beforeMount}
        onMount={onMount}
        loading={<div className="p-3 text-xs text-zinc-500">Loading editor…</div>}
      />
    </div>
  </div>
)

const buildRegionDecorations = (
  regions: Region[],
  monaco: Monaco
): editor.IModelDeltaDecoration[] => {
  const decorations: editor.IModelDeltaDecoration[] = []
  for (const r of regions) {
    if (r.resolution === null) {
      if (r.leftRange)
        decorations.push(zone(monaco, r.leftRange[0], r.leftRange[1], "merge-zone--left"))
      if (r.rightRange) {
        decorations.push(zone(monaco, r.rightRange[0], r.rightRange[1], "merge-zone--right"))
        if (r.leftRange) decorations.push(lineClass(monaco, r.rightRange[0], "merge-divider"))
      }
    } else if (r.endLine >= r.startLine && r.resolution) {
      decorations.push(zone(monaco, r.startLine, r.endLine, "merge-zone--resolved"))
    }
  }
  return decorations
}

// ─── Main component ───────────────────────────────────────────────────────────

const sharedEditorOptions: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 13,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  renderLineHighlight: "none",
  smoothScrolling: true,
  fixedOverflowWidgets: true,
  padding: { top: 8, bottom: 8 },
  scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
}

export const ThreeWayMergeEditor = forwardRef<ThreeWayMergeEditorHandle, ThreeWayMergeEditorProps>(
  function ThreeWayMergeEditor(
    {
      base,
      left,
      right,
      language = "plaintext",
      onChange,
      onBlocksChange,
      initialResolutions,
      onCenterMount,
      onBeforeMount,
      centerPath,
      leftTitle = "Local (yours)",
      resultTitle = "Result",
      rightTitle = "Remote (theirs)",
      theme = "dark",
      height,
      className,
      conflictedCode,
      labels,
    },
    ref
  ) {
    const monacoRef = useRef<Monaco | null>(null)
    const leftEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const centerEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const rightEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

    const regionsRef = useRef<Region[]>([])
    const lineHeightRef = useRef(18)
    const centerDecorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null)
    const syncingRef = useRef(false)
    const centerReadyRef = useRef(false)
    const paintingRef = useRef(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const editorsRowRef = useRef<HTMLDivElement>(null)
    const draggingRef = useRef<"left" | "right" | null>(null)
    const dragStartXRef = useRef(0)
    const dragStartContainerWidthRef = useRef(0)
    const dragStartLeftPctRef = useRef(0)
    const dragStartRightPctRef = useRef(0)

    const [viewTick, bumpView] = useReducer((x: number) => x + 1, 0)
    const [leftWidthPct, setLeftWidthPct] = useState(33)
    const [rightWidthPct, setRightWidthPct] = useState(33)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const rawInitialBlocks = useMemo(
      () => (conflictedCode ? parseMarkers(conflictedCode) : buildBlocks(left, base, right)),
      [conflictedCode, left, base, right]
    )

    const initialBlocks = useMemo((): Block[] => {
      if (!initialResolutions?.length) return rawInitialBlocks
      return rawInitialBlocks.map((b) =>
        b.kind === "conflict"
          ? {
              ...b,
              resolution:
                (initialResolutions.find((r) => r.id === b.id)?.resolution as Resolution | null) ??
                null,
            }
          : b
      )
    }, [rawInitialBlocks, initialResolutions])

    const [blocks, setBlocks] = useState<Block[]>(initialBlocks)
    const [activeConflict, setActiveConflict] = useState(0)

    useEffect(() => {
      setBlocks(initialBlocks)
      setActiveConflict(0)
    }, [initialBlocks])

    useImperativeHandle(
      ref,
      () => ({
        reset: (): void => {
          setBlocks(rawInitialBlocks)
          setActiveConflict(0)
        },
      }),
      [rawInitialBlocks]
    )

    const startDrag = useCallback(
      (e: ReactMouseEvent<HTMLDivElement>, side: "left" | "right"): void => {
        e.preventDefault()
        draggingRef.current = side
        dragStartXRef.current = e.clientX
        dragStartLeftPctRef.current = leftWidthPct
        dragStartRightPctRef.current = rightWidthPct
        if (editorsRowRef.current) {
          dragStartContainerWidthRef.current = editorsRowRef.current.getBoundingClientRect().width
        }
      },
      [leftWidthPct, rightWidthPct]
    )

    const toggleFullscreen = useCallback((): void => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => undefined)
      } else {
        containerRef.current?.requestFullscreen().catch(() => undefined)
      }
    }, [])

    useEffect(() => {
      const handler = (): void => setIsFullscreen(!!document.fullscreenElement)
      document.addEventListener("fullscreenchange", handler)
      return () => document.removeEventListener("fullscreenchange", handler)
    }, [])

    useEffect(() => {
      const MIN_PX = 100
      const GUTTER_PX = 28

      const onMouseMove = (e: MouseEvent): void => {
        if (!draggingRef.current) return
        const W = dragStartContainerWidthRef.current
        if (W === 0) return
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
        const deltaX = e.clientX - dragStartXRef.current
        const deltaPct = (deltaX / W) * 100
        const minPct = (MIN_PX / W) * 100
        const gutterPct = ((GUTTER_PX * 2) / W) * 100

        if (draggingRef.current === "left") {
          const maxLeft = 100 - gutterPct - minPct - dragStartRightPctRef.current
          setLeftWidthPct(
            Math.max(minPct, Math.min(dragStartLeftPctRef.current + deltaPct, maxLeft))
          )
        } else {
          const maxRight = 100 - gutterPct - minPct - dragStartLeftPctRef.current
          setRightWidthPct(
            Math.max(minPct, Math.min(dragStartRightPctRef.current - deltaPct, maxRight))
          )
        }
      }

      const onMouseUp = (): void => {
        draggingRef.current = null
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
      return () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }, [])

    const { text, regions, remaining } = useMemo(() => renderBlocks(blocks), [blocks])
    const total = useMemo(() => blocks.filter((b) => b.kind === "conflict").length, [blocks])
    const resolvedCount = total - remaining
    const allResolved = total > 0 && remaining === 0

    const themeName = theme === "light" ? "merge-light" : "merge-dark"

    // Emit block resolutions for persistence.
    useEffect(() => {
      if (!onBlocksChange) return
      onBlocksChange(
        blocks
          .filter((b): b is Extract<Block, { kind: "conflict" }> => b.kind === "conflict")
          .map((b) => ({ id: b.id, resolution: b.resolution }))
      )
    }, [blocks, onBlocksChange])

    const paint = useCallback((): void => {
      const center = centerEditorRef.current
      const monaco = monacoRef.current
      if (!center || !monaco || !centerReadyRef.current) return
      const model = center.getModel()
      if (!model) return

      regionsRef.current = regions

      if (model.getValue() !== text) {
        paintingRef.current = true
        center.executeEdits("merge-render", [
          { range: model.getFullModelRange(), text, forceMoveMarkers: true },
        ])
        // Clear undo history so programmatic conflict-resolution edits aren't undoable.
        model.setValue(model.getValue())
        paintingRef.current = false
      }

      const decorations = buildRegionDecorations(regions, monaco)

      if (centerDecorationsRef.current) {
        centerDecorationsRef.current.set(decorations)
      } else {
        centerDecorationsRef.current = center.createDecorationsCollection(decorations)
      }

      onChange?.(text, remaining)
      bumpView()
    }, [regions, text, remaining, onChange])

    useEffect(() => {
      paint()
    }, [paint])

    const toggleConflictSide = useCallback((id: number, side: "left" | "right"): void => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.kind === "conflict" && b.id === id
            ? { ...b, resolution: toggleSide(b.resolution, side) }
            : b
        )
      )
    }, [])

    const acceptAll = useCallback((res: Resolution): void => {
      setBlocks((prev) => prev.map((b) => (b.kind === "conflict" ? { ...b, resolution: res } : b)))
    }, [])

    const goToConflict = useCallback(
      (index: number): void => {
        const center = centerEditorRef.current
        if (!regions.length || !center) return
        const i = ((index % regions.length) + regions.length) % regions.length
        setActiveConflict(i)
        const r = regions[i]
        center.revealLineNearTop(Math.max(1, r.startLine - 1))
        center.setPosition({ lineNumber: r.startLine, column: 1 })
      },
      [regions]
    )

    const decorateSide = useCallback(
      (ed: editor.IStandaloneCodeEditor, other: string, kind: "left" | "right"): void => {
        const monaco = monacoRef.current
        if (!monaco) return
        const model = ed.getModel()
        if (!model) return
        const ranges = changedLineRanges(base, other)
        const decorations: editor.IModelDeltaDecoration[] = []
        for (const r of ranges) {
          const startLine = Math.max(1, r.start + 1)
          const endLine = Math.max(startLine, r.count > 0 ? r.start + r.count : r.start + 1)
          decorations.push(
            zone(monaco, startLine, Math.min(endLine, model.getLineCount()), `merge-zone--${kind}`)
          )
        }
        ed.createDecorationsCollection(decorations)
      },
      [base]
    )

    const setupSyncScroll = useCallback((): void => {
      const editors = [
        leftEditorRef.current,
        centerEditorRef.current,
        rightEditorRef.current,
      ].filter(Boolean) as editor.IStandaloneCodeEditor[]
      if (editors.length < 3) return
      for (const source of editors) {
        source.onDidScrollChange((e) => {
          if (syncingRef.current) return
          syncingRef.current = true
          for (const target of editors) {
            if (target === source) continue
            target.setScrollTop(e.scrollTop)
            target.setScrollLeft(e.scrollLeft)
          }
          syncingRef.current = false
          bumpView()
        })
      }
    }, [])

    const handleBeforeMount = useCallback(
      (monaco: Monaco): void => {
        monacoRef.current = monaco
        defineThemes(monaco)
        onBeforeMount?.(monaco)
      },
      [onBeforeMount]
    )

    const handleCenterMount = useCallback(
      (ed: editor.IStandaloneCodeEditor, monaco: Monaco): void => {
        centerEditorRef.current = ed
        monacoRef.current = monaco
        centerReadyRef.current = true
        lineHeightRef.current = ed.getOption(monaco.editor.EditorOption.lineHeight) || 18
        ed.onDidLayoutChange(() => bumpView())
        ed.onDidChangeModelContent(() => {
          if (paintingRef.current) return
          onChange?.(
            ed.getModel()?.getValue() ?? "",
            regionsRef.current.filter((r) => r.resolution === null).length
          )
        })
        setupSyncScroll()
        paint()
        onCenterMount?.(ed, monaco)
      },
      [onChange, paint, setupSyncScroll, onCenterMount]
    )

    const handleLeftMount = useCallback(
      (ed: editor.IStandaloneCodeEditor): void => {
        leftEditorRef.current = ed
        decorateSide(ed, left, "left")
        setupSyncScroll()
      },
      [decorateSide, left, setupSyncScroll]
    )

    const handleRightMount = useCallback(
      (ed: editor.IStandaloneCodeEditor): void => {
        rightEditorRef.current = ed
        decorateSide(ed, right, "right")
        setupSyncScroll()
      },
      [decorateSide, right, setupSyncScroll]
    )

    const lanePins = useMemo(() => {
      const center = centerEditorRef.current
      if (!center) return [] as LanePin[]
      const scrollTop = center.getScrollTop()
      const lh = lineHeightRef.current
      return regions.map((r) => ({
        id: r.id,
        resolution: r.resolution,
        top: center.getTopForLineNumber(r.startLine) - scrollTop + lh / 2,
      }))
    }, [regions, viewTick])

    const editorsHeight = height === undefined ? "100%" : height

    return (
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-[#2a2a35] bg-[#16161e] text-zinc-200",
          height === undefined && "h-full",
          className
        )}
      >
        {/* ── Header ── */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#2a2a35] bg-[#1c1c26] px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <IconGitMerge className="size-4 text-emerald-400" />
            <span className="font-medium text-zinc-100">Merge conflicts</span>
            {total > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  allResolved
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-rose-500/15 text-rose-400"
                )}
              >
                {allResolved ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="size-3" /> All resolved
                  </span>
                ) : (
                  `${resolvedCount}/${total} resolved`
                )}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                No conflicts
              </span>
            )}
          </div>

          <TooltipProvider delayDuration={400}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => goToConflict(activeConflict - 1)}
                    disabled={total === 0}
                    className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
                    aria-label={labels?.prevConflict ?? "Previous conflict"}
                  >
                    <IconChevronUp className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{labels?.prevConflict ?? "Previous conflict"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => goToConflict(activeConflict + 1)}
                    disabled={total === 0}
                    className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
                    aria-label={labels?.nextConflict ?? "Next conflict"}
                  >
                    <IconChevronDown className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{labels?.nextConflict ?? "Next conflict"}</TooltipContent>
              </Tooltip>

              <div className="mx-1 h-5 w-px bg-[#2a2a35]" />
              <button
                type="button"
                onClick={() => acceptAll("left")}
                disabled={remaining === 0}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/10 disabled:pointer-events-none disabled:opacity-40"
              >
                <IconChevronRight className="size-3.5" /> All local
              </button>
              <button
                type="button"
                onClick={() => acceptAll("right")}
                disabled={remaining === 0}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:pointer-events-none disabled:opacity-40"
              >
                All remote <IconChevronLeft className="size-3.5" />
              </button>
              <div className="mx-1 h-5 w-px bg-[#2a2a35]" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100"
                    aria-label={
                      isFullscreen
                        ? (labels?.exitFullscreen ?? "Exit fullscreen")
                        : (labels?.enterFullscreen ?? "Enter fullscreen")
                    }
                  >
                    {isFullscreen ? (
                      <IconCompress className="size-4" />
                    ) : (
                      <IconExpand className="size-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen
                    ? (labels?.exitFullscreen ?? "Exit fullscreen")
                    : (labels?.enterFullscreen ?? "Enter fullscreen")}
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* ── Editors row ── */}
        <div
          ref={editorsRowRef}
          className={cn("flex", height === undefined && "min-h-0 flex-1")}
          style={height === undefined ? undefined : { height: editorsHeight }}
        >
          <Pane
            title={leftTitle}
            accent="left"
            value={left}
            language={language}
            theme={themeName}
            options={{ ...sharedEditorOptions, readOnly: true }}
            onMount={handleLeftMount}
            style={{ width: `${leftWidthPct}%`, flexShrink: 0 }}
          />

          <GutterLane
            side="left"
            pins={lanePins}
            onToggle={toggleConflictSide}
            onMouseDown={(e) => startDrag(e, "left")}
          />

          <Pane
            title={resultTitle}
            accent="result"
            value={text}
            language={language}
            theme={themeName}
            path={centerPath}
            options={sharedEditorOptions}
            beforeMount={handleBeforeMount}
            onMount={handleCenterMount}
            style={{ flex: 1, minWidth: 0 }}
          />

          <GutterLane
            side="right"
            pins={lanePins}
            onToggle={toggleConflictSide}
            onMouseDown={(e) => startDrag(e, "right")}
          />

          <Pane
            title={rightTitle}
            accent="right"
            value={right}
            language={language}
            theme={themeName}
            options={{ ...sharedEditorOptions, readOnly: true }}
            onMount={handleRightMount}
            style={{ width: `${rightWidthPct}%`, flexShrink: 0 }}
          />
        </div>
      </div>
    )
  }
)
