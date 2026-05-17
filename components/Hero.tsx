'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import {
  Terminal, TerminalLine, Prompt, Ok, Highlight, Dim, BranchBlock, Cursor,
} from '@/components/Terminal';
import { IconArrowRight } from '@/icons';

const PHRASES = [
  'shipping software.',
  'merging branches.',
  'reviewing pull requests.',
  'writing better tests.',
  'building great teams.',
];

const buttonBase =
  'inline-flex h-[42px] items-center gap-2 rounded-[var(--r-8)] border border-transparent px-5 text-sm font-medium leading-none tracking-[0] no-underline transition-[background,border-color,color,filter] duration-[var(--d-fast)] ease-[var(--ease)] [&_svg]:size-3.5';

export function Hero() {
  const [logoRun, setLogoRun] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'deleting'>('typing');

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    if (phase === 'typing') {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 65);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('deleting'), 3800);
      return () => clearTimeout(t);
    }
    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(d => d.slice(0, -1)), 32);
        return () => clearTimeout(t);
      }
      setPhraseIdx(i => (i + 1) % PHRASES.length);
      setPhase('typing');
    }
  }, [displayed, phase, phraseIdx]);

  const stats = [
    { n: '128', unit: '+', label: 'Guides & recipes' },
    { n: '2,400', unit: '', label: 'Contributors' },
    { n: '12.4', unit: 'k', label: 'GitHub stars' },
    { n: '47', unit: '', label: 'Languages translated' },
  ];

  return (
    <section className="relative pt-18">
      {/* Centred intro content */}
      <div className="text-center">
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

        <h1 className="intro-title mx-auto mb-6 text-[48px] font-normal leading-[1.12] tracking-[-0.03em] max-[980px]:text-[38px] max-[520px]:text-[32px]">
          The open guide to
          <br />
          <span className="font-medium text-ob-accent">
            {displayed}
            <span
              aria-hidden
              className="ml-px inline-block w-[2px] translate-y-[1px] rounded-sm bg-ob-accent align-baseline animate-[ob-blink_1s_steps(1)_infinite]"
              style={{ height: '0.85em' }}
            />
          </span>
        </h1>
        <p className="intro-copy mx-auto mb-9 max-w-[48ch] text-pretty text-lg leading-[1.55] text-fg-2">
          A community handbook on how real teams actually ship software.
        </p>

        <div className="intro-actions flex flex-wrap justify-center gap-2.5">
          <Link href="/docs" className={`${buttonBase} group bg-ob-accent text-accent-ink hover:brightness-[1.06]`}>
            Read the handbook
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </Link>
        </div>
      </div>

      {/* Terminal */}
      <div className="intro-terminal relative mx-auto mt-16 max-w-[920px] before:absolute before:inset-[-1px] before:-z-10 before:bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(94,227,154,.20),transparent_60%)] before:blur-[40px] before:content-['']">
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

      {/* Stats strip — part of intro, no extra gap */}
      <div className="mt-12 grid grid-cols-4 border-y border-line py-6 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
        {stats.map(({ n, unit, label }, i) => (
          <div
            key={label}
            className={`px-6 py-2 max-[980px]:py-4 border-line
              ${i < 3 ? 'border-r' : ''}
              ${i === 1 ? 'max-[980px]:border-r-0' : ''}
              ${i < 2 ? 'max-[980px]:border-b max-[980px]:pb-4' : ''}
              max-[520px]:border-r-0 max-[520px]:border-b max-[520px]:last:border-b-0`}
          >
            <div className="text-[28px] font-medium tracking-[0]">
              {n}{unit && <span className="ml-0.5 text-base font-normal text-fg-muted">{unit}</span>}
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-muted">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
