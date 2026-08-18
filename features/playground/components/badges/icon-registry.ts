import type { ComponentType } from "react"
import type { BadgeKey } from "@/features/playground/domain/manifest"
import { MergeIcon } from "./icons/MergeIcon"
import { PrIcon } from "./icons/PrIcon"
import { FlaskIcon } from "./icons/FlaskIcon"
import { RocketIcon } from "./icons/RocketIcon"
import { BookIcon } from "./icons/BookIcon"
import { FlameIcon } from "./icons/FlameIcon"
import { AwardIcon } from "./icons/AwardIcon"

export const BADGE_UNLOCK_ICON: Record<BadgeKey, ComponentType<{ readonly t: number }>> = {
  "first-merge": MergeIcon,
  "review-corps": PrIcon,
  "coverage-hero": FlaskIcon,
  "ship-it": RocketIcon,
  "doc-writer": BookIcon,
  "streak-7": FlameIcon,
  "all-tracks": AwardIcon,
}

/**
 * Each icon's own natural settle point (its last `pop`/`draw` beat's end
 * time, plus a little breathing room) — not the source video's full
 * idling-loop length. A product reveal plays once and holds; it doesn't
 * loop like the composition did.
 */
export const BADGE_UNLOCK_DURATION: Record<BadgeKey, number> = {
  "first-merge": 1.6,
  "review-corps": 1.7,
  "coverage-hero": 1.8,
  "ship-it": 1.85,
  "doc-writer": 1.3,
  "streak-7": 1.6,
  "all-tracks": 1.9,
}
