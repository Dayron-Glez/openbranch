import type { ReactNode } from 'react';
import { IconArrowRight } from '@/icons';

type TopicCardProps = {
  href?: string;
  icon: ReactNode;
  title: string;
  description: string;
  count: string;
  updated: string;
  featured?: boolean;
};

export function TopicCard({ href = '#', icon, title, description, count, updated, featured }: TopicCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-3 overflow-hidden rounded-[var(--r-12)] border border-line bg-bg-card px-7 pb-6 pt-7 text-inherit no-underline transition-[background,border-color] duration-[var(--d-base)] ease-[var(--ease)] hover:border-line-2 hover:bg-bg-hover"
    >
      <span className="mb-1.5 inline-flex size-10 items-center justify-center rounded-[var(--r-8)] border border-line bg-bg-elev text-ob-accent [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="m-0 text-lg font-medium tracking-[0]">{title}</h3>
      <p className="m-0 max-w-[36ch] text-[13.5px] leading-[1.55] text-fg-muted">{description}</p>
      <div className="mt-2.5 flex items-center gap-3 font-mono text-[11px] tracking-[0.04em] text-fg-muted">
        <span className="rounded-[var(--r-6)] border border-line bg-bg-elev px-[7px] py-0.5 text-fg-2">{count}</span>
        <span>{updated}</span>
        <span className="ml-auto transition-[transform,color] duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px] group-hover:text-fg [&_svg]:size-3.5"><IconArrowRight /></span>
      </div>
    </a>
  );
}
