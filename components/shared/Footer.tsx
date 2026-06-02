import Link from "next/link"
import { LogoMark } from "@/components/shared/LogoMark"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { Separator } from "@/components/ui/separator"

const columnTitle =
  "m-0 mb-3.5 font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-fg-muted"
const footerLink =
  "block py-1 text-[13px] text-fg-2 no-underline transition-colors duration-[var(--d-fast)] ease-[var(--ease)] hover:text-fg"

type FooterProps = {
  readonly dict: LandingDict["footer"]
  readonly lang: string
}

export function Footer({ dict, lang }: FooterProps) {
  const homeHref = lang === "en" ? "/en" : "/"
  return (
    <footer
      className="scroll-reveal border-line mx-auto max-w-300 border-t px-8 pt-14 pb-9 max-[520px]:px-5"
      data-scroll-reveal
    >
      <div className="mb-14 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12 max-[980px]:grid-cols-2 max-[520px]:grid-cols-3 max-[520px]:gap-5">
        <div className="max-[520px]:col-span-3">
          <Link href={homeHref} className="text-fg flex items-center gap-2.5 no-underline">
            <LogoMark size={22} />
            <span className="text-base tracking-normal">
              <span className="text-fg-2 font-light">open</span>
              <span className="font-semibold">branch</span>
            </span>
          </Link>
          <p className="text-fg-muted mt-3.5 max-w-[32ch] text-[13px] leading-[1.55]">
            {dict.tagline}
          </p>
        </div>
        {dict.columns.map((column, i) => (
          <div key={column.title} className={i === 2 ? "max-[520px]:hidden" : undefined}>
            <h5 className={columnTitle}>{column.title}</h5>
            {column.links.map((link, j) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${footerLink}${j >= 2 ? "max-[520px]:hidden" : ""}`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={localizedHref(lang, link.href)}
                  className={`${footerLink}${j >= 2 ? "max-[520px]:hidden" : ""}`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </div>
      <Separator className="border-line mb-6" />
      <div className="text-fg-muted flex items-center justify-between font-mono text-[11px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
        <span>
          {dict.legal} · {new Date().getFullYear()}
        </span>
        <a
          href="https://github.com/Dayron-Glez/openbranch"
          target="_blank"
          rel="noopener noreferrer"
          className="text-fg-muted hover:text-fg no-underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
