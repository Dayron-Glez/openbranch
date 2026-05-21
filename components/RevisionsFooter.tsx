import type { Revision } from "@/lib/changelog"
import { formatRelativeTime } from "@/lib/changelog"
import { gitConfig } from "@/lib/shared"

type Props = {
  revisions: Revision[] | null
  slug: string
}

export function RevisionsFooter({ revisions, slug }: Props) {
  const { user, repo } = gitConfig
  const historyUrl = `https://github.com/${user}/${repo}/commits/main/content/docs/${slug}.mdx`
  const prUrl = `https://github.com/${user}/${repo}/edit/main/content/docs/${slug}.mdx`

  if (!revisions || revisions.length === 0) {
    return (
      <div className="text-fd-muted-foreground mt-12 rounded-[--radius] border border-dashed p-4 font-mono text-sm">
        <span className="bg-fd-primary mr-2 inline-block size-1.5 rounded-full align-middle" />
        No revisions yet —{" "}
        <a
          href={prUrl}
          target="_blank"
          rel="noreferrer"
          className="text-fd-primary underline hover:opacity-80"
        >
          be the first to edit.
        </a>
      </div>
    )
  }

  const sinceDate = new Date(revisions.at(-1)!.authoredAt).toISOString().slice(0, 7)
  const countLabel = `${revisions.length} commit${revisions.length === 1 ? "" : "s"}`

  return (
    <div className="bg-fd-card mt-12 overflow-hidden rounded-[--radius] border font-mono text-xs">
      {/* Header */}
      <div
        className="text-fd-muted-foreground flex items-center gap-2.5 border-b px-5 py-3.5"
        style={{ background: "linear-gradient(180deg, rgba(94,227,154,.04), transparent)" }}
      >
        <span
          className="bg-fd-primary size-1.5 shrink-0 rounded-full"
          style={{
            boxShadow: "0 0 0 3px color-mix(in srgb, var(--color-fd-primary) 15%, transparent)",
          }}
          aria-hidden
        />
        <span className="text-fd-foreground/70 tracking-widest uppercase">revisions</span>
        <span className="ml-auto tracking-[0.04em] uppercase">
          since {sinceDate} · <span className="text-fd-primary">{countLabel}</span>
        </span>
      </div>

      {/* Rows */}
      <ul className="px-5 py-1.5">
        {revisions.map((rev) => (
          <li
            key={rev.sha}
            className="hover:bg-fd-accent/30 -mx-2.5 grid grid-cols-[84px_1fr_auto] items-center gap-4 border-t border-dashed px-2.5 py-2.5 first:border-t-0 hover:rounded-md"
          >
            {/* Version or short SHA */}
            <span
              className={
                rev.version
                  ? "text-fd-primary truncate font-medium"
                  : "text-fd-muted-foreground truncate"
              }
            >
              {rev.version ?? rev.shortSha}
            </span>

            {/* Commit message */}
            <a
              href={rev.url}
              target="_blank"
              rel="noreferrer"
              className="text-fd-foreground truncate hover:underline"
            >
              {rev.message}
            </a>

            {/* Author + time */}
            <span className="text-fd-muted-foreground flex shrink-0 items-center gap-2">
              <span className="text-fd-foreground/70">@{rev.authorLogin}</span>
              <span className="text-fd-muted-foreground/50">·</span>
              {formatRelativeTime(rev.authoredAt)}
            </span>
          </li>
        ))}

        {/* Earlier revisions row */}
        <li className="-mx-2.5 grid grid-cols-[84px_1fr_auto] items-center gap-4 border-t border-dashed px-2.5 py-2.5">
          <span className="text-fd-muted-foreground/40" />
          <a
            href={historyUrl}
            target="_blank"
            rel="noreferrer"
            className="text-fd-muted-foreground hover:text-fd-foreground col-span-2 hover:underline"
          >
            earlier revisions →
          </a>
        </li>
      </ul>
    </div>
  )
}
