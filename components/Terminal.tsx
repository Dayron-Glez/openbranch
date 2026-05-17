import type { ReactNode } from 'react';

type TerminalProps = {
  title?: string;
  tags?: string[];
  children: ReactNode;
};

export function Terminal({ title = '~/atlas · git', tags = ['main', 'fish'], children }: TerminalProps) {
  return (
    <div className="ob-terminal">
      <div className="ob-terminal-bar">
        <div className="tdots">
          <span className="td" /><span className="td" /><span className="td" />
        </div>
        <span className="ttitle">{title}</span>
        <div className="tactions">
          {tags.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
      <div className="ob-terminal-body">{children}</div>
    </div>
  );
}

export function TerminalLine({ children }: { children: ReactNode }) {
  return <div className="tln">{children}</div>;
}

export function Prompt() {
  return <span className="pmt">$</span>;
}

export function Ok() {
  return <span className="ok">✓</span>;
}

export function Highlight({ children }: { children: ReactNode }) {
  return <span className="hl">{children}</span>;
}

export function Dim({ children }: { children: ReactNode }) {
  return <span className="dim">{children}</span>;
}

export function BranchBlock({ children }: { children: ReactNode }) {
  return <div className="ob-branchblock">{children}</div>;
}

export function Cursor() {
  return <span className="ob-cur" aria-hidden />;
}
