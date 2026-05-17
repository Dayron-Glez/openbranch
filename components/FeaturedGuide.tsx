import { IconEye, IconHeart, IconPR, IconArrowRight, IconBulb } from '@/icons';

export function FeaturedGuide() {
  return (
    <div className="ob-featured">
      <div className="ob-feat-side">
        <span className="eyebrow">guide · 7 min read</span>
        <h3>Trunk-based development, when you can&apos;t ship feature flags first.</h3>
        <p>
          What to do when your tests are slow, your team is junior, and trunk-based feels like
          reckless advice. A field-tested middle path.
        </p>
        <div className="meta">
          <div className="author-stack">
            <span className="a">AK</span>
            <span className="a">JM</span>
            <span className="a">SP</span>
          </div>
          <span>Anya Kim &amp; 2 maintainers</span>
        </div>
        <div className="meta">
          <span><IconEye /> 18.2k reads</span>
          <span><IconHeart /> 940</span>
          <span><IconPR /> 12 revisions</span>
        </div>
        <div className="cta">
          <a href="#" className="ob-btn ob-btn-primary ob-btn-arrow">
            Read the guide
            <IconArrowRight className="arr" />
          </a>
        </div>
      </div>

      <article className="ob-feat-preview" aria-label="Guide preview">
        <h4><span className="anchor">#</span>The premise</h4>
        <p>
          Most trunk-based guides assume two things: <span className="ic">feature flags</span> are cheap
          to add, and your CI runs in under five minutes. If neither is true for you, the standard advice
          will quietly make things worse.
        </p>
        <p>Here&apos;s the version that works <em>before</em> you have either.</p>
        <div className="ob-callout">
          <IconBulb />
          <div>
            <div className="t">Rule of thumb</div>
            <div className="b">
              A branch older than 24 hours is a long-lived branch — even if you didn&apos;t mean it to be.
            </div>
          </div>
        </div>
        <h4><span className="anchor">#</span>The minimum viable setup</h4>
        <pre>
          <span className="pmt">$</span>{' '}git checkout -b feat/open-graph{'\n'}
          <span className="cm"># branch from trunk · &lt;24h lifespan target</span>{'\n'}
          <span className="pmt">$</span>{' '}openbranch lint --branch{'\n'}
          <span className="cm"># enforces naming, size, age limits before push</span>
        </pre>
      </article>
    </div>
  );
}
