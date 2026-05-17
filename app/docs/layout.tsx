import './docs.css';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { Logo } from '@/components/logo';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const base = baseOptions();
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...base}
      nav={{ ...base.nav, title: <Logo /> }}
      containerProps={{ style: { '--fd-sidebar-width': '220px' } as React.CSSProperties }}
    >
      {children}
    </DocsLayout>
  );
}
