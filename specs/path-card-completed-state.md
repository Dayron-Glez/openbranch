# Spec: Path card — the completed state

**Status:** Draft — problem framed, three in-house attempts rejected, ready for a design session
**Date:** 2026-07-28
**Owner:** @Dayron-Glez
**Depends on:** `specs/learning-paths.md` (parent brief), shipped across PRs #152, #166, #168, #170, #172, #176

## Context

Learning paths shipped. A path is a curated sequence of steps — guide, challenge, guide, challenge, challenge — and `PathCard` is the object that represents one in a grid. It renders in two places from one component:

- `/[lang]/paths` — the index route
- the "Rutas de aprendizaje" band on the playground hub

Until PR #176, only challenge steps were completable: reading a guide was not tracked, so guide dots were permanently hollow and the card showed two denominators at once — five dots implying 3 of 5, and a caption reading "3 de 3 practicados". #176 added read-tracking, and progress now counts every step.

Which surfaced the actual design problem, one layer down.

## The problem

**The card's progress device has nothing left to say once the path is finished.**

The footer spine is one dot per step, filled when done. At 5 of 5 it is five identical accent dots sitting beside a caption that says "5 de 5 completados". The dots and the text carry the same information, and neither is information any more — a full progress bar is a shape, not a signal.

There is no _completed_ state. There is only _the in-progress state, saturated_.

This is the moment the product should feel best — you finished a real sequence of reading and practice — and it currently reads as a slightly greener version of "in progress".

## What was tried in-house, and why it was rejected

Three directions were mocked and none convinced the owner. Recorded here so the session does not re-walk them:

1. **Mode switch.** Replace the dot spine with a `✓ Completada` pill in the accent triad, free the reclaimed space for new metadata (`5 pasos · 67 min`), turn the card's top accent bar green. _Rejected — reads as a status chip, not as an ending. Solves the redundancy without earning the moment._
2. **Corner stamp.** Keep the layout, add an absolutely-positioned check medallion top-right. _Rejected — leaves the five redundant dots underneath, competes with the track icon for the same visual corner, and forces defensive padding on the title._
3. **Recede.** Dim the whole card, mute the border, swap the track icon for a check, replace the CTA with "Repasar". _Rejected — a reasonable philosophy for a large catalogue, but with one path today it makes the only card on the page look switched off._

The common failure: all three treat "completed" as **a variant of the card**. The session's job is to decide whether it should instead be **a different object**.

## Design system inventory — use this, do not invent

### Surfaces are dark by construction

`app/global.css` declares the openbranch tokens in a plain `@theme` block, _not_ under `.dark`. Only the fumadocs HSL bridge (`--background`, `--card`, …) flips with the theme. So every surface built from openbranch tokens — including this card — is dark in both modes. No light-mode variant is needed or possible without a token change.

| Token              | Value     | Role              |
| ------------------ | --------- | ----------------- |
| `--color-bg`       | `#0b0c0e` | page              |
| `--color-bg-card`  | `#14171b` | card surface      |
| `--color-bg-elev`  | `#111316` | raised control    |
| `--color-line`     | `#1f2328` | hairline          |
| `--color-line-2`   | `#2a2f36` | stronger hairline |
| `--color-fg`       | `#eceef1` | primary text      |
| `--color-fg-2`     | `#b7bcc4` | secondary         |
| `--color-fg-muted` | `#6f7681` | metadata          |
| `--color-fg-faint` | `#3e444c` | disabled          |

### Radii, shadows, motion

`--r-6/8/10/12/16/full`, `--sh-2/3/4`, `--ease: cubic-bezier(.2,.8,.2,1)`, `--d-fast: 120ms`, `--d-base: 180ms`, `--d-slow: 260ms`.

### The completion vocabulary that already exists

Reuse it rather than adding a fourth green:

- **Accent triad** — `bg-accent-soft` (`oklch(78% .18 148 / .15)`), `border-accent-ring` (`/.35`), `text-ob-accent` (`oklch(78% .18 148)`), ink `--color-accent-ink: #062612`.
- **`IconCheck`** in an accent circle — used by `PathStepper` (`MARK_CLASS.completed`) and by `RewardMoment`'s recap rows.
- **`RewardMoment` / `PathRecapCard`** (`features/playground/components/RewardMoment.tsx`) is the app's existing _celebration_ surface, shown on the result page after finishing a challenge. It already has a "path complete" variant with copy `pathComplete` / `youFinishedThePath`. **A completed path card should feel related to it without duplicating it** — that relationship is worth designing deliberately.

