"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
} from "@/lib/playground/review-types"

export const startChallengeSession = async (
  slug: string,
  lang: string,
  activePath: string
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: existing } = await supabase
    .from("challenge_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .maybeSingle()

  if (existing === null) {
    await supabase.from("challenge_sessions").insert({
      user_id: user.id,
      challenge_slug: slug,
      lang,
      status: "in_progress",
    })
  }

  redirect(activePath)
}

export const saveReviewState = async (
  slug: string,
  lang: string,
  comments: InlineComment[],
  decision: ReviewDecision
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  await supabase
    .from("challenge_sessions")
    .update({ snapshot: { comments, decision } satisfies ReviewSnapshot })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const completeChallenge = async (slug: string, lang: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: session } = await supabase
    .from("challenge_sessions")
    .select("snapshot")
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .maybeSingle()

  const snapshot = session?.snapshot as ReviewSnapshot | null
  if ((snapshot?.comments?.length ?? 0) === 0 || snapshot?.decision == null) return

  const { data: completedSession } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  if ((completedSession?.length ?? 0) === 0) return

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge", "review-corps")
    .maybeSingle()

  if (existingBadge === null) {
    const { data: completedReviews } = await supabase
      .from("challenge_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .like("challenge_slug", "code-review-%")

    if ((completedReviews?.length ?? 0) >= 1) {
      await supabase.from("user_badges").insert({ user_id: user.id, badge: "review-corps" })
    }
  }

  redirect(localizedHref(lang, `/playground/${slug}/active/result`))
}

export const saveBugFixState = async (slug: string, lang: string, code: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  await supabase
    .from("challenge_sessions")
    .update({ snapshot: { code } satisfies BugFixSnapshot })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const completeBugFixChallenge = async (slug: string, lang: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: completedBugSession } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  if ((completedBugSession?.length ?? 0) === 0) return

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge", "debug-master")
    .maybeSingle()

  if (existingBadge === null) {
    const { data: completedBugFixes } = await supabase
      .from("challenge_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .like("challenge_slug", "bug-fix-%")

    if ((completedBugFixes?.length ?? 0) >= 1) {
      await supabase.from("user_badges").insert({ user_id: user.id, badge: "debug-master" })
    }
  }

  redirect(localizedHref(lang, `/playground/${slug}/active/result`))
}

export const saveTestingState = async (
  slug: string,
  lang: string,
  testCode: string
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  await supabase
    .from("challenge_sessions")
    .update({ snapshot: { testCode } satisfies TestingSnapshot })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const completeTestingChallenge = async (slug: string, lang: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: completedTestingSession } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  if ((completedTestingSession?.length ?? 0) === 0) return

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge", "coverage-hero")
    .maybeSingle()

  if (existingBadge === null) {
    const { data: completedTests } = await supabase
      .from("challenge_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .like("challenge_slug", "testing-%")

    if ((completedTests?.length ?? 0) >= 1) {
      await supabase.from("user_badges").insert({ user_id: user.id, badge: "coverage-hero" })
    }
  }

  redirect(localizedHref(lang, `/playground/${slug}/active/result`))
}

export const saveGitState = async (
  slug: string,
  lang: string,
  code: string,
  resolutions: readonly GitBlockResolution[]
): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  await supabase
    .from("challenge_sessions")
    .update({ snapshot: { code, resolutions } satisfies GitSnapshot })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const saveDocsState = async (slug: string, lang: string, content: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  await supabase
    .from("challenge_sessions")
    .update({ snapshot: { content } satisfies DocsSnapshot })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
}

export const completeDocsChallenge = async (slug: string, lang: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: completedDocsSession } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  if ((completedDocsSession?.length ?? 0) === 0) return

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge", "doc-writer")
    .maybeSingle()

  if (existingBadge === null) {
    const { data: completedDocsChallenges } = await supabase
      .from("challenge_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .like("challenge_slug", "docs-%")

    if ((completedDocsChallenges?.length ?? 0) >= 1) {
      await supabase.from("user_badges").insert({ user_id: user.id, badge: "doc-writer" })
    }
  }

  redirect(localizedHref(lang, `/playground/${slug}/active/result`))
}

export const completeGitChallenge = async (slug: string, lang: string): Promise<void> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user === null) return

  const { data: completedGitSession } = await supabase
    .from("challenge_sessions")
    .update({ status: "completed", lang, completed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("challenge_slug", slug)
    .eq("status", "in_progress")
    .select("id")

  if ((completedGitSession?.length ?? 0) === 0) return

  const { data: existingBadge } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", user.id)
    .eq("badge", "first-merge")
    .maybeSingle()

  if (existingBadge === null) {
    const { data: completedGitChallenges } = await supabase
      .from("challenge_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .like("challenge_slug", "git-%")

    if ((completedGitChallenges?.length ?? 0) >= 1) {
      await supabase.from("user_badges").insert({ user_id: user.id, badge: "first-merge" })
    }
  }

  redirect(localizedHref(lang, `/playground/${slug}/active/result`))
}
