# Spec: Filter Bar — Unified Shell, Sliding Indicator, Dot Ring (Chosen Treatment)

**Status:** Ready to implement
**Date:** 2026-07-22
**Parent brief:** `specs/filter-bar-redesign.md`
**Design reference:** Claude Design project "openbranch" → `Filter Bar Redesign.html`, section 05 ("Synthesis — all of it, restrained," Recommended)

## What ships

Implements the recommended synthesis from the design brief — the most "designed" the filter bar can be while every active/selected signal stays green and every bit of track hue stays inside the per-category dot (guardrail from `color-system.md` decision Q3, restated in `filter-bar-redesign.md`).

1. **Unified elevated shell** — the tab list and the sort control move from two disconnected pieces into one `bg-bg-elev` container with an inset shadow and a hairline vertical divider between them.
2. **Sliding active indicator** — a positioned element slides between tabs on selection instead of the background instantly swapping. It carries `border-accent-ring` + `bg-bg-card`, so the "you are here" fill stays green-tinted; the active label keeps `text-ob-accent`.
3. **Dot ring** — the per-track dot (shipped in #131) grows from 7px to 8px and gains a `0 0 0 3px var(--track-*-soft)` halo, echoing the ring language already used by the badge tile (#129) and the challenge-card tile (#131/#135). The dot on the currently-active tab gets an extra outer glow layer.
4. **Stronger inactive contrast** — inactive tab text moves from `text-fg-muted` to `text-fg-2`, count text from `text-fg-faint` to `text-fg-muted`, so the row reads clearly at rest, not just on the active tab.

None of this adds saturated area — the only hue budget is still exactly the dot, per Q3. Fallback noted in the design ("ship 03+04 first, pure CSS, if the slider is too much JS") isn't needed — the slider only requires a ref + a `useLayoutEffect` measuring Radix's own `data-state="active"` attribute, a small and contained addition.

## Implementation

### Sliding indicator — why `useLayoutEffect`

Radix's `TabsTrigger` sets `data-state="active"|"inactive"` on the underlying `<button>`; there's no prop that exposes the active trigger's pixel position. The indicator has to measure the real DOM layout after each render (`offsetLeft`/`offsetWidth` of the `[data-state="active"]` element inside the `TabsList`) and position an absolutely-positioned sibling accordingly. This is a legitimate `useLayoutEffect` case per the project's "external systems only" rule — it's reading layout back out of a third-party primitive's own DOM state, not reacting to internal component state, and `useLayoutEffect` (vs `useEffect`) avoids a visible flash by measuring before paint.

```tsx
const tabListRef = useRef<HTMLDivElement>(null)
const [sliderRect, setSliderRect] = useState<SliderRect | null>(null)

const measureSlider = (): void => {
  const list = tabListRef.current
  if (list === null) return
  const activeTab = list.querySelector<HTMLElement>('[data-state="active"]')
  if (activeTab === null) return
  setSliderRect({ left: activeTab.offsetLeft, width: activeTab.offsetWidth })
}

useLayoutEffect(() => {
  measureSlider()
}, [value])

useLayoutEffect(() => {
  window.addEventListener("resize", measureSlider)
  return () => window.removeEventListener("resize", measureSlider)
}, [])
```

`ref={tabListRef}` on `TabsList` (already `forwardRef`-based, resolves to the underlying `HTMLDivElement`). The indicator itself is a `position: absolute` sibling of the triggers inside `TabsList` (which becomes `position: relative`), styled with `left`/`width` inline (computed geometry, not a design token — exempt from the "no ad-hoc color" rule, which is about color only) and `transition-[left,width]` for the slide animation.

### Shell, triggers, dot

- Outer wrapper: `border-line-2 bg-bg-elev` container, `shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]`, houses the `Tabs`/`TabsList`, a 1px `bg-line-2` divider, and the sort control.
- `TabsList` loses its own border/background/padding (now transparent, `border-0 bg-transparent p-0`) — the shell provides those instead. Gains `relative` (for the slider) and keeps `overflow-x-auto` for the existing scroll-on-overflow behavior.
- Each `TabsTrigger`: `bg-transparent` at every state (the slider provides the active fill, sitting at `z-0` under the triggers at `z-10`); text `text-fg-2` at rest, `text-ob-accent` when `data-state=active`, `text-fg` on hover **only while inactive** (`data-[state=inactive]:hover:text-fg`, so hovering the active tab never dims it off green).
- Dot: `shadow-[0_0_0_3px_var(--track-soft)]` at rest; `shadow-[0_0_0_3px_var(--track-soft),0_0_8px_var(--track-soft)]` when its own tab is active (computed via a local `isActive = key === value` check in the `categories.map`).

## Guardrails carried over from `color-system.md` / `filter-bar-redesign.md`

- Active tab still reads primarily green — the slider's border/bg are neutral-tinted (`accent-ring`/`bg-card`), the label color is the actual green signal, unchanged from the baseline.
- Track hue never exceeds the dot — no tab gets a full-tab wash of its track color.
- Same Radix `Tabs`/`TabsList`/`TabsTrigger` primitives, same interaction model, same `overflow-x-auto` scroll-on-overflow.
- Sort control keeps its existing dropdown + asc/desc toggle behavior, just visually folded into the shell.

## Acceptance criteria

- Selecting any tab (click or keyboard) slides the indicator smoothly to the new position and width, no layout jump.
- Active tab text is unmistakably green at every tab width (short "Git" and long "Documentación").
- Inactive tabs are legible without hovering — contrast improved from the baseline, not achieved via color.
- Dot ring doesn't overpower the green on the active tab.
- Resizing the window keeps the slider aligned (recomputed on `resize`).
- No inline color styles, no ad-hoc hex — only existing tokens; the only inline styles are the slider's computed `left`/`width` geometry.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner).

## Action plan (single PR, worked autonomously per owner's instruction — no per-commit diff review this round)

1. Issue `feat(playground): filter bar unified shell, sliding indicator and dot ring` (#138) + branch `138-filter-bar-shell-slide`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: `FilterBar.tsx` rewrite (shell, slider, dot ring, contrast).
4. Checks (`types:check`/`lint`/`build`) + full SonarCloud report.
5. Report back to the owner with the PR link for visual review before merge.
