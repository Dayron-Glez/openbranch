import { IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import type { Maturity } from "@/lib/maturity"
import { FeaturedGuideStats } from "@/components/FeaturedGuideStats"

const ctaClass =
  "group inline-flex h-[34px] items-center gap-2 rounded-[var(--r-8)] border border-transparent bg-ob-accent px-3.5 text-[13px] font-medium leading-none tracking-[0] text-accent-ink no-underline transition-[filter] duration-[var(--d-fast)] ease-[var(--ease)] hover:brightness-[1.06] [&_svg]:size-3.5"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

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
    <div className="border-line bg-bg-card mt-7 grid grid-cols-[1fr_1.1fr] overflow-hidden rounded-[var(--r-12)] border max-[980px]:grid-cols-1">
      <div className="border-line flex flex-col justify-center gap-3.5 border-r px-9 py-10 max-[980px]:border-r-0 max-[980px]:border-b max-[520px]:px-6">
        <span className="text-ob-accent font-mono text-[11px] tracking-[0.08em] uppercase">
          {guide.kicker}
        </span>
        <h3 className="m-0 text-[28px] leading-[1.15] font-medium tracking-[0]">{guide.title}</h3>
        <p className="text-fg-2 m-0 max-w-[42ch] text-[14.5px] leading-[1.55]">{guide.summary}</p>
        {guide.authors.length > 0 && (
          <div className="text-fg-muted mt-2 flex items-center gap-3.5 font-mono text-[11.5px]">
            <div className="inline-flex">
              {guide.authors.slice(0, 3).map((author, i) => (
                <span
                  key={author}
                  className={`border-line bg-bg-elev outline-bg-card ${i === 0 ? "ml-0" : "-ml-1.5"} inline-flex size-[22px] items-center justify-center rounded-full border font-mono text-[9px] outline-2`}
                >
                  {getInitials(author)}
                </span>
              ))}
            </div>
            <span>{guide.authorsDisplay}</span>
          </div>
        )}
        <FeaturedGuideStats
          maturity={guide.maturity}
          lastModified={guide.lastModified}
          lang={lang}
          updatedLabel={dict.updatedLabel}
        />
        <div className="mt-2">
          <a href={guide.href} className={ctaClass}>
            {dict.cta}
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </a>
        </div>
      </div>

      <article
        className="text-fg-2 after:to-bg-card relative flex flex-col justify-center px-10 py-9 text-[14.5px] leading-[1.65] after:absolute after:inset-x-0 after:bottom-0 after:h-20 after:bg-gradient-to-b after:from-transparent after:content-[''] max-[520px]:px-6"
        aria-label={dict.previewAria}
      >
        {guide.firstHeading && (
          <h4 className="text-fg m-0 mb-3.5 text-[20px] leading-tight font-medium tracking-[0]">
            <span className="text-fg-faint mr-1.5 font-normal">#</span>
            {guide.firstHeading}
          </h4>
        )}
        <p className="m-0 text-pretty">{guide.excerpt}</p>
      </article>
    </div>
  )
}
