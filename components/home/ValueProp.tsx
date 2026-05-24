import { IconFork, IconGlobe, IconLock } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { Badge } from "@/components/ui/badge"

const valueClass =
  "border-r border-line px-7 py-8 last:border-r-0 max-[980px]:border-b max-[980px]:border-r-0 max-[980px]:last:border-b-0"

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
            <Badge
              variant="outline"
              className="border-line bg-bg-elev text-fg-muted mb-4 gap-1.5 font-mono text-[10.5px] tracking-[0.04em] [&_svg]:size-[11px]"
            >
              <Icon />
              {item.badge}
            </Badge>
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
