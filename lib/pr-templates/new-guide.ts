import { gitConfig } from "@/lib/shared"
import type { Wanted } from "@/lib/wanted"

function buildTemplate(wanted: Wanted): string {
  return `---
title: ${wanted.title}
description: ${wanted.description}
topic: ${wanted.topic}
maturity: draft
authors: []
---

{/* requested by ${wanted.requested_count} readers${wanted.est_minutes ? ` · est ~${wanted.est_minutes}min` : ""} */}

## Why it works

TODO

## What it looks like

TODO

## When not to use it

TODO

## Failure modes

TODO
`
}

export function buildPrUrl(wanted: Wanted): string {
  const owner = process.env.NEXT_PUBLIC_REPO_OWNER ?? gitConfig.user
  const repo = process.env.NEXT_PUBLIC_REPO_NAME ?? gitConfig.repo
  const branch = gitConfig.branch

  const filePath = `content/docs/${wanted.topic}/${wanted.id}.mdx`
  const template = buildTemplate(wanted)
  const commitMsg = `docs(${wanted.topic}): add ${wanted.id}`

  const params = new URLSearchParams({
    value: template,
    message: commitMsg,
  })

  return `https://github.com/${owner}/${repo}/new/${branch}/${filePath}?${params.toString()}`
}
