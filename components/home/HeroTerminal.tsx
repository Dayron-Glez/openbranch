"use client"

import {
  Terminal,
  TerminalLine,
  Prompt,
  Ok,
  Highlight,
  Dim,
  BranchBlock,
  Cursor,
} from "@/components/home/Terminal"
import { CMD1, CMD2, useTerminalAnimation } from "@/lib/hooks/use-terminal-animation"

export function HeroTerminal() {
  const { step, cmd1Chars, cmd2Chars } = useTerminalAnimation()

  return (
    <Terminal>
      {step >= 0 && (
        <TerminalLine>
          <Prompt />
          <span>
            {step === 0 ? (
              <>
                {CMD1.slice(0, cmd1Chars)}
                <Cursor />
              </>
            ) : (
              <>
                <Highlight>openbranch</Highlight>
                {" recipe "}
                <Dim>&quot;trunk-based&quot;</Dim>
              </>
            )}
          </span>
        </TerminalLine>
      )}

      {step >= 1 && (
        <TerminalLine>
          <Dim>→ fetching guide · 2.1 KB · cached</Dim>
        </TerminalLine>
      )}

      {step >= 2 && (
        <BranchBlock>
          <TerminalLine>
            <span className="text-ob-accent">◉</span>
            <span className="terminal-hash">a4f1e2c</span>
            <Dim>Pull from main, branch with intent (&lt;24h)</Dim>
          </TerminalLine>
          {step >= 3 && (
            <TerminalLine>
              <span>○</span>
              <span className="terminal-hash">9b2d8a1</span>
              <Dim>Wrap unfinished work in a feature flag</Dim>
            </TerminalLine>
          )}
          {step >= 4 && (
            <TerminalLine>
              <span>○</span>
              <span className="terminal-hash">7c0e44d</span>
              <Dim>Open PR · &lt; 400 lines diff target</Dim>
            </TerminalLine>
          )}
          {step >= 5 && (
            <TerminalLine>
              <span>○</span>
              <span className="terminal-hash">3f12a89</span>
              <Dim>Squash · merge · delete branch</Dim>
            </TerminalLine>
          )}
        </BranchBlock>
      )}

      {step >= 6 && (
        <TerminalLine>
          <Prompt />
          <span>
            {step === 6 ? (
              <>
                {CMD2.slice(0, cmd2Chars)}
                <Cursor />
              </>
            ) : (
              <>
                <Highlight>openbranch</Highlight>
                {" apply "}
                <Dim>--to atlas/</Dim>
              </>
            )}
          </span>
        </TerminalLine>
      )}

      {step >= 7 && (
        <TerminalLine>
          <Ok />
          <span>
            Generated <Highlight>CONTRIBUTING.md</Highlight>
            {" · "}
            <Highlight>.github/PULL_REQUEST_TEMPLATE.md</Highlight>
          </span>
        </TerminalLine>
      )}
      {step >= 8 && (
        <TerminalLine>
          <Ok />
          <span>Wired branch protections · enforced PR size limit · 2-reviewer rule</span>
        </TerminalLine>
      )}

      {(step === -1 || step >= 9) && (
        <TerminalLine>
          <Prompt />
          <Cursor />
        </TerminalLine>
      )}
    </Terminal>
  )
}
