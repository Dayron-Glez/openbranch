-- specs/gamification-quickwins.md: unblock awarding streak-7 and all-tracks.
-- Neither badge maps to a single track, so `track` becomes nullable instead
-- of inventing a sentinel value. The column is never read by app code today.

alter table public.badge_catalog alter column track drop not null;

insert into public.badge_catalog (key, track) values
  ('streak-7', null),
  ('all-tracks', null)
on conflict (key) do nothing;
