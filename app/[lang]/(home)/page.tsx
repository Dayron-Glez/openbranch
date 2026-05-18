import type { ReactNode } from "react"
import { Nav } from "@/components/Nav"
import { Hero } from "@/components/Hero"
import { TopicCard } from "@/components/TopicCard"
import { FeaturedGuide } from "@/components/FeaturedGuide"
import { ValueProp } from "@/components/ValueProp"
import { CommunityCTA } from "@/components/CommunityCTA"
import { Footer } from "@/components/Footer"
import { ScrollReveal } from "@/components/ScrollReveal"
import { IconBranch, IconPR, IconFlask, IconTag, IconFork, IconBulb } from "@/icons"
import { i18n } from "@/lib/i18n"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import type { TopicItem } from "@/lib/landing-dictionary"

const TOPIC_ICONS: Record<TopicItem["icon"], ReactNode> = {
  branch: <IconBranch />,
  pr: <IconPR />,
  flask: <IconFlask />,
  tag: <IconTag />,
  fork: <IconFork />,
  bulb: <IconBulb />,
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

const eyebrowClass =
  "mb-3.5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted"

const ledClass =
  "led-wave mr-2 inline-block size-1.5 rounded-full bg-ob-accent align-[1px] shadow-[0_0_0_3px_var(--color-accent-soft)]"

const sectionClass = ""
const sectionHeadClass = "mb-12 max-w-[720px]"
const headingClass =
  "m-0 mb-[18px] text-balance text-[42px] font-medium leading-[1.05] tracking-[0] max-[980px]:text-[32px]"

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  const dict = getLandingDict(lang)
  return (
    <>
      <ScrollReveal />
      <div className="ambient pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="ambient-dots absolute inset-0" />
        <svg
          className="ambient-graph absolute inset-0 size-full"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMid slice"
        >
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
        <div className="ambient-sweep absolute top-[-10%] bottom-[-10%]" />
      </div>
      <Nav dict={dict.nav} lang={lang} />
      <main className="relative z-[1] mx-auto grid max-w-[1100px] gap-[100px] px-8 pb-[100px] max-[520px]:px-5">
        <Hero dict={dict.hero} lang={lang} />

        <section className={sectionClass} id="topics">
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}>
              <span className={ledClass} /> {dict.sections.topicsEyebrow}
            </span>
            <h2 className={headingClass}>
              {dict.sections.topicsHeading}{" "}
              <span className="text-fg-2 font-light">{dict.sections.topicsHeadingAccent}</span>
            </h2>
            <p className="text-fg-2 m-0 max-w-[56ch] text-base leading-[1.55]">
              {dict.sections.topicsIntro}
            </p>
          </div>
          <div
            className="scroll-reveal-stagger grid grid-cols-3 gap-3 max-[980px]:grid-cols-1"
            data-scroll-reveal
          >
            {dict.topics.map((topic) => (
              <TopicCard
                key={topic.title}
                href={localizedHref(lang, "/docs")}
                icon={TOPIC_ICONS[topic.icon]}
                title={topic.title}
                description={topic.description}
                count={topic.count}
                updated={topic.updated}
              />
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}>
              <span className={ledClass} /> {dict.sections.featuredEyebrow}
            </span>
            <h2 className={headingClass}>
              {dict.sections.featuredHeading}{" "}
              <span className="text-fg-2 font-light">{dict.sections.featuredHeadingAccent}</span>
            </h2>
          </div>
          <div className="scroll-reveal" data-scroll-reveal>
            <FeaturedGuide dict={dict.featured} />
          </div>
        </section>

        <section className={sectionClass}>
          <div className={`${sectionHeadClass} scroll-reveal`} data-scroll-reveal>
            <span className={eyebrowClass}>
              <span className={ledClass} /> {dict.sections.whyEyebrow}
            </span>
            <h2 className={headingClass}>
              {dict.sections.whyHeading}{" "}
              <span className="text-fg-2 font-light">{dict.sections.whyHeadingAccent}</span>
            </h2>
          </div>
          <div className="scroll-reveal" data-scroll-reveal>
            <ValueProp dict={dict.valueProp} />
          </div>
        </section>

        <CommunityCTA dict={dict.community} />
      </main>
      <Footer dict={dict.footer} lang={lang} />
    </>
  )
}
