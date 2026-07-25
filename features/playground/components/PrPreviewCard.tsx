import type { ReactNode } from "react"
import { IconPR, IconBranch } from "@/icons"

type PrPreviewData = {
  readonly number: number
  readonly status: string
  readonly title: string
  readonly branch: string
  readonly base: string
  readonly files: number
  readonly additions: number
  readonly deletions: number
  readonly comments: number
  readonly check_warning?: string
}

type PrPreviewCardProps = {
  readonly data: PrPreviewData
}

const FileIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="size-[13px] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3h8l5 5v13H6z" />
    <path d="M14 3v5h5" />
  </svg>
)

const CommentIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="size-[13px] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5h16v11H9l-4 4v-4H4z" />
  </svg>
)

const AlertIcon = (): ReactNode => (
  <svg
    viewBox="0 0 24 24"
    className="size-[13px] shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3l9 16H3L12 3z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
)

export const PrPreviewCard = ({ data }: PrPreviewCardProps): ReactNode => (
  <div className="bg-bg-card border-line mb-8 overflow-hidden rounded-(--r-12) border">
    {/* header row */}
    <div className="bg-bg-elev border-line flex items-center justify-between gap-3 border-b px-4 py-[13px]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="border-accent-ring bg-accent-soft text-ob-accent inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[11px]">
          <IconPR size={12} />#{data.number} {data.status}
        </span>
        <span className="text-fg-2 truncate font-mono text-[12.5px]">{data.title}</span>
      </div>
      <span className="text-fg-muted hidden shrink-0 items-center gap-1.5 font-mono text-[11.5px] sm:inline-flex">
        <IconBranch size={12} />
        {data.branch} → {data.base}
      </span>
    </div>

    {/* stats row */}
    <div className="text-fg-muted flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-[13px] font-mono text-[12px]">
      <span className="inline-flex items-center gap-1.5">
        <FileIcon />
        {data.files} files
      </span>
      <span className="text-ob-accent">+{data.additions}</span>
      <span className="text-danger">−{data.deletions}</span>
      <span className="inline-flex items-center gap-1.5">
        <CommentIcon />
        {data.comments} comments
      </span>
      {data.check_warning !== undefined && (
        <span className="text-warn ml-auto inline-flex items-center gap-1.5">
          <AlertIcon />
          {data.check_warning}
        </span>
      )}
    </div>
  </div>
)
