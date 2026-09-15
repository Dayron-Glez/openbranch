import { IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import type { Maturity } from "@/lib/maturity"
import { FeaturedGuideStats } from "@/features/home/components/FeaturedGuideStats"
import { Eyebrow } from "@/shared/Eyebrow"

const ctaClass =
  "group inline-flex h-[34px] items-center gap-2 rounded-(--r-8) border border-transparent bg-ob-accent px-3.5 text-sm font-medium leading-none tracking-[0] text-accent-ink no-underline transition-[filter] duration-(--d-fast) ease-(--ease) hover:brightness-[1.06] [&_svg]:size-3.5"

type FeaturedGuideDynamic = {
  readonly kicker: string
  readonly title: string
  readonly summary: string
  readonly href: string
  readonly excerpt: string
  readonly firstHeading: string | null
  readonly authors: string[]
  readonly authorsDisplay: string
  readonly maturity: Maturity
  readonly lastModified: Date | null
}

type FeaturedGuideProps = {
  readonly dict: LandingDict["featured"]
  readonly guide: FeaturedGuideDynamic
  readonly lang: string
}

export function FeaturedGuide({ dict, guide, lang }: FeaturedGuideProps) {
  return (
    <div className="border-line bg-bg-card max-wide:grid-cols-1 mt-7 grid grid-cols-[1fr_1.1fr] overflow-hidden rounded-(--r-12) border">
      <div className="border-line max-wide:border-r-0 max-wide:border-b max-narrow:px-6 flex flex-col justify-center gap-3.5 border-r px-9 py-10">
        <Eyebrow tone="accent" as="span">
          {guide.kicker}
        </Eyebrow>
        <h3 className="text-[28px] leading-[1.15] font-medium tracking-normal">{guide.title}</h3>
        <p className="text-fg-2 max-w-[42ch] text-sm leading-[1.55]">{guide.summary}</p>
        <FeaturedGuideStats
          maturity={guide.maturity}
          lastModified={guide.lastModified}
          lang={lang}
          updatedLabel={dict.updatedLabel}
          authors={guide.authors}
          authorsDisplay={guide.authorsDisplay}
        />
        <div className="mt-2">
          <a href={guide.href} className={ctaClass}>
            {dict.cta}
            <IconArrowRight className="transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
          </a>
        </div>
      </div>

      <article
        className="text-fg-2 after:to-bg-card max-narrow:hidden relative flex flex-col justify-center px-10 py-9 text-sm leading-[1.65] after:absolute after:inset-x-0 after:bottom-0 after:h-20 after:bg-linear-to-b after:from-transparent after:content-['']"
        aria-label={dict.previewAria}
      >
        {guide.firstHeading && (
          <h4 className="text-fg mb-3.5 text-xl leading-tight font-medium tracking-normal">
            <span className="text-fg-faint mr-1.5 font-normal">#</span>
            {guide.firstHeading}
          </h4>
        )}
        <p className="text-pretty">{guide.excerpt}</p>
      </article>
    </div>
  )
}
