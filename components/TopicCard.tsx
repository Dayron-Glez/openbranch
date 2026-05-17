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
    <a href={href} className={`ob-topic${featured ? ' feat' : ''}`}>
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="footer-row">
        <span className="count">{count}</span>
        <span>{updated}</span>
        <span className="arr"><IconArrowRight /></span>
      </div>
    </a>
  );
}
