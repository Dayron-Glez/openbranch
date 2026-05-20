import { IconEye, IconHeart, IconPR, IconArrowRight, IconBulb } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"

const ctaClass =
  "group inline-flex h-[34px] items-center gap-2 rounded-[var(--r-8)] border border-transparent bg-ob-accent px-3.5 text-[13px] font-medium leading-none tracking-[0] text-accent-ink no-underline transition-[filter] duration-[var(--d-fast)] ease-[var(--ease)] hover:brightness-[1.06] [&_svg]:size-3.5"

type FeaturedGuideProps = {
  readonly dict: LandingDict["featured"]
}

export function FeaturedGuide({ dict }: FeaturedGuideProps) {
  return (
    <div className="border-line bg-bg-card mt-7 grid grid-cols-[1fr_1.1fr] overflow-hidden rounded-[var(--r-12)] border max-[980px]:grid-cols-1">
      <div className="border-line flex flex-col justify-center gap-3.5 border-r px-9 py-10 max-[980px]:border-r-0 max-[980px]:border-b max-[520px]:px-6">
        <span className="text-ob-accent font-mono text-[11px] tracking-[0.08em] uppercase">
          {dict.kicker}
        </span>
        <h3 className="m-0 text-[28px] leading-[1.15] font-medium tracking-[0]">{dict.title}</h3>
        <p className="text-fg-2 m-0 max-w-[42ch] text-[14.5px] leading-[1.55]">{dict.summary}</p>
        <div className="text-fg-muted mt-2 flex items-center gap-3.5 font-mono text-[11.5px]">
          <div className="inline-flex">
            <span className="border-line bg-bg-elev outline-bg-card ml-0 inline-flex size-[22px] items-center justify-center rounded-full border font-mono text-[9px] outline-2">
              AK
            </span>
            <span className="border-line bg-bg-elev outline-bg-card -ml-1.5 inline-flex size-[22px] items-center justify-center rounded-full border font-mono text-[9px] outline-2">
              JM
            </span>
            <span className="border-line bg-bg-elev outline-bg-card -ml-1.5 inline-flex size-[22px] items-center justify-center rounded-full border font-mono text-[9px] outline-2">
              SP
            </span>
          </div>
          <span>{dict.authors}</span>
        </div>
        <div className="text-fg-muted flex items-center gap-3.5 font-mono text-[11.5px] [&_svg]:size-[13px]">
          <span className="inline-flex items-center gap-1">
            <IconEye /> {dict.reads}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconHeart /> {dict.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconPR /> {dict.revisions}
          </span>
        </div>
        <div className="mt-2">
          <a href="/docs" className={ctaClass}>
            {dict.cta}
            <IconArrowRight className="transition-transform duration-[var(--d-fast)] ease-[var(--ease)] group-hover:translate-x-[3px]" />
          </a>
        </div>
      </div>

      <article
        className="text-fg-2 after:to-bg-card relative px-10 py-9 text-[14.5px] leading-[1.65] after:absolute after:inset-x-0 after:bottom-0 after:h-20 after:bg-gradient-to-b after:from-transparent after:content-[''] max-[520px]:px-6"
        aria-label={dict.previewAria}
      >
        <h4 className="text-fg m-0 mb-3.5 text-[22px] font-medium tracking-[0]">
          <span className="text-fg-faint mr-1.5 font-normal">#</span>
          {dict.premiseHeading}
        </h4>
        <p className="m-0 mb-4">
          {dict.premiseP1Lead}
          <span className="border-line bg-bg-elev text-fg-2 rounded-[var(--r-6)] border px-1.5 py-px font-mono text-[0.85em]">
            {dict.featureFlags}
          </span>
          {dict.premiseP1Tail}
        </p>
        <p className="m-0 mb-4">{dict.premiseP2}</p>
        <div className="bg-accent-soft my-4 grid grid-cols-[22px_1fr] gap-3 rounded-[var(--r-10)] px-4 py-3.5">
          <IconBulb className="text-ob-accent mt-px size-[18px]" />
          <div>
            <div className="text-ob-accent mb-0.5 text-[13px] font-medium">{dict.ruleLabel}</div>
            <div className="text-fg-2 text-[13px]">{dict.ruleBody}</div>
          </div>
        </div>
        <h4 className="text-fg m-0 mb-3.5 text-[22px] font-medium tracking-[0]">
          <span className="text-fg-faint mr-1.5 font-normal">#</span>
          {dict.setupHeading}
        </h4>
        <pre className="border-line bg-bg-elev m-0 mt-2 overflow-hidden rounded-[var(--r-10)] border px-4 py-3.5 font-mono text-[12.5px] leading-[1.7]">
          <span className="text-ob-accent">$</span> git checkout -b feat/open-graph{"\n"}
          <span className="text-fg-muted">{dict.setupComment1}</span>
          {"\n"}
          <span className="text-ob-accent">$</span> openbranch lint --branch{"\n"}
          <span className="text-fg-muted">{dict.setupComment2}</span>
        </pre>
      </article>
    </div>
  )
}
