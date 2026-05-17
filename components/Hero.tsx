'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import {
  Terminal, TerminalLine, Prompt, Ok, Highlight, Dim, BranchBlock, Cursor,
} from '@/components/Terminal';
import { IconArrowRight, IconGithub, IconFork, IconGlobe } from '@/icons';

const buttonBase =
  'inline-flex h-[42px] items-center gap-2 rounded-[var(--r-8)] border border-transparent px-5 text-sm font-medium leading-none tracking-[0] no-underline transition-[background,border-color,color,filter] duration-[var(--d-fast)] ease-[var(--ease)] [&_svg]:size-3.5';

export function Hero() {
  const [logoRun, setLogoRun] = useState(0);

  return (
    <section className="relative mx-auto max-w-[1100px] px-8 pb-20 pt-24 text-center max-[520px]:px-5">
      <div className="intro-mark mb-8 flex min-h-16 justify-center">
        <button
          type="button"
          className="appearance-none border-0 bg-transparent p-0 text-fg outline-none focus:outline-none focus-visible:outline-none"
          aria-label="Replay openbranch logo animation"
          title="Click to replay"
          onClick={() => setLogoRun((run) => run + 1)}
        >
          <LogoMark key={logoRun} size={64} animate className="overflow-visible" />
        </button>
      </div>

      <h1 className="intro-title mx-auto mb-6 max-w-[18ch] text-balance text-[64px] font-normal leading-[1.02] tracking-[0] max-[980px]:text-5xl max-[520px]:text-[40px]">
        The open guide to <span className="font-medium text-ob-accent">shipping software,</span>{' '}
        <span className="font-light text-fg-2">written by the people who do.</span>
      </h1>
      <p className="intro-copy mx-auto mb-9 max-w-[56ch] text-pretty text-lg leading-[1.55] text-fg-2">
        A living, community-built handbook on how teams actually merge, test, and grow real codebases
        - stack-agnostic, no fluff, always evolving.
      </p>

      <div className="intro-actions flex flex-wrap justify-center gap-2.5">
        <Link href="/docs" className={`${buttonBase} group bg-ob-accent text-accent-ink hover:brightness-[1.06]`}>
          Read the handbook
          <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
        </Link>
        <a
          href="https://github.com/Dayron-Glez/openbranch"
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonBase} border-line-2 bg-bg-card text-fg hover:border-fg-faint hover:bg-bg-hover`}
        >
          <IconGithub />
          Star on GitHub
          <span className="ml-1 font-mono text-[11.5px] text-fg-muted">
            12.4k
          </span>
        </a>
      </div>

      <div className="intro-meta mt-7 flex flex-wrap justify-center gap-6 font-mono text-[11.5px] tracking-[0.02em] text-fg-muted">
        <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-ob-accent shadow-[0_0_0_3px_var(--color-accent-soft)]" /> open source · MIT</span>
        <span className="inline-flex items-center gap-1.5 [&_svg]:size-3"><IconFork /> contributed by 200+ teams</span>
        <span className="inline-flex items-center gap-1.5 [&_svg]:size-3"><IconGlobe /> stack-agnostic</span>
      </div>

      <div className="intro-terminal relative mx-auto mt-16 max-w-[920px] text-left before:absolute before:inset-[-1px] before:-z-10 before:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(94,227,154,.20),transparent_60%)] before:blur-[40px] before:content-['']">
        <Terminal>
          <TerminalLine><Prompt /><span><Highlight>openbranch</Highlight> recipe <Dim>&quot;trunk-based&quot;</Dim></span></TerminalLine>
          <TerminalLine><Dim>→ fetching guide · 2.1 KB · cached</Dim></TerminalLine>
          <BranchBlock>
            <TerminalLine><span className="text-ob-accent">●</span><span>a4f1e2c</span><Dim>Pull from main, branch with intent (&lt;24h)</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>9b2d8a1</span><Dim>Wrap unfinished work in a feature flag</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>7c0e44d</span><Dim>Open PR · &lt; 400 lines diff target</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>3f12a89</span><Dim>Squash · merge · delete branch</Dim></TerminalLine>
          </BranchBlock>
          <TerminalLine><Prompt /><span><Highlight>openbranch</Highlight> apply <Dim>--to atlas/</Dim></span></TerminalLine>
          <TerminalLine><Ok /><span>Generated <Highlight>CONTRIBUTING.md</Highlight> · <Highlight>.github/PULL_REQUEST_TEMPLATE.md</Highlight></span></TerminalLine>
          <TerminalLine><Ok /><span>Wired branch protections · enforced PR size limit · 2-reviewer rule</span></TerminalLine>
          <TerminalLine><Prompt /><Cursor /></TerminalLine>
        </Terminal>
      </div>
    </section>
  );
}
