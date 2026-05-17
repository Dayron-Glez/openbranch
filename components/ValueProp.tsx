import { IconFork, IconGlobe, IconLock } from '@/icons';

export function ValueProp() {
  return (
    <div className="ob-values">
      <div className="ob-value">
        <span className="badge"><IconFork />community-owned</span>
        <h4>Every guide is a PR.</h4>
        <p>No gatekeepers. The same workflow we document is the one we use to write the docs.</p>
      </div>
      <div className="ob-value">
        <span className="badge"><IconGlobe />stack-agnostic</span>
        <h4>No framework agenda.</h4>
        <p>If a pattern only works in one stack, we say so. Most patterns here are older than your build tool.</p>
      </div>
      <div className="ob-value">
        <span className="badge"><IconLock />versioned</span>
        <h4>Advice with an expiry.</h4>
        <p>Every guide is dated, versioned, and revisited. We retire patterns that haven&apos;t aged well, on purpose.</p>
      </div>
    </div>
  );
}
