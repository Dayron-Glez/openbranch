import { IconFork, IconGlobe, IconLock } from "@/icons"
import type { LandingDict } from "@/lib/landing-dictionary"
import { Badge } from "@/components/ui/badge"

const valueClass =
  "border-r border-line px-7 py-8 last:border-r-0 max-wide:border-b max-wide:border-r-0 max-wide:last:border-b-0"

const ICONS = [IconFork, IconGlobe, IconLock]

type ValuePropProps = {
  readonly dict: LandingDict["valueProp"]
}

export function ValueProp({ dict }: ValuePropProps) {
  return (
    <div className="border-line bg-bg-card max-wide:grid-cols-1 grid grid-cols-3 overflow-hidden rounded-(--r-12) border">
      {dict.map((item, i) => {
        const Icon = ICONS[i] ?? IconFork
        return (
          <div key={item.title} className={valueClass}>
            <Badge
              variant="outline"
              className="border-line bg-bg-elev text-fg-muted text-2xs mb-4 gap-1.5 font-mono tracking-[0.04em] [&_svg]:size-[11px]"
            >
              <Icon />
              {item.badge}
            </Badge>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-base font-medium tracking-[0]">{item.title}</h4>
              <p className="text-fg-muted max-w-[30ch] text-sm leading-[1.55]">{item.body}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
