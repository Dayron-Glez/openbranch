import { IconFork, IconGlobe, IconLock } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"

const valueClass =
  "border-r border-line px-7 py-8 last:border-r-0 max-[980px]:border-b max-[980px]:border-r-0 max-[980px]:last:border-b-0"

const badgeClass =
  "mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-elev px-2 py-[3px] font-mono text-[10.5px] tracking-[0.04em] text-fg-muted [&_svg]:size-[11px]"

const ICONS = [IconFork, IconGlobe, IconLock]

type ValuePropProps = {
  readonly dict: LandingDict["valueProp"]
}

export function ValueProp({ dict }: ValuePropProps) {
  return (
    <div className="border-line bg-bg-card grid grid-cols-3 overflow-hidden rounded-[var(--r-12)] border max-[980px]:grid-cols-1">
      {dict.map((item, i) => {
        const Icon = ICONS[i] ?? IconFork
        return (
          <div key={item.title} className={valueClass}>
            <span className={badgeClass}>
              <Icon />
              {item.badge}
            </span>
            <h4 className="m-0 mb-1.5 text-[17px] font-medium tracking-[0]">{item.title}</h4>
            <p className="text-fg-muted m-0 max-w-[30ch] text-[13.5px] leading-[1.55]">
              {item.body}
            </p>
          </div>
        )
      })}
    </div>
  )
}
