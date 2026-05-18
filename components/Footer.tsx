import Link from "next/link"
import { LogoMark } from "@/components/LogoMark"

const columnTitle =
  "m-0 mb-3.5 font-mono text-[10.5px] font-normal uppercase tracking-[0.08em] text-fg-muted"
const footerLink =
  "block py-1 text-[13px] text-fg-2 no-underline transition-colors duration-[var(--d-fast)] ease-[var(--ease)] hover:text-fg"

export function Footer() {
  return (
    <footer
      className="scroll-reveal border-line mx-auto max-w-[1200px] border-t px-8 pt-14 pb-9 max-[520px]:px-5"
      data-scroll-reveal
    >
      <div className="mb-14 grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-12 max-[980px]:grid-cols-2 max-[520px]:grid-cols-1">
        <div>
          <Link href="/" className="text-fg flex items-center gap-2.5 no-underline">
            <LogoMark size={22} />
            <span className="text-base tracking-[0]">
              <span className="text-fg-2 font-light">open</span>
              <span className="font-semibold">branch</span>
            </span>
          </Link>
          <p className="text-fg-muted mt-3.5 max-w-[32ch] text-[13px] leading-[1.55]">
            A community-built handbook for how teams ship software. Free, open source, always
            evolving.
          </p>
        </div>
        <div>
          <h5 className={columnTitle}>Docs</h5>
          <Link href="/docs/git" className={footerLink}>
            Branching
          </Link>
          <Link href="/docs/testing" className={footerLink}>
            Testing
          </Link>
          <Link href="/docs/contributing" className={footerLink}>
            Reviews
          </Link>
          <Link href="/docs/best-practices" className={footerLink}>
            Releases
          </Link>
        </div>
        <div>
          <h5 className={columnTitle}>Community</h5>
          <a
            href="https://github.com/Dayron-Glez/openbranch/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Contributors
          </a>
          <a
            href="https://github.com/Dayron-Glez/openbranch/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Discussions
          </a>
          <a
            href="https://github.com/Dayron-Glez/openbranch/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            RFC process
          </a>
          <a
            href="https://github.com/Dayron-Glez/openbranch/blob/main/CODE_OF_CONDUCT.md"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Code of conduct
          </a>
        </div>
        <div>
          <h5 className={columnTitle}>Resources</h5>
          <a
            href="https://github.com/Dayron-Glez/openbranch/releases"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Changelog
          </a>
          <Link href="/docs" className={footerLink}>
            Style guide
          </Link>
          <Link href="/docs" className={footerLink}>
            Translations
          </Link>
          <Link href="/docs" className={footerLink}>
            Brand assets
          </Link>
        </div>
        <div>
          <h5 className={columnTitle}>About</h5>
          <a
            href="https://github.com/Dayron-Glez/openbranch/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Maintainers
          </a>
          <a
            href="https://github.com/Dayron-Glez/openbranch/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            License · MIT
          </a>
          <a
            href="https://github.com/sponsors/Dayron-Glez"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLink}
          >
            Sponsors
          </a>
          <Link href="/docs" className={footerLink}>
            Press kit
          </Link>
        </div>
      </div>
      <div className="border-line text-fg-muted flex items-center justify-between border-t pt-6 font-mono text-[11px] max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3">
        <span>openbranch · v1.4 · built by 2,400+ contributors</span>
        <div className="flex gap-3">
          <a
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-muted hover:text-fg no-underline"
          >
            GitHub
          </a>
          <Link href="/docs" className="text-fg-muted hover:text-fg no-underline">
            RSS
          </Link>
          <Link href="/docs" className="text-fg-muted hover:text-fg no-underline">
            Status
          </Link>
        </div>
      </div>
    </footer>
  )
}
