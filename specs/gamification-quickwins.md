# Spec: Gamification Quick-Wins — Streak & All-Tracks Badges (Module 1 of 4)

**Status:** Ready to implement
**Date:** 2026-07-23

## What ships

The first of the post-color-system product modules. Two badges have had full UI/i18n support since the badge system launched — `streak-7` and `all-tracks` — but are only ever rendered as locked teasers (`PLANNED_BADGE_KEYS` in `BadgesSection.tsx`) because nothing ever awards them. This ships the award path for both:

1. **Catalog rows** — `badge_catalog` gets `streak-7` and `all-tracks`, unblocking the FK that currently rejects any insert into `user_badges` for these keys.
2. **Award logic** — a new `awardMilestoneBadges`, alongside the existing `awardTrackBadge`, called from the same two completion hooks.
3. **Manifest bookkeeping** — move both keys from `PLANNED_BADGE_KEYS` to `AWARDED_BADGE_KEYS` in `BadgesSection.tsx` now that they're real.

No points/tiers schema, no design session — matches the roadmap's own "S, sin sesión de diseño" sizing for this module.

## Verified: catalog state before this spec

`badge_catalog` (from `20260716141525_schema_hardening.sql`) has only the 5 track badges:

| key             | track           |
| --------------- | --------------- |
| `review-corps`  | `code-review`   |
| `ship-it`       | `bug-fix`       |
| `coverage-hero` | `testing`       |
| `first-merge`   | `git`           |
| `doc-writer`    | `documentation` |

`streak-7` / `all-tracks` are absent from every migration and every seed. They exist only as frontend concepts: dictionary copy (`lib/playground-dictionary.ts`), icons (`IconFlame` / `IconAward` in `BadgesSection.tsx`), and the explicit `PLANNED_BADGE_KEYS` split with the comment "not yet awardable." The `user_badges.badge` FK (added in the same hardening migration) means any upsert attempt for these two keys today fails at the DB — they cannot be awarded, planned or not, until they exist as catalog rows. Confirms the roadmap's own open question: **yes, a migration is required first.**

## Migration

`badge_catalog.track` is currently `not null`, but nothing in the app ever reads that column — it exists purely as a DB-side annotation paired with `CHALLENGE_TRACKS`, never selected in TS. `streak-7` and `all-tracks` are cross-track achievements with no single track to attach, so the column becomes nullable rather than inventing a sentinel track value:

```sql
-- supabase/migrations/<timestamp>_gamification_quickwins.sql
alter table public.badge_catalog alter column track drop not null;

insert into public.badge_catalog (key, track) values
  ('streak-7', null),
  ('all-tracks', null)
on conflict (key) do nothing;
```

`TRACK_BY_BADGE_KEY.get("streak-7")` / `.get("all-tracks")` already resolve to `undefined` (neither is in `CHALLENGE_TRACKS`), so `BadgesSection`'s existing "no track → plain green tile" branch (`specs/color-tokens-badges.md` surface 1) needs no change — the tile styling is already correct for a null-track badge.

## Award conditions

Both are evaluated by a single new function, `awardMilestoneBadges(supabase, userId)`, added to `features/playground/server/session-service.ts` next to `awardTrackBadge`, called right after it from both existing hook points (`completeChallenge` and `completeTrackChallenge` in `app/actions/playground.ts`) — same place, same idempotent-upsert shape, no new call sites needed.

**`streak-7`** — `user_stats.current_streak >= 7`, read fresh right after `markSessionCompleted` (the DB trigger that maintains `current_streak` has already fired by then, in the same request). This is the roadmap's own wording — "racha viva ≥7" (**alive** streak, not `best_streak`) — and it composes correctly with the upsert-once semantics every other badge already uses: once the streak trigger reports 7, the badge is written and never revoked, even though `current_streak` itself keeps resetting on missed days. `best_streak` was considered and rejected — it duplicates what `current_streak` already gives at the moment of completion, and reading it would silently change the badge's meaning from "you hit a 7-day streak" to "your longest streak, backfilled," which isn't what the copy ("Practiced 7 days in a row") describes.

**`all-tracks`** — held iff the user already holds all 5 track badges (`review-corps`, `ship-it`, `coverage-hero`, `first-merge`, `doc-writer`). This is equivalent to "completed ≥1 challenge in every category" (each track badge is itself gated on exactly that condition via `awardTrackBadge`), but checking `user_badges` directly is one query against a 5-row result instead of re-deriving category membership from `challenge_sessions` + `CHALLENGE_TRACKS` prefix matching — reuses state that's already correct rather than recomputing it.

