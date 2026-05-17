import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';

export function Footer() {
  return (
    <footer className="ob-footer">
      <div className="ob-footer-grid">
        <div className="col ob-footer-brand">
          <Link href="/" className="ob-brand">
            <LogoMark size={22} />
            <span className="ob-brand-wm">
              <span className="o">open</span><span className="b">branch</span>
            </span>
          </Link>
          <p className="blurb">
            A community-built handbook for how teams ship software. Free, open source, always evolving.
          </p>
        </div>
        <div className="col">
          <h5>Docs</h5>
          <Link href="/docs/git">Branching</Link>
          <Link href="/docs/testing">Testing</Link>
          <Link href="/docs/contributing">Reviews</Link>
          <Link href="/docs/best-practices">Releases</Link>
        </div>
        <div className="col">
          <h5>Community</h5>
          <a href="https://github.com/Dayron-Glez/openbranch/graphs/contributors" target="_blank" rel="noopener noreferrer">Contributors</a>
          <a href="https://github.com/Dayron-Glez/openbranch/discussions" target="_blank" rel="noopener noreferrer">Discussions</a>
          <a href="#">RFC process</a>
          <a href="#">Code of conduct</a>
        </div>
        <div className="col">
          <h5>Resources</h5>
          <a href="#">Changelog</a>
          <a href="#">Style guide</a>
          <a href="#">Translations</a>
          <a href="#">Brand assets</a>
        </div>
        <div className="col">
          <h5>About</h5>
          <a href="#">Maintainers</a>
          <a href="#">License · MIT</a>
          <a href="#">Sponsors</a>
          <a href="#">Press kit</a>
        </div>
      </div>
      <div className="ob-footer-bottom">
        <span>openbranch · v1.4 · built by 2,400+ contributors</span>
        <div className="right">
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#">RSS</a>
          <a href="#">Status</a>
        </div>
      </div>
    </footer>
  );
}
