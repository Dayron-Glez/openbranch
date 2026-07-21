# Spec: Category Pill, Filter Dot & Challenge Card (Color System — Surface 2 of 4)

**Status:** Ready to implement
**Date:** 2026-07-22
**Parent brief:** `specs/color-system.md`
**Prior surface:** `specs/color-tokens-badges.md` (tokens + `[data-track]` mechanism + earned badge tile, shipped in #129)
**Design reference:** Claude Design project "openbranch" → `Color System.html` (section 04 — Surfaces, decision Q3)

## What ships

Three more consumers of the `[data-track]` mechanism built in surface 1, each following the design session's saturation rule (decision Q3): **full bloom where a surface is neutral today, subtle accent where it's already green-heavy.**

1. **Challenge-card icon tile** — `ChallengeCard.tsx`. Today neutral (`border-line bg-bg-elev text-fg-2`); becomes full bloom, same treatment as the earned-badge tile.
2. **Category pill** — `[slug]/page.tsx:185`. Today uniform green (`border-accent-ring bg-accent-soft text-ob-accent`); the ring and icon take the track hue, but the **label text stays `fg`** (design demo: `.cpill{color:var(--fg)}`, only `.cpill svg{color:var(--tk)}`) — text legibility over color-branding here.
3. **Filter tab — wayfinding dot** — `FilterBar.tsx`. The active tab **stays green**, unchanged. Each category tab gains a small track-hue dot _in addition to_ its existing icon — an accent, not a repaint (per the brief's Q3 answer: "the filter bar keeps green on the active tab and adds a track-hue dot").

## Not in this PR

- Anything under Layer A (state tokens: amber/red migration, docs callouts) — surface 3.
- Difficulty bars — surface 4, if it ships at all.
- The sidebar "meta category" key-value row in `[slug]/page.tsx` (~line 265) — it's already neutral (icon `fg-2`, text `fg`) and isn't a pill in the design's surface inventory; left untouched.
- `PrPreviewCard.tsx`'s PR-number badge — same green-pill classes as the category pill by coincidence, but it signals PR status, not track identity. Out of scope.

## Data threading

None of the three targets currently receive a `colorToken`. Each caller resolves it once via `TRACK_BY_CATEGORY` (already exported from `manifest.ts`) and passes it down — same pattern the pages already use for `icon={getChallengeIcon(...)}`.

| Consumer            | Caller                                                        | Resolution                                                                                                  |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `ChallengeCard`     | `app/[lang]/playground/page.tsx` (both grid render sites)     | new prop `colorToken: TrackColorToken`, from `TRACK_BY_CATEGORY.get(challenge.data.category)`               |
| Category pill       | `app/[lang]/playground/[slug]/page.tsx`                       | local `const colorToken = TRACK_BY_CATEGORY.get(page.data.category)?.colorToken`                            |
| `FilterBar` tab dot | `app/[lang]/playground/page.tsx` (`filterCategories` builder) | `FilterCategory` type gains `colorToken: TrackColorToken`, filled in the existing `CATEGORY_ORDER.map(...)` |

`TRACK_BY_CATEGORY` covers all 5 entries of `CATEGORY_ORDER` 1:1 (verified in surface 1), so the lookup is never `undefined` in practice — typed as required, not optional, everywhere it's threaded through.

## Implementation per surface

### 1. Challenge-card icon tile

```tsx
// before
<span className="border-line bg-bg-elev text-fg-2 inline-grid size-9 shrink-0 place-items-center rounded-(--r-8) border [&_svg]:size-[17px]">
  {icon}
</span>

// after
<span
  data-track={colorToken}
  className="border-(--track-ring) bg-(--track-soft) text-(color:--track) inline-grid size-9 shrink-0 place-items-center rounded-(--r-8) border [&_svg]:size-[17px]"
>
  {icon}
</span>
```

Same trio used for the earned badge tile in surface 1 — no new CSS, only a new consumer of the existing `[data-track]` seam.

### 2. Category pill

```tsx
// before
<span className="border-accent-ring bg-accent-soft text-ob-accent inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[11px] [&_svg]:size-3 [&_svg]:shrink-0">
  {icon}
  {categoryLabel}
</span>

// after
<span
  data-track={colorToken}
  className="border-(--track-ring) bg-(--track-soft) text-fg inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[11px] [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-(color:--track)"
>
  {icon}
  {categoryLabel}
</span>
```

Text drops from `text-ob-accent` to `text-fg`; only the icon (`[&_svg]:text-(color:--track)`) and the ring/soft fill carry the hue, per decision Q4's sibling rule for this pill in the design demo.

### 3. Filter tab — wayfinding dot

`FilterCategory` type gains `colorToken`. Inside the `categories.map(...)` in `FilterBar.tsx`, add a leading dot before the existing icon — active-tab styling (`data-[state=active]:text-ob-accent`) is untouched:

```tsx
{
  categories.map(({ key, label, count, icon, colorToken }) => (
    <TabsTrigger key={key} value={key} className="/* unchanged */">
      <span data-track={colorToken} className="size-[7px] shrink-0 rounded-full bg-(--track)" />
      {icon}
      {label}
      <span className="font-mono text-[10px]">{count}</span>
    </TabsTrigger>
  ))
}
```

The "All" tab keeps its grid icon and gets no dot (it has no single track).

## Acceptance criteria

- Challenge-card icon tiles bloom with their track hue on every render site (flat grid + per-category grid) — visually identical treatment to the earned badge tile from surface 1.
- Category pill on the challenge-detail page: ring + icon tinted, label text unmistakably `fg` (not the track hue, not green).
- Filter bar: active tab still reads green exactly as before; every category tab shows a small track-colored dot beside its icon; "All" is unchanged.
- No inline styles, no ad-hoc hex, no dynamic Tailwind class construction for color — everything through `data-track` + the tokens from surface 1.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): pick a track — confirm the same hue shows consistently across its badge (surface 1), its cards, its detail-page pill, and its filter dot.

## Action plan (single PR)

1. Issue `feat(playground): category pill, filter dot and challenge card identity (color system, surface 2/4)` + branch `<N>-color-track-surfaces`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(playground)`: challenge-card icon tile + `colorToken` prop wiring in `page.tsx`.
4. Commit 3 — `feat(playground)`: category pill in `[slug]/page.tsx`.
5. Commit 4 — `feat(playground)`: filter tab wayfinding dot in `FilterBar.tsx` + `filterCategories` wiring in `page.tsx`.
6. Checks + full SonarCloud report; owner verifies visually on localhost.
7. Merge (merge commit).
