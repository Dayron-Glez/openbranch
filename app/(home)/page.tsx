import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 md:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          open source · community driven
        </div>

        <h1 className="mb-6 max-w-3xl text-5xl font-light leading-[0.95] tracking-[-0.035em] md:text-7xl">
          <span className="text-muted-foreground">open</span>
          <span className="font-semibold">branch</span>
        </h1>

        <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The open guide to building software the right way. Best practices,
          contribution workflows, testing patterns, and Git strategies — learned
          from real projects, shared with the community.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the docs
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 7h10M7 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <a
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-card"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-[10px] border border-border bg-card p-5"
            >
              <div className="mb-3 font-mono text-xl text-primary">
                {item.icon}
              </div>
              <h3 className="mb-1.5 text-sm font-medium">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: '⎇',
    title: 'Git & Workflows',
    desc: 'Atomic commits, semantic messages, branching strategies.',
  },
  {
    icon: '✓',
    title: 'Testing',
    desc: 'Philosophy, patterns by hook type, mocking best practices.',
  },
  {
    icon: '↑',
    title: 'Contributing to OSS',
    desc: 'Issues, PRs, communicating with maintainers.',
  },
  {
    icon: '◈',
    title: 'Best Practices',
    desc: 'Architecture, separation of concerns, SSR patterns.',
  },
] as const;
