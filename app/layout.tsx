import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://openbranch.vercel.app'),
  title: {
    template: '%s — openbranch',
    default: 'openbranch — The open guide to building software the right way',
  },
  description:
    'A living guide on best practices, contribution workflows, testing patterns, Git strategies, and lessons learned in real projects.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    images: [{ url: '/logo.svg' }],
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
