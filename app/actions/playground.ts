"use server"

import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/supabase/auth-context"
import { localizedHref } from "@/lib/landing-dictionary"
import type {
  InlineComment,
  ReviewDecision,
  ReviewSnapshot,
  BugFixSnapshot,
  TestingSnapshot,
  GitSnapshot,
  GitBlockResolution,
  DocsSnapshot,
} from "@/features/playground/domain/review-types"
import {
  ensureSession,
  saveSnapshot,
  getInProgressSnapshot,
  markSessionCompleted,
  awardTrackBadge,
  awardMilestoneBadges,
} from "@/features/playground/server/session-service"

const resultHref = (lang: string, slug: string): string =>
  localizedHref(lang, `/playground/${slug}/active/result`)

export const startChallengeSession = async (
  slug: string,
  lang: string,
  activePath: string
): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await ensureSession(supabase, user.id, slug, lang)
  redirect(activePath)
}

export const saveReviewState = async (
  slug: string,
  lang: string,
  comments: InlineComment[],
  decision: ReviewDecision
): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await saveSnapshot(supabase, user.id, slug, { comments, decision } satisfies ReviewSnapshot)
}

export const completeChallenge = async (slug: string, lang: string): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return

  const snapshot = (await getInProgressSnapshot(supabase, user.id, slug)) as ReviewSnapshot | null
  if ((snapshot?.comments?.length ?? 0) === 0 || snapshot?.decision == null) return

  const completed = await markSessionCompleted(supabase, user.id, slug, lang)
  if (!completed) return
  await awardTrackBadge(supabase, user.id, slug)
  await awardMilestoneBadges(supabase, user.id)
  redirect(resultHref(lang, slug))
}

export const saveBugFixState = async (slug: string, lang: string, code: string): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await saveSnapshot(supabase, user.id, slug, { code } satisfies BugFixSnapshot)
}

export const completeTrackChallenge = async (slug: string, lang: string): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  const completed = await markSessionCompleted(supabase, user.id, slug, lang)
  if (!completed) return
  await awardTrackBadge(supabase, user.id, slug)
  await awardMilestoneBadges(supabase, user.id)
  redirect(resultHref(lang, slug))
}

export const saveTestingState = async (
  slug: string,
  lang: string,
  testCode: string
): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await saveSnapshot(supabase, user.id, slug, { testCode } satisfies TestingSnapshot)
}

export const saveGitState = async (
  slug: string,
  lang: string,
  code: string,
  resolutions: readonly GitBlockResolution[]
): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await saveSnapshot(supabase, user.id, slug, { code, resolutions } satisfies GitSnapshot)
}

export const saveDocsState = async (slug: string, lang: string, content: string): Promise<void> => {
  const { supabase, user } = await getAuthContext()
  if (user === null) return
  await saveSnapshot(supabase, user.id, slug, { content } satisfies DocsSnapshot)
}
