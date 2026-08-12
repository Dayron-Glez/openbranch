-- Read-tracking for documentation guides, so "doc" steps in a learning path
-- can complete. Reverses Q3 of specs/learning-paths-v1.md, which scoped
-- read-tracking out of v1 ("no read-tracking exists or is being built") and
-- left every guide step permanently un-completable.
--
-- Deliberately NOT wired into public.apply_completion_to_stats: reading awards
-- no points, so the leaderboard keeps meaning practice.

create table if not exists public.doc_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  -- Docs slug as authored in a path step, e.g. 'pull-requests/review-culture'.
  -- No FK: docs live in MDX, not in the database — same call as
  -- challenge_sessions.challenge_slug. Validated in the server action against
  -- the fumadocs source before insert.
  doc_slug text not null,
  -- Locale of the FIRST read, informational only. Uniqueness below deliberately
  -- ignores it: fumadocs gives identical page slugs across locales, and a path
  -- step references a guide without a locale, so reading the Spanish version is
  -- reading the guide. Kept for a possible reading-history surface later.
  lang text not null check (lang in ('es', 'en')),
  read_at timestamptz not null default now(),
  unique (user_id, doc_slug)
);

-- Shaped after public.user_badges, the closest sibling: a row records that
-- something happened once, and is never updated. Hence no created_at/updated_at
-- and no set_updated_at trigger — three timestamps would hold the same value
-- forever. Un-marking deletes the row rather than flipping a flag.

-- The real query is "every slug this user has read".
create index if not exists doc_reads_user_id_idx on public.doc_reads (user_id);

alter table public.doc_reads enable row level security;

create policy "doc_reads_select_own"
  on public.doc_reads for select
  using (auth.uid() = user_id);

-- with check, not using: insert policies are checked against the NEW row.
create policy "doc_reads_insert_own"
  on public.doc_reads for insert
  with check (auth.uid() = user_id);

create policy "doc_reads_delete_own"
  on public.doc_reads for delete
  using (auth.uid() = user_id);

-- Required, not optional, and `authenticated` only — never `anon`.
-- supabase/config.toml leaves auto_expose_new_tables commented out and states:
-- "When unset, new entities are NOT auto-exposed". Every existing table
-- predates that default, which is why public.leaderboard carries the only other
-- grant in this directory. Without this, PostgREST answers 401 even though the
-- policies above are correct — RLS looks fine and the migration applies clean.
grant select, insert, delete on public.doc_reads to authenticated;
