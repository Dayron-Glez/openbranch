"use client"

import type { ReactElement } from "react"
import { Terminal, TerminalLine, Prompt, Dim, BranchBlock, Cursor } from "@/shared/Terminal"
import { AUTH_COMMANDS, useAuthTerminal } from "../hooks/use-auth-terminal"

/**
 * A still from `git-merge-conflict` — the one challenge whose shape reads in
 * four lines. Everything here is that challenge's own material: `auth/session.ts`
 * is its editable file and the three conflicts are the ones it ships with, so
 * the panel cannot drift into advertising something the playground does not do.
 *
 * `minutes` arrives from the challenge's frontmatter rather than being typed in,
 * for the same reason.
 */
type AuthTerminalProps = {
  readonly minutes: number | null
}

export const AuthTerminal = ({ minutes }: AuthTerminalProps): ReactElement => {
  const { typedChars, beat, done } = useAuthTerminal()

  return (
    <Terminal
      title="~/atlas · git-merge-conflict"
      tags={minutes === null ? ["git"] : ["git", `${minutes} min`]}
    >
      {/* Reserved up front: the lines appear one at a time, and without this the
          panel around them reflows on every beat. */}
      <div className="min-h-[156px]">
        <TerminalLine>
          <Prompt />
          <span>
            {AUTH_COMMANDS[0].slice(0, typedChars[0])}
            {beat === 0 && <Cursor />}
          </span>
        </TerminalLine>

        {beat >= 1 && (
          <TerminalLine>
            <Prompt />
            <span>
              {AUTH_COMMANDS[1].slice(0, typedChars[1])}
              {beat === 1 && <Cursor />}
            </span>
          </TerminalLine>
        )}

        {beat >= 2 && (
          <BranchBlock>
            <div>
              <span className="text-danger">CONFLICT</span>
              <span> (content): auth/session.ts</span>
            </div>
            {beat >= 3 && <Dim>3 conflicts · both branches changed the same auth module</Dim>}
          </BranchBlock>
        )}

        {beat >= 4 && (
          <TerminalLine>
            <Prompt />
            <span>
              {AUTH_COMMANDS[2].slice(0, typedChars[2])}
              {done && <Cursor />}
            </span>
          </TerminalLine>
        )}
      </div>
    </Terminal>
  )
}