```ts
const STREAK_BADGE_KEY = "streak-7"
const STREAK_THRESHOLD = 7
const ALL_TRACKS_BADGE_KEY = "all-tracks"

export const awardMilestoneBadges = async (
  supabase: SupabaseServerClient,
  userId: string
): Promise<void> => {
  const [{ data: stats, error: statsError }, { data: trackBadges, error: badgesError }] =
    await Promise.all([
      supabase.from("user_stats").select("current_streak").eq("user_id", userId).maybeSingle(),
      supabase
        .from("user_badges")
        .select("badge")
        .eq("user_id", userId)
        .in(
          "badge",
          CHALLENGE_TRACKS.map((t) => t.badgeKey)
        ),
    ])

  if (statsError !== null || badgesError !== null) {
    console.error("awardMilestoneBadges: failed to check milestones", statsError ?? badgesError)
    return
  }

  const toAward: string[] = []
  if (((stats?.current_streak as number | undefined) ?? 0) >= STREAK_THRESHOLD) {
    toAward.push(STREAK_BADGE_KEY)
  }
  if ((trackBadges?.length ?? 0) === CHALLENGE_TRACKS.length) {
    toAward.push(ALL_TRACKS_BADGE_KEY)
  }
  if (toAward.length === 0) return

  const { error } = await supabase.from("user_badges").upsert(
    toAward.map((badge) => ({ user_id: userId, badge })),
    { onConflict: "user_id,badge", ignoreDuplicates: true }
  )

  if (error !== null) {
    console.error("awardMilestoneBadges: failed to award badges", error)
  }
}
```

Called from both hooks unconditionally (not gated on which track just completed) — `all-tracks` can only newly flip true right after a track badge is (re-)checked, and `streak-7` depends only on `user_stats`, not on which challenge triggered the streak update. Running it from both `completeChallenge` and `completeTrackChallenge` mirrors exactly where `awardTrackBadge` already runs, so there's no new decision about "which completion paths matter" — same set of paths, same order (`awardTrackBadge` then `awardMilestoneBadges`, so `all-tracks`'s own read sees a track badge awarded earlier in the same request).

## Frontend bookkeeping

`features/playground/components/BadgesSection.tsx`:

```ts
const AWARDED_BADGE_KEYS = [
  "first-merge",
  "review-corps",
  "coverage-hero",
  "ship-it",
  "doc-writer",
  "streak-7",
  "all-tracks",
] as const

const PLANNED_BADGE_KEYS = [] as const
```

Purely a documentation-accuracy change — `BADGE_KEYS`, tile rendering, and lock-message logic are already list-agnostic (`BADGE_KEYS = [...AWARDED_BADGE_KEYS, ...PLANNED_BADGE_KEYS]`), so this has no visual effect on its own. It matters because the hub page's `earnedBadges` set (`app/[lang]/playground/page.tsx`) already reads every row from `user_badges` unconditionally — both badges start appearing as earned the moment the catalog + award-logic changes ship, with zero changes needed there.

Leaving `PLANNED_BADGE_KEYS` as an empty array rather than deleting the split — module 2+ may introduce its own planned-badge teasers later, and the constant costs nothing to keep.

## Out of scope

- **Result-page "NEW" toast tag** for these two badges. `reward-service.ts`'s `getCompletionReward` currently derives `badgeNewlyEarned` only for the track badge tied to the just-completed slug; extending it to a set of newly-earned badge keys (to cover streak-7/all-tracks lighting up mid-session) is a small but separate change, deferred so this PR stays a pure award-path fix. The badge still appears — correctly earned — on the user's next visit to the hub; it just doesn't get the toast highlight the first time it's earned.
- Any point/tier value for these badges — the catalog schema still carries none, consistent with the existing 5.
- Retroactive award for users who already have a live 7-day streak or all 5 track badges before this ships. The upsert only runs on the _next_ completion, not as a backfill. Flagging for the owner: if that matters at launch, a one-off manual insert (`insert into user_badges select user_id, 'streak-7' from user_stats where current_streak >= 7 on conflict do nothing`, and the equivalent all-tracks query) can run by hand after the migration — not included here since it's a one-time operational step, not app logic.

## Acceptance criteria

- `badge_catalog` contains `streak-7` and `all-tracks` with `track = null`; the `user_badges` FK accepts both keys.
- Completing a challenge while `user_stats.current_streak >= 7` awards `streak-7` (verify via a seeded streak in local Supabase).
- Completing a challenge that leaves the user holding all 5 track badges awards `all-tracks`.
- Both badges are idempotent — replaying either condition after the badge is already held is a no-op (`ignoreDuplicates`).
- `BadgesSection` renders both as earned (green tile, no-track styling) once awarded; the hub page needs no changes to pick this up.
- `types:check` / `lint` / `build` green; SonarCloud full report reviewed, 0 new issues.
- Visual check on localhost (owner): build a 7-day streak or complete one challenge per track on a test account, confirm both badges unlock with no page-code change beyond this PR.

## Action plan (single PR)

1. Issue `feat(playground): award streak-7 and all-tracks badges (gamification quick-wins, module 1/4)` + branch `<N>-gamification-quickwins`.
2. Commit 1 — `docs(spec)`: this file.
3. Commit 2 — `feat(db)`: migration — `track` nullable + the two catalog rows.
4. Commit 3 — `feat(playground)`: `awardMilestoneBadges` in `session-service.ts`, wired into both hooks in `app/actions/playground.ts`.
5. Commit 4 — `feat(playground)`: `BadgesSection.tsx` — move both keys to `AWARDED_BADGE_KEYS`.
6. Checks + full SonarCloud report; owner verifies visually on localhost (seed a streak / complete all 5 tracks on a test account).
7. Merge (merge commit).