### Track identity

Each path carries a `track` (`git · review · docs · bugfix · test`) resolving `--track`, `--track-soft`, `--track-ring`, `--track-ink` via `data-track`. The card currently uses it for the top bar, the icon tile and the challenge dots. **Open question: does a completed card keep its track identity, or does completion override it?** Today green (completion) and the track hue fight for the same card.

## Physical constraints

- **Width is ~304px on desktop, ~335px on mobile.** The grid is `repeat(auto-fill, minmax(min(300px,100%), 1fr))` — `auto-fill`, so a single card keeps its width instead of stretching. Design for a narrow card, not a wide one.
- **Height must stay consistent with in-progress cards** in the same grid. A completed card that is visibly taller breaks the row.
- The card is a single `<Link>`. Any interactive control inside it would need the anchor restructured — say so explicitly if the design needs one.
- Description is `line-clamp-2`.

## Data available

`PathCardItem` (`features/paths/components/PathCard.tsx`) carries: `href`, `title`, `description`, `track`, `trackLabel`, `icon`, `steps: {type, done}[]`, and `progress: {done, total} | null` (`null` = signed out).

**Derivable cheaply** (already loaded server-side, just not passed): total estimated minutes, guide count vs challenge count, points earned across the path's challenges.

**Not available without new work:** the date the path was completed. It would come from `max(challenge_sessions.completed_at, doc_reads.read_at)` across the path's steps — one extra query per surface. If the design wants it, say so and it will be costed; do not assume it.

## Three states must be designed, not one

The grid mixes them, so they have to read as a family:

1. **Signed out** — `progress === null`. Caption describes shape ("2 guías · 3 retos"), dots show type only.
2. **In progress** — some done. This is the state the current design serves well; changes here should be minimal.
3. **Completed** — the subject of this brief.

## Scale reality — read before designing

**There is exactly one path today.** The arc through `atlas/gateway`'s PR #214: five steps, three sections, `review` track.

That is not a temporary embarrassment to design around — it is the honest near-term state, and the same constraint that shaped `specs/learning-paths.md`. A completed-state design that only works in a grid of eight is the wrong design. **It must look deliberate as the single card on an otherwise empty index**, and still work when there are six.

Corollary: "completed cards sort to the bottom" is not a solution on its own today, because there is nothing to sort against.

## Non-goals

- Changing the in-progress or signed-out states beyond what coherence demands.
- New progress semantics. Reading is tracked, challenges are tracked, progress counts every step — that is settled.
- Points, badges or streaks for finishing a path. Reading awards no points and this brief does not revisit that.
- A path-completion badge or shareable card — that is the public-profiles module's territory (module 3 of the roadmap). Leaving a hook is fine; building it is not.
- Touching `RewardMoment`. It is the post-challenge celebration and it stays.

## Open questions for the session

1. **Is "completed" a variant or a different object?** All three rejected attempts assumed variant. If the card should become something else structurally — a testimonial to what you did, a summary of what you now know, a doorway to the next thing — say so.
2. **What replaces the spine?** Once progress is meaningless, that footer row is free real estate. What deserves it: a durable fact (time invested, points earned, date), an action (revisit, share, what next), or nothing at all?
3. **Track hue vs completion green.** Which wins on a finished card, and does the answer hold when six completed cards of different tracks sit in one grid?
4. **How loud?** The product's voice is understated and technical. Where does "you earned this" sit between a quiet check mark and a genuine moment — given this is the end of a five-step sequence, not a single challenge?
5. **Relationship to `RewardMoment`.** The user has just seen a full-width celebration on the result page. What should the card say when they land on `/paths` a week later? Same register or a calmer echo?
6. **The empty-ish index.** With one completed path, `/paths` becomes a page whose only content says "done". Does the completed state need a companion — a next-step prompt, a nudge toward the playground — or does the index own that separately?

## Deliverable

Mocks for the three card states side by side at ~304px, in the tokens above, plus a view of `/paths` showing the single-completed-card case. Rationale for questions 1–4 in prose; a recommendation, not a menu.
