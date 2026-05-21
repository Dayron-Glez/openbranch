import type { Revision } from "@/lib/changelog"
import { formatRelativeTime } from "@/lib/changelog"

type Props = {
  revisions: Revision[] | null
}

export function RevisionsFooter({ revisions }: Props) {
  if (!revisions || revisions.length === 0) {
    return (
      <div className="border-line text-fg-muted mt-12 flex items-center gap-2 rounded-md border border-dashed p-4 font-mono text-xs">
        <span className="bg-ob-accent size-1.5 shrink-0 rounded-full" aria-hidden />
        <span>No revisions yet — be the first to edit.</span>
      </div>
    )
  }

  const sinceDate = new Date(revisions.at(-1)!.authoredAt).toISOString().slice(0, 7)
  const countLabel = `${revisions.length} commit${revisions.length === 1 ? "" : "s"}`

  return (
    <div className="border-line bg-bg-card mt-12 overflow-hidden rounded-md border font-mono text-xs">
      {/* Header */}
      <div
        className="border-line text-fg-muted flex items-center gap-2.5 border-b px-5 py-3.5"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-ob-accent) 4%, transparent), transparent)",
        }}
      >
        <span
          className="bg-ob-accent size-1.5 shrink-0 rounded-full"
          style={{ boxShadow: "0 0 0 3px var(--color-accent-soft)" }}
          aria-hidden
        />
        <span className="text-fg-2 tracking-widest uppercase">revisions</span>
        <span className="ml-auto tracking-[0.04em] uppercase">
          since {sinceDate} · <span className="text-ob-accent">{countLabel}</span>
        </span>
      </div>

      {/* Rows */}
      <ul className="px-5 py-1.5">
        {revisions.map((rev) => (
          <li
            key={rev.sha}
            className="border-line hover:bg-bg-hover -mx-2.5 grid grid-cols-[84px_1fr_auto] items-center gap-4 border-t border-dashed px-2.5 py-2.5 first:border-t-0 hover:rounded-md"
          >
            <span
              className={
                rev.version ? "text-ob-accent truncate font-medium" : "text-fg-muted truncate"
              }
            >
              {rev.version ?? rev.shortSha}
            </span>

            <span className="text-fg truncate">{rev.message}</span>

            <span className="text-fg-muted flex shrink-0 items-center gap-2">
              <span className="text-fg-2">@{rev.authorLogin}</span>
              <span className="text-fg-faint">·</span>
              {formatRelativeTime(rev.authoredAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
