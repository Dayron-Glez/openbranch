import { IconPR, IconGithub, IconArrowRight } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type CommunityCTAProps = {
  readonly dict: LandingDict["community"]
}

export function CommunityCTA({ dict }: CommunityCTAProps) {
  return (
    <section className="scroll-reveal" data-scroll-reveal>
      <div
        className="border-line bg-bg-card relative overflow-hidden rounded-(--r-16) border px-12 py-16 text-center before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] before:mask-[radial-gradient(ellipse_60%_80%_at_center,black,transparent_70%)] before:bg-size-[24px_24px] before:content-[''] max-[980px]:px-6 max-[980px]:py-10"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(94,227,154,.12), transparent 60%), var(--color-bg-card)",
        }}
      >
        <span className="text-ob-accent relative mb-3.5 inline-block font-mono text-[11px] tracking-[0.08em] uppercase">
          {dict.eyebrow}
        </span>
        <h3 className="relative mx-auto mb-4 max-w-[22ch] text-[38px] leading-[1.1] font-medium tracking-normal text-balance max-[980px]:text-[28px]">
          {dict.title}
        </h3>
        <p className="text-fg-2 relative mx-auto mb-8 max-w-[56ch] text-[15.5px] leading-[1.55]">
          {dict.body}
        </p>
        <div className="relative flex flex-wrap justify-center gap-2.5">
          <Button asChild variant="accent" className="group no-underline">
            <a
              href="https://github.com/Dayron-Glez/openbranch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconPR />
              {dict.ctaPrimary}
              <IconArrowRight className="transition-transform duration-(--d-fast) ease-(--ease) group-hover:translate-x-0.75" />
            </a>
          </Button>
          <Button asChild variant="outline" className="no-underline">
            <a
              href="https://github.com/Dayron-Glez/openbranch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconGithub />
              {dict.ctaSecondary}
            </a>
          </Button>
        </div>

        <div className="relative mt-10 flex flex-col items-center gap-3.5">
          <span className="text-fg-muted font-mono text-[11px] tracking-[0.06em] uppercase">
            {dict.contributors}
          </span>
          <div className="inline-flex">
            {["AK", "JM", "SP", "RN", "TY", "DL", "MV", "CH"].map((initials, index) => (
              <Avatar
                key={initials}
                className={`border-line-2 outline-bg-card size-8 border outline-2 ${index === 0 ? "ml-0" : "-ml-2"}`}
              >
                <AvatarFallback className="bg-bg-elev text-fg-2 font-mono text-[11px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ))}
            <Avatar className="outline-bg-card -ml-2 size-8 border border-transparent outline-2">
              <AvatarFallback className="bg-accent-soft text-ob-accent font-mono text-[11px]">
                +2.4k
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </section>
  )
}
