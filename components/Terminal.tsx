import type { ReactNode } from 'react';

type TerminalProps = {
  title?: string;
  tags?: string[];
  children: ReactNode;
};

export function Terminal({ title = '~/atlas · git', tags = ['main', 'fish'], children }: TerminalProps) {
  return (
    <div className="overflow-hidden rounded-[var(--r-12)] border border-line-2 bg-bg-card shadow-[var(--sh-4)]">
      <div className="flex items-center gap-2 border-b border-line bg-bg-elev px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-line-2" />
          <span className="size-2.5 rounded-full bg-line-2" />
          <span className="size-2.5 rounded-full bg-line-2" />
        </div>
        <span className="ml-2 font-mono text-xs text-fg-muted">{title}</span>
        <div className="ml-auto flex gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-[var(--r-6)] border border-line px-2 py-0.5 font-mono text-[10.5px] text-fg-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="px-6 py-[22px] font-mono text-[13.5px] leading-[1.75] text-fg max-[520px]:overflow-x-auto max-[520px]:px-4">{children}</div>
    </div>
  );
}

export function TerminalLine({ children }: { children: ReactNode }) {
  return <div className="flex gap-[14px]">{children}</div>;
}

export function Prompt() {
  return <span className="select-none text-ob-accent">$</span>;
}

export function Ok() {
  return <span className="text-ob-accent">✓</span>;
}

export function Highlight({ children }: { children: ReactNode }) {
  return <span className="text-fg">{children}</span>;
}

export function Dim({ children }: { children: ReactNode }) {
  return <span className="text-fg-muted">{children}</span>;
}

export function BranchBlock({ children }: { children: ReactNode }) {
  return <div className="my-1.5 ml-[14px] border-l border-line pl-[14px] text-[12.5px] text-fg-2">{children}</div>;
}

export function Cursor() {
  return <span className="ml-1 inline-block h-[14px] w-2 translate-y-[3px] bg-current motion-safe:animate-[ob-blink_1.1s_steps(1)_infinite]" aria-hidden />;
}
