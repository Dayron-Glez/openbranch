import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { TopicCard } from '@/components/TopicCard';
import { FeaturedGuide } from '@/components/FeaturedGuide';
import { ValueProp } from '@/components/ValueProp';
import { CommunityCTA } from '@/components/CommunityCTA';
import { Footer } from '@/components/Footer';
import { ScrollReveal } from '@/components/ScrollReveal';
import {
  IconBranch, IconPR, IconFlask, IconTag, IconFork, IconBulb,
} from '@/icons';

const eyebrowClass =
  'mb-3.5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted';

const ledClass =
  'mr-2 inline-block size-1.5 rounded-full bg-ob-accent align-[1px] shadow-[0_0_0_3px_var(--color-accent-soft)]';

const sectionClass = '';
const sectionHeadClass = 'mb-12 max-w-[720px]';
const headingClass = 'm-0 mb-[18px] text-balance text-[42px] font-medium leading-[1.05] tracking-[0] max-[980px]:text-[32px]';

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <div className="ambient pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="ambient-dots absolute inset-0" />
        <svg className="ambient-graph absolute inset-0 size-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          <path className="path l1" pathLength="100" d="M180 60  L 180 940" />
          <path className="path l2" pathLength="100" d="M380 120 L 380 880" />
          <path className="path l3" pathLength="100" d="M620 80  L 620 920" />
          <path className="path l4" pathLength="100" d="M860 140 L 860 860" />
          <path className="path l5" pathLength="100" d="M1080 100 L 1080 900" />
          <path className="path l6" pathLength="100" d="M1300 80 L 1300 940" />
          <path className="path l7" pathLength="100" d="M1480 140 L 1480 880" />
          <path className="path a2" pathLength="100" d="M180 320 C 180 260, 320 260, 380 320" />
          <path className="path a3" pathLength="100" d="M380 540 C 380 600, 540 600, 620 540" />
          <path className="path a4" pathLength="100" d="M620 720 C 620 660, 800 660, 860 720" />
          <path className="path a5" pathLength="100" d="M860 380 C 860 440, 1020 440, 1080 380" />
          <path className="path a6" pathLength="100" d="M1080 620 C 1080 560, 1240 560, 1300 620" />
          <path className="path a7" pathLength="100" d="M1300 240 C 1300 180, 1420 180, 1480 240" />
          <circle className="node n1" cx="180" cy="200" r="3.5" />
          <circle className="node n1" cx="180" cy="520" r="3.5" />
          <circle className="node-accent n1" cx="180" cy="760" r="3.5" />
          <circle className="node n2" cx="380" cy="220" r="3.5" />
          <circle className="node n2" cx="380" cy="440" r="3.5" />
          <circle className="node n2" cx="380" cy="720" r="3.5" />
          <circle className="node n3" cx="620" cy="180" r="3.5" />
          <circle className="node-accent n3" cx="620" cy="420" r="3.5" />
          <circle className="node n3" cx="620" cy="780" r="3.5" />
          <circle className="node n4" cx="860" cy="260" r="3.5" />
          <circle className="node n4" cx="860" cy="500" r="3.5" />
          <circle className="node n4" cx="860" cy="760" r="3.5" />
          <circle className="node n5" cx="1080" cy="220" r="3.5" />
          <circle className="node-accent n5" cx="1080" cy="500" r="3.5" />
          <circle className="node n5" cx="1080" cy="800" r="3.5" />
          <circle className="node n6" cx="1300" cy="180" r="3.5" />
          <circle className="node n6" cx="1300" cy="460" r="3.5" />
          <circle className="node n6" cx="1300" cy="780" r="3.5" />
          <circle className="node n7" cx="1480" cy="240" r="3.5" />
          <circle className="node n7" cx="1480" cy="540" r="3.5" />
          <circle className="node-accent n7" cx="1480" cy="800" r="3.5" />
        </svg>
        <div className="ambient-sweep absolute bottom-[-10%] top-[-10%]" />
      </div>
      <Nav />
      <main className="relative z-[1] mx-auto grid max-w-[1100px] gap-[100px] px-8 pb-[100px] max-[520px]:px-5">
        <Hero />

        <section className={sectionClass} id="topics">
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}><span className={ledClass} />What you&apos;ll find</span>
            <h2 className={headingClass}>Practical answers, <span className="font-light text-fg-2">not opinions disguised as best practices.</span></h2>
            <p className="m-0 max-w-[56ch] text-base leading-[1.55] text-fg-2">Every guide is rooted in a real codebase, signed off by the maintainers who shipped it, and revisited when reality disagrees. Browse by topic.</p>
          </div>
          <div className="scroll-reveal-stagger grid grid-cols-3 gap-3 max-[980px]:grid-cols-1" data-scroll-reveal>
            <TopicCard featured href="#" icon={<IconBranch />} title="Branching strategies"
              description="Trunk-based, release branches, GitFlow - when each one earns its keep, and the warning signs you've outgrown it."
              count="24 guides" updated="updated 2d ago" />
            <TopicCard href="#" icon={<IconPR />} title="Pull requests & review"
              description="Templates that get reviewed, size limits that stick, and how to leave a comment that doesn't make someone defensive."
              count="18 guides" updated="updated 5d ago" />
            <TopicCard href="#" icon={<IconFlask />} title="Testing patterns"
              description="Contract tests, snapshot hygiene, killing flaky CI - patterns that hold up at 50 engineers and 50,000."
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

        <section className={sectionClass}>
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}><span className={ledClass} />This week&apos;s pick</span>
            <h2 className={headingClass}>Real guides, <span className="font-light text-fg-2">read like you&apos;re pairing with someone senior.</span></h2>
          </div>
          <div className="scroll-reveal" data-scroll-reveal>
            <FeaturedGuide />
          </div>
        </section>

        <section className={sectionClass}>
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}><span className={ledClass} />Why openbranch</span>
            <h2 className={headingClass}>Built like the codebases <span className="font-light text-fg-2">it documents.</span></h2>
          </div>
          <div className="scroll-reveal" data-scroll-reveal>
            <ValueProp />
          </div>
        </section>

        <CommunityCTA />
      </main>
      <Footer />
    </>
  );
}
