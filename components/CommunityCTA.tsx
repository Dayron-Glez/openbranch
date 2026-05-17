import { IconPR, IconGithub, IconArrowRight } from '@/icons';

const buttonBase =
  'inline-flex h-[42px] items-center gap-2 rounded-[var(--r-8)] border border-transparent px-5 text-sm font-medium leading-none tracking-[0] no-underline transition-[background,border-color,color,filter] duration-[var(--d-fast)] ease-[var(--ease)] [&_svg]:size-3.5';

export function CommunityCTA() {
  return (
    <section className="scroll-reveal" data-scroll-reveal>
      <div
        className="relative overflow-hidden rounded-[var(--r-16)] border border-line bg-bg-card px-12 py-16 text-center before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] before:bg-[size:24px_24px] before:[mask-image:radial-gradient(ellipse_60%_80%_at_center,black,transparent_70%)] before:content-[''] max-[980px]:px-6 max-[980px]:py-10"
        style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(94,227,154,.12), transparent 60%), var(--color-bg-card)' }}
      >
        <span className="relative mb-3.5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-ob-accent">made by the community</span>
        <h3 className="relative mx-auto mb-4 max-w-[22ch] text-balance text-[38px] font-medium leading-[1.1] tracking-[0] max-[980px]:text-[28px]">The handbook gets better every time you open a PR.</h3>
        <p className="relative mx-auto mb-8 max-w-[56ch] text-[15.5px] leading-[1.55] text-fg-2">
          Found a pattern that worked? Disagree with an existing guide? Open a pull request, write up your
          story, or just add a sentence - the way we work is the way the docs grow.
        </p>
        <div className="relative flex flex-wrap justify-center gap-2.5">
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className={`${buttonBase} group bg-ob-accent text-accent-ink hover:brightness-[1.06]`}>
            <IconPR />
            Open your first PR
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </a>
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className={`${buttonBase} border-line-2 bg-bg-card text-fg hover:border-fg-faint hover:bg-bg-hover`}>
            <IconGithub />
            Browse the repo
          </a>
        </div>

        <div className="relative mt-10 flex flex-col items-center gap-3.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-fg-muted">2,400+ contributors · last 30 days</span>
          <div className="inline-flex">
            {['AK', 'JM', 'SP', 'RN', 'TY', 'DL', 'MV', 'CH'].map((initials, index) => (
              <span
                key={initials}
                className={`inline-flex size-8 items-center justify-center rounded-full border border-line-2 bg-bg-elev font-mono text-[11px] text-fg-2 outline-2 outline-bg-card ${
                  index === 0 ? 'ml-0' : '-ml-2'
                }`}
              >
                {initials}
              </span>
            ))}
            <span className="-ml-2 inline-flex size-8 items-center justify-center rounded-full border border-transparent bg-accent-soft font-mono text-[11px] text-ob-accent outline-2 outline-bg-card">+2.4k</span>
          </div>
        </div>
      </div>
    </section>
  );
}
