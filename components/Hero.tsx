import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import {
  Terminal, TerminalLine, Prompt, Ok, Highlight, Dim, BranchBlock, Cursor,
} from '@/components/Terminal';
import { IconArrowRight, IconGithub, IconFork, IconGlobe } from '@/icons';

export function Hero() {
  return (
    <section className="ob-hero">
      <a href="#" className="ob-hero-pill">
        <span className="tag">new</span>
        <span>v1.4 · Branching strategies are live</span>
        <span className="arrow">↗</span>
      </a>

      <div className="ob-hero-logo">
        <LogoMark size={64} animate />
      </div>

      <h1>
        The open guide to <span className="hl">shipping software,</span>{' '}
        <span className="quiet">written by the people who do.</span>
      </h1>
      <p className="tagline">
        A living, community-built handbook on how teams actually merge, test, and grow real codebases
        — stack-agnostic, no fluff, always evolving.
      </p>

      <div className="ob-hero-cta">
        <Link href="/docs" className="ob-btn ob-btn-primary ob-btn-lg ob-btn-arrow">
          Read the handbook
          <IconArrowRight className="arr" />
        </Link>
        <a
          href="https://github.com/Dayron-Glez/openbranch"
          target="_blank"
          rel="noopener noreferrer"
          className="ob-btn ob-btn-secondary ob-btn-lg"
        >
          <IconGithub />
          Star on GitHub
          <span style={{ color: 'var(--fg-muted)', fontSize: '11.5px', marginLeft: '4px', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            12.4k
          </span>
        </a>
      </div>

      <div className="ob-hero-meta">
        <span className="item"><span className="dot" /> open source · MIT</span>
        <span className="item"><IconFork /> contributed by 200+ teams</span>
        <span className="item"><IconGlobe /> stack-agnostic</span>
      </div>

      <div className="ob-hero-preview">
        <Terminal>
          <TerminalLine><Prompt /><span><Highlight>openbranch</Highlight> recipe <Dim>&quot;trunk-based&quot;</Dim></span></TerminalLine>
          <TerminalLine><Dim>→ fetching guide · 2.1 KB · cached</Dim></TerminalLine>
          <BranchBlock>
            <TerminalLine><span className="node">●</span><span>a4f1e2c</span><Dim>Pull from main, branch with intent (&lt;24h)</Dim></TerminalLine>
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
