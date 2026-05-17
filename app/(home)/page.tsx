import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { TopicCard } from '@/components/TopicCard';
import { FeaturedGuide } from '@/components/FeaturedGuide';
import { ValueProp } from '@/components/ValueProp';
import { CommunityCTA } from '@/components/CommunityCTA';
import { Footer } from '@/components/Footer';
import {
  IconBranch, IconPR, IconFlask, IconTag, IconFork, IconBulb,
} from '@/icons';

export default function HomePage() {
  return (
    <>
      <div className="ob-ambient" aria-hidden />
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />

        {/* Stats strip */}
        <div className="ob-stats">
          {[
            { n: '128', unit: '+', label: 'Guides & recipes' },
            { n: '2,400', unit: '', label: 'Contributors' },
            { n: '12.4', unit: 'k', label: 'GitHub stars' },
            { n: '47', unit: '', label: 'Languages translated' },
          ].map(({ n, unit, label }) => (
            <div key={label} className="ob-stat">
              <div className="n">{n}{unit && <span className="unit">{unit}</span>}</div>
              <div className="l">{label}</div>
            </div>
          ))}
        </div>

        {/* Topics */}
        <section className="ob-block" id="topics">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />What you&apos;ll find</span>
            <h2>Practical answers, <span className="quiet">not opinions disguised as best practices.</span></h2>
            <p>Every guide is rooted in a real codebase, signed off by the maintainers who shipped it, and revisited when reality disagrees. Browse by topic.</p>
          </div>
          <div className="ob-topics">
            <TopicCard featured href="#" icon={<IconBranch />} title="Branching strategies"
              description="Trunk-based, release branches, GitFlow — when each one earns its keep, and the warning signs you've outgrown it."
              count="24 guides" updated="updated 2d ago" />
            <TopicCard href="#" icon={<IconPR />} title="Pull requests & review"
              description="Templates that get reviewed, size limits that stick, and how to leave a comment that doesn't make someone defensive."
              count="18 guides" updated="updated 5d ago" />
            <TopicCard href="#" icon={<IconFlask />} title="Testing patterns"
              description="Contract tests, snapshot hygiene, killing flaky CI — patterns that hold up at 50 engineers and 50,000."
              count="31 guides" updated="updated 1w ago" />
            <TopicCard href="#" icon={<IconTag />} title="Releases & versioning"
              description="Semver in practice, changelogs your users actually read, and rollback drills that don't require a hero."
              count="14 guides" updated="updated 1w ago" />
            <TopicCard href="#" icon={<IconFork />} title="Contribution flows"
              description="Onboarding new contributors, RFCs that ship, governance that scales without smothering momentum."
              count="22 guides" updated="updated 3d ago" />
            <TopicCard href="#" icon={<IconBulb />} title="Lessons from real teams"
              description='Post-mortems, redesigns, and the "we should have done this 6 months earlier" stories worth reading.'
              count="19 stories" updated="updated yesterday" />
          </div>
        </section>

        {/* Featured guide */}
        <section className="ob-block">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />This week&apos;s pick</span>
            <h2>Real guides, <span className="quiet">read like you&apos;re pairing with someone senior.</span></h2>
          </div>
          <FeaturedGuide />
        </section>

        {/* Values */}
        <section className="ob-block">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />Why openbranch</span>
            <h2>Built like the codebases <span className="quiet">it documents.</span></h2>
          </div>
          <ValueProp />
        </section>

        <CommunityCTA />
      </main>
      <Footer />
    </>
  );
}
