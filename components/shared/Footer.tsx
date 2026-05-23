import Link from "next/link"
import { LogoMark } from "@/components/shared/LogoMark"
import type { LandingDict } from "@/lib/landing-dictionary"
import { localizedHref } from "@/lib/landing-dictionary"
import { Separator } from "@/components/ui/separator"

const columnTitle =
  "m-0 mb-3.5 font-mono text-(--text-xs) font-normal uppercase tracking-[0.08em] text-fg-muted"
const footerLink =
  "block py-1 text-(--text-base) text-fg-2 no-underline transition-colors duration-[var(--d-fast)] ease-[var(--ease)] hover:text-fg"

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
      <div className="mb-14 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
        <div>
          <Link href={homeHref} className="text-fg flex items-center gap-2.5 no-underline">
            <LogoMark size={22} />
            <span className="text-base tracking-normal">
              <span className="text-fg-2 font-light">open</span>
              <span className="font-semibold">branch</span>
            </span>
          </Link>
          <p className="text-fg-muted mt-3.5 max-w-[32ch] leading-[1.55] text-(--text-base)">
            {dict.tagline}
          </p>
        </div>
        {dict.columns.map((column) => (
          <div key={column.title}>
            <h5 className={columnTitle}>{column.title}</h5>
            {column.links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLink}
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={localizedHref(lang, link.href)} className={footerLink}>
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </div>
      <Separator className="border-line mb-6" />
      <div className="text-fg-muted flex items-center justify-between font-mono text-(--text-sm) max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
        <span>{dict.legal}</span>
        <div className="flex gap-3">
          <a
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted hover:text-fg no-underline"
          >
            GitHub
          </a>
          <Link
            href={localizedHref(lang, "/docs")}
            className="text-fg-muted hover:text-fg no-underline"
          >
            {dict.rss}
          </Link>
          <Link
            href={localizedHref(lang, "/docs")}
            className="text-fg-muted hover:text-fg no-underline"
          >
            {dict.status}
          </Link>
        </div>
      </div>
    </footer>
  )
}
