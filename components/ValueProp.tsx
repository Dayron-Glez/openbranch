import { IconFork, IconGlobe, IconLock } from '@/icons';

const valueClass =
  'border-r border-line px-7 py-8 last:border-r-0 max-[980px]:border-b max-[980px]:border-r-0 max-[980px]:last:border-b-0';

const badgeClass =
  'mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-elev px-2 py-[3px] font-mono text-[10.5px] tracking-[0.04em] text-fg-muted [&_svg]:size-[11px]';

export function ValueProp() {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-[var(--r-12)] border border-line bg-bg-card max-[980px]:grid-cols-1">
      <div className={valueClass}>
        <span className={badgeClass}><IconFork />community-owned</span>
        <h4 className="m-0 mb-1.5 text-[17px] font-medium tracking-[0]">Every guide is a PR.</h4>
        <p className="m-0 max-w-[30ch] text-[13.5px] leading-[1.55] text-fg-muted">No gatekeepers. The same workflow we document is the one we use to write the docs.</p>
      </div>
      <div className={valueClass}>
        <span className={badgeClass}><IconGlobe />stack-agnostic</span>
        <h4 className="m-0 mb-1.5 text-[17px] font-medium tracking-[0]">No framework agenda.</h4>
        <p className="m-0 max-w-[30ch] text-[13.5px] leading-[1.55] text-fg-muted">If a pattern only works in one stack, we say so. Most patterns here are older than your build tool.</p>
      </div>
      <div className={valueClass}>
        <span className={badgeClass}><IconLock />versioned</span>
        <h4 className="m-0 mb-1.5 text-[17px] font-medium tracking-[0]">Advice with an expiry.</h4>
        <p className="m-0 max-w-[30ch] text-[13.5px] leading-[1.55] text-fg-muted">Every guide is dated, versioned, and revisited. We retire patterns that haven&apos;t aged well, on purpose.</p>
      </div>
    </div>
  );
}
