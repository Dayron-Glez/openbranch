-- Fix drift between the user_badges.badge CHECK and the badge keys the app
-- awards (features/playground/domain/manifest.ts). The original CHECK only
-- allowed the three launch-era keys, so every insert of a current badge key
-- violated the constraint and no badge was persisted.

-- Remap any legacy rows to their current equivalents before tightening the CHECK.
update public.user_badges set badge = 'review-corps' where badge = 'code-reviewer';
update public.user_badges set badge = 'ship-it' where badge = 'bug-hunter';
update public.user_badges set badge = 'coverage-hero' where badge = 'test-writer';

alter table public.user_badges drop constraint user_badges_badge_check;

alter table public.user_badges add constraint user_badges_badge_check
  check (badge in ('review-corps', 'ship-it', 'coverage-hero', 'first-merge', 'doc-writer'));
