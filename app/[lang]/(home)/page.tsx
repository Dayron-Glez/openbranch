import type { ReactNode } from "react"
import { Nav } from "@/components/nav/Nav"
import { Hero } from "@/components/home/Hero"
import { TopicCard } from "@/components/home/TopicCard"
import { FeaturedGuide } from "@/components/home/FeaturedGuide"
import { ValueProp } from "@/components/home/ValueProp"
import { CommunityCTA } from "@/components/home/CommunityCTA"
import { Footer } from "@/components/shared/Footer"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/home/AmbientBackground"
import { IconBranch, IconPR, IconFlask, IconTag, IconFork, IconBulb } from "@/icons"
import { i18n } from "@/lib/i18n"
import { source } from "@/lib/source"
import { getLandingDict, localizedHref } from "@/lib/landing-dictionary"
import type { TopicItem } from "@/lib/landing-dictionary"
import { getSectionStats, formatRelativeDate } from "@/lib/section-stats"
import { getWeeklyPick } from "@/lib/weekly-pick"
import { getReadingTime, formatReadingTime } from "@/lib/reading-time"

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

function buildAuthorsDisplay(authors: string[], lang: string): string {
  if (authors.length === 0) return ""
  if (authors.length === 1) return authors[0]
  const rest = authors.length - 1
  return lang === "es" ? `${authors[0]} y ${rest} más` : `${authors[0]} & ${rest} more`
}

const eyebrowClass =
  "mb-3.5 inline-block font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted"

const ledClass =
  "led-wave mr-2 inline-block size-1.5 rounded-full bg-ob-accent align-[1px] shadow-[0_0_0_3px_var(--color-accent-soft)]"

const sectionClass = ""
const sectionHeadClass = "mb-12 max-w-[720px]"
const headingClass =
  "m-0 mb-[18px] text-balance text-[42px] font-medium leading-[1.05] tracking-[0] max-[980px]:text-[32px]"

export default async function HomePage({ params }: Readonly<PageProps<"/[lang]">>) {
  const { lang } = await params
  const dict = getLandingDict(lang)

  // Build-time stats — computed from the real content
  const guideCount = source.getPages(lang).length
  const localeCount = i18n.languages.length

  const pick = await getWeeklyPick(lang)

  const authorsDisplay = pick ? buildAuthorsDisplay(pick.authors, lang) : ""

  const guide = pick
    ? {
        kicker:
          lang === "es"
            ? `guía · ${formatReadingTime(getReadingTime(pick.rawText), lang)}`
            : `guide · ${formatReadingTime(getReadingTime(pick.rawText), lang)}`,
        title: pick.title,
        summary: pick.description,
        href: pick.href,
        excerpt: pick.excerpt,
        firstHeading: pick.firstHeading,
        authors: pick.authors,
        authorsDisplay,
        maturity: pick.maturity,
        lastModified: pick.lastModified,
      }
    : null

  return (
    <>
      <ScrollReveal />
      <AmbientBackground />
      <Nav dict={dict.nav} lang={lang} />
      <main className="relative z-1 mx-auto grid max-w-275 gap-25 px-8 pb-25 max-[520px]:px-5">
        <Hero dict={dict.hero} lang={lang} guideCount={guideCount} localeCount={localeCount} />

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
            {dict.topics.map((topic) => {
              const stats = getSectionStats(topic.slug, lang)
              const isEmpty = stats.count === 0
              const emptyLabel = lang === "es" ? "próximamente" : "coming soon"
              const count = isEmpty ? emptyLabel : `${stats.count} ${topic.countUnit}`
              const updatedDate = formatRelativeDate(stats.lastModified, lang)
              const updatedLabel =
                lang === "es" ? `actualizado ${updatedDate}` : `updated ${updatedDate}`
              const updated = isEmpty ? "" : updatedLabel
              return (
                <TopicCard
                  key={topic.title}
                  href={localizedHref(lang, `/docs/${topic.slug}`)}
                  icon={TOPIC_ICONS[topic.icon]}
                  title={topic.title}
                  description={topic.description}
                  count={count}
                  updated={updated}
                />
              )
            })}
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
          {guide && (
            <div className="scroll-reveal" data-scroll-reveal>
              <FeaturedGuide dict={dict.featured} guide={guide} lang={lang} />
            </div>
          )}
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
