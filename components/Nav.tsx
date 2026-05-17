'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import { IconSearch, IconGithub, IconArrowRight } from '@/icons';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`ob-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="ob-nav-inner">
        <Link href="/" className="ob-brand" aria-label="openbranch">
          <LogoMark size={22} />
          <span className="ob-brand-wm">
            <span className="o">open</span><span className="b">branch</span>
          </span>
        </Link>

        <div className="ob-nav-links">
          <Link href="/docs">Docs</Link>
          <Link href="/docs/git">Guides</Link>
          <Link href="#">Changelog</Link>
          <Link href="#">Community</Link>
        </div>

        <div className="ob-nav-right">
          <button className="ob-nav-search" aria-label="Search the docs">
            <IconSearch />
            <span className="placeholder">Search the docs…</span>
            <span className="kbd">⌘&nbsp;K</span>
          </button>
          <a
            className="ob-icon-btn"
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <IconGithub />
          </a>
          <Link href="/docs" className="ob-btn ob-btn-primary ob-btn-arrow">
            Get started
            <IconArrowRight className="arr" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
