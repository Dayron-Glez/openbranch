# openbranch Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder landing page with the fully-specified marketing page from the openbranch design system.

**Architecture:** The landing page (`app/(home)/page.tsx`) is unwrapped from the Fumadocs `HomeLayout` and gets its own custom `Nav`. All styles are raw CSS custom properties defined in `app/global.css`; no Tailwind utilities are used in landing components. The docs section (`app/docs/`) stays untouched. Icons are inline SVG React components in `icons/index.tsx`.

**Tech Stack:** Next.js 16.2.6 (App Router), TypeScript, Tailwind v4 (tokens only in docs; landing uses raw CSS vars), Bun, Fumadocs v16 (docs only)

**Project root:** `D:\Dayron\Proyectos\Contribuciones Open Source\openbranch`

---

## File Map

| Action   | Path                                        | Purpose                                      |
|----------|---------------------------------------------|----------------------------------------------|
| Modify   | `app/global.css`                            | Add design-system tokens + all landing CSS   |
| Modify   | `app/(home)/layout.tsx`                     | Strip HomeLayout — bare passthrough          |
| Modify   | `app/layout.tsx`                            | Add `dark` class to `<html>` explicitly      |
| Create   | `icons/index.tsx`                           | All inline SVG icons (no lucide)             |
| Create   | `components/LogoMark.tsx`                   | Animated/static SVG logo mark                |
| Create   | `components/Nav.tsx`                        | Sticky nav with scroll border ('use client') |
| Create   | `components/Terminal.tsx`                   | Terminal block + subcomponents               |
| Create   | `components/TopicCard.tsx`                  | Single topic card                            |
| Create   | `components/FeaturedGuide.tsx`              | 2-col featured guide card                    |
| Create   | `components/ValueProp.tsx`                  | 3-up values card                             |
| Create   | `components/CommunityCTA.tsx`               | Community CTA card with avatar stack         |
| Create   | `components/Footer.tsx`                     | 5-col footer                                 |
| Create   | `components/Hero.tsx`                       | Hero section                                 |
| Rewrite  | `app/(home)/page.tsx`                       | Wire all sections                            |
| Copy     | `public/favicon.ico`                        | From assets bundle                           |
| Create   | `LICENSE`                                   | MIT license                                  |

---

## Task 1: Foundation — tokens, layout fix, assets, LICENSE

**Files:**
- Modify: `app/global.css`
- Modify: `app/(home)/layout.tsx`
- Modify: `app/layout.tsx`
- Copy: `public/favicon.ico` (from `C:\Users\MSI\Downloads\openbranch\assets\favicon.ico`)
- Create: `LICENSE`

- [ ] **Step 1: Add design-system tokens and all landing CSS to `app/global.css`**

Append the following block at the **end** of `app/global.css` (after the closing `}` of `@layer base`):

```css
/* ============================================================
   openbranch landing — design-system tokens (dark-first, always on :root)
   ============================================================ */
:root {
  --bg:          #0B0C0E;
  --bg-elev:     #111316;
  --bg-card:     #14171B;
  --bg-hover:    #181B20;
  --line:        #1F2328;
  --line-2:      #2A2F36;

  --fg:          #ECEEF1;
  --fg-2:        #B7BCC4;
  --fg-muted:    #6F7681;
  --fg-faint:    #3E444C;

  --accent:      oklch(78% 0.18 148);
  --accent-soft: oklch(78% 0.18 148 / .15);
  --accent-ring: oklch(78% 0.18 148 / .35);
  --accent-ink:  #062612;

  --info:    oklch(78% 0.13 230);
  --warn:    oklch(80% 0.14 75);
  --danger:  oklch(72% 0.18 25);

  --r-6:    6px;
  --r-8:    8px;
  --r-10:   10px;
  --r-12:   12px;
  --r-16:   16px;
  --r-full: 999px;

  --sh-2: 0 1px 2px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04);
  --sh-3: 0 8px 24px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.05);
  --sh-4: 0 32px 96px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04);

  --d-fast: 120ms;
  --d-base: 180ms;
  --d-slow: 260ms;
  --ease: cubic-bezier(.2, .8, .2, 1);
}

/* ── ambient dot-grid background ── */
.ob-ambient {
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px);
  background-size: 28px 28px;
  background-position: 14px 14px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 80% 50% at center top, black, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 80% 50% at center top, black, transparent 70%);
  z-index: 0;
}

/* ── buttons ── */
.ob-btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 34px; padding: 0 14px;
  font-family: inherit; font-size: 13px; font-weight: 500;
  border: 1px solid transparent; border-radius: var(--r-8);
  cursor: pointer; text-decoration: none;
  line-height: 1; letter-spacing: -0.005em;
  transition: background var(--d-fast) var(--ease), border-color var(--d-fast) var(--ease),
              color var(--d-fast) var(--ease), filter var(--d-fast) var(--ease);
}
.ob-btn svg { width: 14px; height: 14px; }
.ob-btn-primary { background: var(--accent); color: var(--accent-ink); }
.ob-btn-primary:hover { filter: brightness(1.06); }
.ob-btn-secondary { background: var(--bg-card); border-color: var(--line-2); color: var(--fg); }
.ob-btn-secondary:hover { background: var(--bg-hover); border-color: var(--fg-faint); }
.ob-btn-ghost { color: var(--fg-2); }
.ob-btn-ghost:hover { background: var(--bg-elev); color: var(--fg); }
.ob-btn-lg { height: 42px; padding: 0 20px; font-size: 14px; }
.ob-btn-arrow svg.arr { transition: transform var(--d-fast) var(--ease); }
.ob-btn-arrow:hover svg.arr { transform: translateX(3px); }

/* ── nav ── */
.ob-nav {
  position: sticky; top: 0; z-index: 50;
  background: color-mix(in oklab, var(--bg) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color var(--d-base) var(--ease), background var(--d-base) var(--ease);
}
.ob-nav.scrolled { border-bottom-color: var(--line); }
.ob-nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 14px 32px;
  display: flex; align-items: center; gap: 32px;
}
.ob-brand {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--fg);
}
.ob-brand-wm { font-size: 16px; letter-spacing: -0.01em; }
.ob-brand-wm .o { font-weight: 300; color: var(--fg-2); }
.ob-brand-wm .b { font-weight: 600; }
.ob-nav-links { display: flex; align-items: center; gap: 4px; }
.ob-nav-links a {
  text-decoration: none; padding: 6px 12px; font-size: 13.5px;
  color: var(--fg-muted); border-radius: var(--r-6);
  transition: color var(--d-fast) var(--ease), background var(--d-fast) var(--ease);
}
.ob-nav-links a:hover { color: var(--fg); background: var(--bg-elev); }
.ob-nav-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.ob-nav-search {
  display: inline-flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 10px 0 12px;
  background: var(--bg-elev); border: 1px solid var(--line);
  border-radius: var(--r-8); color: var(--fg-muted); font-size: 12.5px;
  cursor: pointer; width: 240px;
}
.ob-nav-search:hover { border-color: var(--line-2); color: var(--fg-2); }
.ob-nav-search svg { width: 14px; height: 14px; flex-shrink: 0; }
.ob-nav-search .placeholder { flex: 1; }
.ob-nav-search .kbd {
  display: inline-flex; align-items: center; gap: 2px;
  font-family: var(--font-geist-mono, monospace); font-size: 10.5px;
  padding: 1px 5px; background: var(--bg); border: 1px solid var(--line);
  border-radius: var(--r-6); color: var(--fg-muted);
}
.ob-icon-btn {
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid transparent; border-radius: var(--r-8);
  color: var(--fg-muted); cursor: pointer; text-decoration: none;
  transition: background var(--d-fast) var(--ease), color var(--d-fast) var(--ease),
              border-color var(--d-fast) var(--ease);
}
.ob-icon-btn:hover { color: var(--fg); background: var(--bg-elev); border-color: var(--line); }
.ob-icon-btn svg { width: 16px; height: 16px; }

/* ── logo animation ── */
.logo-play .p-trunk, .logo-play .p-branch { stroke-dasharray: 100; stroke-dashoffset: 100; }
.logo-play .n-top, .logo-play .n-bot, .logo-play .n-accent {
  visibility: hidden; opacity: 0;
  transform-box: fill-box; transform-origin: center; transform: scale(.2);
}
@keyframes ob-draw { to { stroke-dashoffset: 0; } }
@keyframes ob-pop {
  0%   { visibility: visible; opacity: 0; transform: scale(.2); }
  60%  { visibility: visible; opacity: 1; transform: scale(1.15); }
  100% { visibility: visible; opacity: 1; transform: scale(1); }
}
@keyframes ob-pulse {
  0%   { visibility: visible; opacity: 0; transform: scale(.2); }
  35%  { visibility: visible; opacity: 1; transform: scale(1.35); }
  55%  { visibility: visible; transform: scale(.95); }
  100% { visibility: visible; opacity: 1; transform: scale(1); }
}
@keyframes ob-ambient {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(94,227,154,0)); }
  50%      { filter: drop-shadow(0 0 6px rgba(94,227,154,.7)); }
}
.logo-play .p-trunk  { animation: ob-draw .55s var(--ease) forwards; }
.logo-play .p-branch { animation: ob-draw .9s var(--ease) .35s forwards; }
.logo-play .n-top    { animation: ob-pop .35s var(--ease) .55s forwards; }
.logo-play .n-bot    { animation: ob-pop .35s var(--ease) .75s forwards; }
.logo-play .n-accent { animation: ob-pulse .9s var(--ease) 1.05s forwards,
                                  ob-ambient 2.4s var(--ease) infinite 2s; }
@media (prefers-reduced-motion: reduce) {
  .logo-play * {
    animation: none !important; visibility: visible !important;
    opacity: 1 !important; transform: none !important; stroke-dashoffset: 0 !important;
  }
}

/* ── hero ── */
.ob-hero {
  position: relative; padding: 96px 32px 80px;
  text-align: center; max-width: 1100px; margin: 0 auto;
}
.ob-hero-pill {
  display: inline-flex; align-items: center; gap: 8px;
  margin-bottom: 36px; padding: 5px 12px 5px 6px;
  border: 1px solid var(--line); border-radius: var(--r-full);
  background: var(--bg-elev);
  font-family: var(--font-geist-mono, monospace); font-size: 11.5px; color: var(--fg-2);
  text-decoration: none;
}
.ob-hero-pill .tag {
  background: var(--accent-soft); color: var(--accent);
  padding: 2px 8px; border-radius: var(--r-full);
  font-size: 10.5px; letter-spacing: 0.04em;
}
.ob-hero-pill .arrow { color: var(--fg-muted); }
.ob-hero-logo {
  display: flex; justify-content: center;
  margin-bottom: 32px; min-height: 64px;
}
.ob-hero h1 {
  font-size: 64px; line-height: 1.02; letter-spacing: -0.035em;
  margin: 0 auto 24px; max-width: 18ch; font-weight: 400; text-wrap: balance;
}
.ob-hero h1 .hl { color: var(--accent); font-weight: 500; }
.ob-hero h1 .quiet { color: var(--fg-2); font-weight: 300; }
.ob-hero .tagline {
  margin: 0 auto 36px; color: var(--fg-2); font-size: 18px;
  max-width: 56ch; line-height: 1.55; text-wrap: pretty;
}
.ob-hero-cta { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.ob-hero-meta {
  margin-top: 28px;
  display: flex; gap: 24px; justify-content: center; flex-wrap: wrap;
  font-family: var(--font-geist-mono, monospace); font-size: 11.5px;
  color: var(--fg-muted); letter-spacing: 0.02em;
}
.ob-hero-meta .item { display: inline-flex; align-items: center; gap: 6px; }
.ob-hero-meta .item svg { width: 12px; height: 12px; }
.ob-hero-meta .dot {
  width: 6px; height: 6px; border-radius: var(--r-full); background: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.ob-hero-preview {
  margin: 64px auto 0; max-width: 920px; text-align: left; position: relative;
}
.ob-hero-preview::before {
  content: ""; position: absolute; inset: -1px;
  background: radial-gradient(ellipse 60% 100% at 50% 0%, rgba(94,227,154,.20), transparent 60%);
  z-index: -1; filter: blur(40px); pointer-events: none;
}

/* ── terminal ── */
.ob-terminal {
  background: var(--bg-card); border: 1px solid var(--line-2);
  border-radius: var(--r-12); overflow: hidden; box-shadow: var(--sh-4);
}
.ob-terminal-bar {
  display: flex; align-items: center; gap: 8px; padding: 12px 16px;
  border-bottom: 1px solid var(--line); background: var(--bg-elev);
}
.ob-terminal-bar .tdots { display: flex; gap: 6px; }
.ob-terminal-bar .td { width: 10px; height: 10px; border-radius: var(--r-full); background: var(--line-2); }
.ob-terminal-bar .ttitle {
  margin-left: 8px;
  font-family: var(--font-geist-mono, monospace); font-size: 12px; color: var(--fg-muted);
}
.ob-terminal-bar .tactions { margin-left: auto; display: flex; gap: 6px; }
.ob-terminal-bar .tactions span {
  font-family: var(--font-geist-mono, monospace); font-size: 10.5px; color: var(--fg-muted);
  padding: 2px 8px; border: 1px solid var(--line); border-radius: var(--r-6);
}
.ob-terminal-body {
  font-family: var(--font-geist-mono, monospace); font-size: 13.5px;
  line-height: 1.75; padding: 22px 24px; color: var(--fg);
}
.tln { display: flex; gap: 14px; }
.tln .pmt { color: var(--accent); user-select: none; }
.tln .ok  { color: var(--accent); }
.tln .dim { color: var(--fg-muted); }
.tln .hl  { color: var(--fg); }
.ob-branchblock {
  margin: 6px 0 6px 14px; padding-left: 14px;
  border-left: 1px solid var(--line); color: var(--fg-2);
}
.ob-branchblock .tln { font-size: 12.5px; }
.ob-branchblock .node { color: var(--accent); }
.ob-cur {
  display: inline-block; width: 8px; height: 14px; background: currentColor;
  margin-left: 4px; vertical-align: -2px;
  animation: ob-blink 1.1s steps(1) infinite;
}
@keyframes ob-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .ob-cur { animation: none; } }

/* ── stats strip ── */
.ob-stats {
  max-width: 1100px; margin: 80px auto 0; padding: 24px 32px;
  display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
}
.ob-stat { padding: 8px 24px; border-right: 1px solid var(--line); }
.ob-stat:last-child { border-right: 0; }
.ob-stat .n { font-size: 28px; letter-spacing: -0.02em; font-weight: 500; }
.ob-stat .n .unit { font-size: 16px; color: var(--fg-muted); margin-left: 2px; font-weight: 400; }
.ob-stat .l {
  font-family: var(--font-geist-mono, monospace); font-size: 11px;
  color: var(--fg-muted); letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px;
}

/* ── section heads ── */
.ob-block { max-width: 1100px; margin: 120px auto 0; padding: 0 32px; }
.ob-block-head { margin-bottom: 48px; max-width: 720px; }
.ob-eyebrow {
  display: inline-block;
  font-family: var(--font-geist-mono, monospace); font-size: 11px; color: var(--fg-muted);
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px;
}
.ob-eyebrow .led {
  display: inline-block; width: 6px; height: 6px; border-radius: var(--r-full);
  background: var(--accent); margin-right: 8px;
  box-shadow: 0 0 0 3px var(--accent-soft); vertical-align: 1px;
}
.ob-block h2 {
  font-size: 42px; line-height: 1.05; letter-spacing: -0.03em;
  margin: 0 0 18px; font-weight: 500; text-wrap: balance;
}
.ob-block h2 .quiet { color: var(--fg-2); font-weight: 300; }
.ob-block-head p { color: var(--fg-2); font-size: 16px; margin: 0; max-width: 56ch; line-height: 1.55; }

/* ── topics grid ── */
.ob-topics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ob-topic {
  background: var(--bg-card); border: 1px solid var(--line); border-radius: var(--r-12);
  padding: 28px 28px 24px; text-decoration: none; color: inherit;
  display: flex; flex-direction: column; gap: 12px;
  transition: border-color var(--d-base) var(--ease), background var(--d-base) var(--ease);
  overflow: hidden;
}
.ob-topic:hover { border-color: var(--line-2); background: var(--bg-hover); }
.ob-topic .icon {
  width: 40px; height: 40px; border-radius: var(--r-8);
  background: var(--bg-elev); border: 1px solid var(--line);
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--fg-2); margin-bottom: 6px;
}
.ob-topic .icon svg { width: 20px; height: 20px; }
.ob-topic.feat .icon { background: var(--accent-soft); border-color: transparent; color: var(--accent); }
.ob-topic h3 { font-size: 18px; letter-spacing: -0.015em; margin: 0; font-weight: 500; }
.ob-topic p { color: var(--fg-muted); font-size: 13.5px; line-height: 1.55; margin: 0; max-width: 36ch; }
.ob-topic .footer-row {
  display: flex; align-items: center; gap: 12px; margin-top: 10px;
  font-family: var(--font-geist-mono, monospace); font-size: 11px;
  color: var(--fg-muted); letter-spacing: 0.04em;
}
.ob-topic .footer-row .count {
  padding: 2px 7px; background: var(--bg-elev); border: 1px solid var(--line);
  border-radius: var(--r-6); color: var(--fg-2);
}
.ob-topic .footer-row .arr { margin-left: auto; transition: transform var(--d-fast) var(--ease); }
.ob-topic:hover .footer-row .arr { transform: translateX(3px); color: var(--fg); }
.ob-topic .footer-row .arr svg { width: 14px; height: 14px; }

/* ── featured guide ── */
.ob-featured {
  margin-top: 28px; background: var(--bg-card); border: 1px solid var(--line);
  border-radius: var(--r-12); overflow: hidden;
  display: grid; grid-template-columns: 1fr 1.1fr;
}
.ob-feat-side {
  padding: 40px 36px; border-right: 1px solid var(--line);
  display: flex; flex-direction: column; gap: 14px; justify-content: center;
}
.ob-feat-side .eyebrow {
  font-family: var(--font-geist-mono, monospace); font-size: 11px; color: var(--accent);
  letter-spacing: 0.08em; text-transform: uppercase;
}
.ob-feat-side h3 { font-size: 28px; letter-spacing: -0.025em; margin: 0; font-weight: 500; line-height: 1.15; }
.ob-feat-side p { color: var(--fg-2); font-size: 14.5px; margin: 0; line-height: 1.55; max-width: 42ch; }
.ob-feat-side .meta {
  display: flex; gap: 14px; align-items: center; margin-top: 8px;
  font-family: var(--font-geist-mono, monospace); font-size: 11.5px; color: var(--fg-muted);
}
.ob-feat-side .meta svg { width: 13px; height: 13px; }
.ob-feat-side .meta .author-stack { display: inline-flex; }
.ob-feat-side .meta .author-stack .a {
  width: 22px; height: 22px; border-radius: var(--r-full);
  background: var(--bg-elev); border: 1px solid var(--line);
  margin-left: -6px; outline: 2px solid var(--bg-card);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-geist-mono, monospace); font-size: 9px;
}
.ob-feat-side .meta .author-stack .a:first-child { margin-left: 0; }
.ob-feat-side .cta { margin-top: 8px; }
.ob-feat-preview {
  padding: 36px 40px; font-size: 14.5px; color: var(--fg-2); line-height: 1.65; position: relative;
}
.ob-feat-preview::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 80px;
  background: linear-gradient(transparent, var(--bg-card)); pointer-events: none;
}
.ob-feat-preview h4 { margin: 0 0 14px; font-size: 22px; letter-spacing: -0.02em; color: var(--fg); font-weight: 500; }
.ob-feat-preview .anchor { color: var(--fg-faint); margin-right: 6px; font-weight: 400; }
.ob-feat-preview p { margin: 0 0 16px; }
.ob-feat-preview .ic {
  font-family: var(--font-geist-mono, monospace); font-size: 0.85em;
  padding: 1px 6px; border-radius: var(--r-6);
  background: var(--bg-elev); border: 1px solid var(--line); color: var(--fg-2);
}
.ob-callout {
  background: var(--accent-soft); border-radius: var(--r-10);
  padding: 14px 16px; display: grid; grid-template-columns: 22px 1fr; gap: 12px; margin: 16px 0;
}
.ob-callout svg { width: 18px; height: 18px; color: var(--accent); margin-top: 1px; }
.ob-callout .t { font-weight: 500; color: var(--accent); font-size: 13px; margin-bottom: 2px; }
.ob-callout .b { font-size: 13px; color: var(--fg-2); }
.ob-feat-preview pre {
  margin: 8px 0 0; background: var(--bg-elev); border: 1px solid var(--line);
  border-radius: var(--r-10); padding: 14px 16px;
  font-family: var(--font-geist-mono, monospace); font-size: 12.5px; line-height: 1.7; overflow: hidden;
}
.ob-feat-preview pre .pmt { color: var(--accent); }
.ob-feat-preview pre .cm { color: var(--fg-muted); }

/* ── values ── */
.ob-values {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line); border-radius: var(--r-12);
  overflow: hidden; background: var(--bg-card);
}
.ob-value { padding: 32px 28px; border-right: 1px solid var(--line); }
.ob-value:last-child { border-right: 0; }
.ob-value .badge {
  display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px;
  font-family: var(--font-geist-mono, monospace); font-size: 10.5px;
  background: var(--bg-elev); border: 1px solid var(--line);
  border-radius: var(--r-full); color: var(--fg-muted); letter-spacing: 0.04em; margin-bottom: 16px;
}
.ob-value .badge svg { width: 11px; height: 11px; }
.ob-value h4 { margin: 0 0 6px; font-size: 17px; letter-spacing: -0.01em; font-weight: 500; }
.ob-value p { margin: 0; color: var(--fg-muted); font-size: 13.5px; line-height: 1.55; max-width: 30ch; }

/* ── community CTA ── */
.ob-community { margin: 120px auto 80px; max-width: 1100px; padding: 0 32px; }
.ob-community-card {
  background:
    radial-gradient(ellipse 100% 80% at 50% 0%, rgba(94,227,154,.12), transparent 60%),
    var(--bg-card);
  border: 1px solid var(--line); border-radius: var(--r-16);
  padding: 64px 48px; text-align: center; position: relative; overflow: hidden;
}
.ob-community-card::before {
  content: ""; position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse 60% 80% at center, black, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 80% at center, black, transparent 70%);
  pointer-events: none;
}
.ob-community-card > * { position: relative; }
.ob-community-card .eyebrow {
  font-family: var(--font-geist-mono, monospace); font-size: 11px; color: var(--accent);
  letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; display: inline-block;
}
.ob-community-card h3 {
  font-size: 38px; letter-spacing: -0.025em; line-height: 1.1;
  margin: 0 auto 16px; max-width: 22ch; font-weight: 500; text-wrap: balance;
}
.ob-community-card p { color: var(--fg-2); font-size: 15.5px; line-height: 1.55; margin: 0 auto 32px; max-width: 56ch; }
.ob-community-card .cta-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.ob-contributor-row { margin-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
.ob-contributor-row .lbl {
  font-family: var(--font-geist-mono, monospace); font-size: 11px;
  color: var(--fg-muted); letter-spacing: 0.06em; text-transform: uppercase;
}
.ob-avatars { display: inline-flex; }
.ob-avatars .a {
  width: 32px; height: 32px; border-radius: var(--r-full);
  border: 1px solid var(--line-2); background: var(--bg-elev);
  margin-left: -8px; outline: 2px solid var(--bg-card);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-geist-mono, monospace); font-size: 11px; color: var(--fg-2);
}
.ob-avatars .a:first-child { margin-left: 0; }
.ob-avatars .a.more { background: var(--accent-soft); color: var(--accent); border-color: transparent; }

/* ── footer ── */
.ob-footer {
  border-top: 1px solid var(--line); padding: 56px 32px 36px;
  max-width: 1200px; margin: 0 auto;
}
.ob-footer-grid {
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  gap: 48px; margin-bottom: 56px;
}
.ob-footer-grid .col h5 {
  margin: 0 0 14px; font-family: var(--font-geist-mono, monospace); font-size: 10.5px;
  color: var(--fg-muted); letter-spacing: 0.08em; text-transform: uppercase; font-weight: 400;
}
.ob-footer-grid .col a {
  display: block; text-decoration: none; padding: 4px 0;
  color: var(--fg-2); font-size: 13px;
  transition: color var(--d-fast) var(--ease);
}
.ob-footer-grid .col a:hover { color: var(--fg); }
.ob-footer-brand .blurb { color: var(--fg-muted); font-size: 13px; line-height: 1.55; margin-top: 14px; max-width: 32ch; }
.ob-footer-bottom {
  border-top: 1px solid var(--line); padding-top: 24px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-geist-mono, monospace); font-size: 11px; color: var(--fg-muted);
}
.ob-footer-bottom .right { display: flex; gap: 12px; }
.ob-footer-bottom .right a { color: var(--fg-muted); text-decoration: none; }
.ob-footer-bottom .right a:hover { color: var(--fg); }

/* ── responsive ── */
@media (max-width: 980px) {
  .ob-hero h1 { font-size: 48px; }
  .ob-nav-search { width: 160px; }
  .ob-nav-links { display: none; }
  .ob-topics { grid-template-columns: 1fr; }
  .ob-featured { grid-template-columns: 1fr; }
  .ob-feat-side { border-right: 0; border-bottom: 1px solid var(--line); }
  .ob-stats { grid-template-columns: repeat(2, 1fr); padding: 24px; }
  .ob-stat:nth-child(2) { border-right: 0; }
  .ob-stat:nth-child(-n+2) { border-bottom: 1px solid var(--line); margin-bottom: 16px; padding-bottom: 16px; }
  .ob-values { grid-template-columns: 1fr; }
  .ob-value { border-right: 0; border-bottom: 1px solid var(--line); }
  .ob-value:last-child { border-bottom: 0; }
  .ob-community-card { padding: 40px 24px; }
  .ob-community-card h3 { font-size: 28px; }
  .ob-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
  .ob-block h2 { font-size: 32px; }
}
```

- [ ] **Step 2: Strip HomeLayout from `app/(home)/layout.tsx`**

Replace the entire file with:

```tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 3: Add explicit `dark` class to `<html>` in `app/layout.tsx`**

The `RootProvider` manages dark mode but we need `dark` present for Fumadocs docs colors. Ensure `html` has the dark class alongside font variables. The current file already has `suppressHydrationWarning`. Add `dark` to the className:

Replace line 23 (the `<html>` opening tag) with:
```tsx
<html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`} suppressHydrationWarning>
```

- [ ] **Step 4: Copy favicon.ico to public/**

```powershell
Copy-Item "C:\Users\MSI\Downloads\openbranch\assets\favicon.ico" "D:\Dayron\Proyectos\Contribuciones Open Source\openbranch\public\favicon.ico" -Force
```

- [ ] **Step 5: Create MIT LICENSE**

Create `LICENSE` at the project root with:

```
MIT License

Copyright (c) 2026 openbranch contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 6: Commit**

```bash
git add app/global.css "app/(home)/layout.tsx" app/layout.tsx public/favicon.ico LICENSE
git commit -m "feat: add design-system tokens, strip home layout, copy assets"
```

---

## Task 2: Icons

**Files:**
- Create: `icons/index.tsx`

All icons are thin-stroke SVG. `stroke-width="1.6"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`, `stroke="currentColor"`. Each component accepts `className?: string`.

- [ ] **Step 1: Create `icons/index.tsx`**

```tsx
type IconProps = { className?: string };
const I = ({ d, children, className }: { d?: string; children?: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d ? <path d={d} /> : children}
  </svg>
);

export const IconSearch = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconGithub = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3a9 9 0 0 0-3 17.5v-2c-3 .5-3.5-1.5-3.5-1.5-.5-1-1-1.5-1-1.5-1-.5 0-.5 0-.5 1 0 1.5 1 1.5 1 1 1.5 2.5 1 3 1 0-1 .5-1.5 1-1.5-2-.5-3.5-1-3.5-4.5 0-1 .5-2 1-2.5 0-.5-.5-1.5 0-2.5 0 0 1 0 2.5 1a8 8 0 0 1 4 0c1.5-1 2.5-1 2.5-1 .5 1 0 2 0 2.5.5.5 1 1.5 1 2.5 0 3.5-1.5 4-3.5 4.5.5.5 1 1 1 2v3" />
  </svg>
);

export const IconArrowRight = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconBranch = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="5" r="2" /><circle cx="7" cy="19" r="2" /><circle cx="17" cy="9" r="2" />
    <path d="M7 7v10" /><path d="M7 13c0-3 2-4 5-4h3" />
  </svg>
);

export const IconPR = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="5" r="2" /><circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" />
    <path d="M7 7v10" /><path d="M17 17V8a2 2 0 0 0-2-2h-2" /><path d="m14.5 4-1.5 2 1.5 2" />
  </svg>
);

export const IconFlask = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 3v6L3 19a2 2 0 0 0 2 3h14a2 2 0 0 0 2-3l-6-10V3" />
    <path d="M8 3h8" /><path d="M6.5 14h11" />
  </svg>
);

export const IconFork = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="5" r="2" /><circle cx="17" cy="5" r="2" /><circle cx="12" cy="19" r="2" />
    <path d="M7 7v3c0 2 2 4 5 4s5-2 5-4V7" /><path d="M12 14v3" />
  </svg>
);

export const IconTag = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="8" cy="8" r="1.4" />
  </svg>
);

export const IconBulb = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 18h6" /><path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 3z" />
  </svg>
);

export const IconStar = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1z" />
  </svg>
);

export const IconEye = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" />
  </svg>
);

export const IconGlobe = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3z" />
  </svg>
);

export const IconLock = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21s-7-4.35-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.65-9 9-9 9z" />
  </svg>
);
```

- [ ] **Step 2: Commit**

```bash
git add icons/index.tsx
git commit -m "feat: add inline SVG icon components"
```

---

## Task 3: LogoMark component

**Files:**
- Create: `components/LogoMark.tsx`

- [ ] **Step 1: Create `components/LogoMark.tsx`**

```tsx
type LogoMarkProps = {
  size?: number;
  animate?: boolean;
  className?: string;
};

export function LogoMark({ size = 64, animate = false, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${animate ? 'logo-play' : ''} ${className ?? ''}`}
      style={{ color: 'var(--fg)' }}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <line className="p-trunk" x1="18" y1="10" x2="18" y2="54" pathLength="100" />
        <path
          className="p-branch"
          pathLength="100"
          d="M18 24 C 18 18, 22 14, 30 14 L 40 14 C 48 14, 52 18, 52 26 L 52 38 C 52 46, 48 50, 40 50"
        />
        <circle className="n-top" cx="18" cy="10" r="4.5" fill="currentColor" stroke="none" />
        <circle className="n-bot" cx="18" cy="54" r="4.5" fill="currentColor" stroke="none" />
        <circle className="n-accent" cx="40" cy="50" r="4.5" fill="var(--accent)" stroke="none" />
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LogoMark.tsx
git commit -m "feat: add LogoMark SVG component with animation support"
```

---

## Task 4: Nav component

**Files:**
- Create: `components/Nav.tsx`

This is a `'use client'` component because it listens to scroll events to show the border.

- [ ] **Step 1: Create `components/Nav.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import { IconSearch, IconGithub, IconArrowRight } from '@/icons';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`ob-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="ob-nav-inner">
        <Link href="/" className="ob-brand" aria-label="openbranch">
          <LogoMark size={22} />
          <span className="ob-brand-wm">
            <span className="o">open</span><span className="b">branch</span>
          </span>
        </Link>

        <div className="ob-nav-links">
          <Link href="/docs">Docs</Link>
          <Link href="/docs/git">Guides</Link>
          <Link href="#">Changelog</Link>
          <Link href="#">Community</Link>
        </div>

        <div className="ob-nav-right">
          <button className="ob-nav-search" aria-label="Search the docs">
            <IconSearch />
            <span className="placeholder">Search the docs…</span>
            <span className="kbd">⌘&nbsp;K</span>
          </button>
          <a
            className="ob-icon-btn"
            href="https://github.com/Dayron-Glez/openbranch"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <IconGithub />
          </a>
          <Link href="/docs" className="ob-btn ob-btn-primary ob-btn-arrow">
            Get started
            <IconArrowRight className="arr" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: add sticky Nav component with scroll border"
```

---

## Task 5: Terminal component

**Files:**
- Create: `components/Terminal.tsx`

- [ ] **Step 1: Create `components/Terminal.tsx`**

```tsx
import type { ReactNode } from 'react';

type TerminalProps = {
  title?: string;
  tags?: string[];
  children: ReactNode;
};

export function Terminal({ title = '~/atlas · git', tags = ['main', 'fish'], children }: TerminalProps) {
  return (
    <div className="ob-terminal">
      <div className="ob-terminal-bar">
        <div className="tdots">
          <span className="td" /><span className="td" /><span className="td" />
        </div>
        <span className="ttitle">{title}</span>
        <div className="tactions">
          {tags.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
      <div className="ob-terminal-body">{children}</div>
    </div>
  );
}

export function TerminalLine({ children }: { children: ReactNode }) {
  return <div className="tln">{children}</div>;
}

export function Prompt() {
  return <span className="pmt">$</span>;
}

export function Ok() {
  return <span className="ok">✓</span>;
}

export function Highlight({ children }: { children: ReactNode }) {
  return <span className="hl">{children}</span>;
}

export function Dim({ children }: { children: ReactNode }) {
  return <span className="dim">{children}</span>;
}

export function BranchBlock({ children }: { children: ReactNode }) {
  return <div className="ob-branchblock">{children}</div>;
}

export function Cursor() {
  return <span className="ob-cur" aria-hidden />;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Terminal.tsx
git commit -m "feat: add Terminal component with subcomponents"
```

---

## Task 6: TopicCard component

**Files:**
- Create: `components/TopicCard.tsx`

- [ ] **Step 1: Create `components/TopicCard.tsx`**

```tsx
import type { ReactNode } from 'react';
import { IconArrowRight } from '@/icons';

type TopicCardProps = {
  href?: string;
  icon: ReactNode;
  title: string;
  description: string;
  count: string;
  updated: string;
  featured?: boolean;
};

export function TopicCard({ href = '#', icon, title, description, count, updated, featured }: TopicCardProps) {
  return (
    <a href={href} className={`ob-topic${featured ? ' feat' : ''}`}>
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="footer-row">
        <span className="count">{count}</span>
        <span>{updated}</span>
        <span className="arr"><IconArrowRight /></span>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TopicCard.tsx
git commit -m "feat: add TopicCard component"
```

---

## Task 7: FeaturedGuide component

**Files:**
- Create: `components/FeaturedGuide.tsx`

- [ ] **Step 1: Create `components/FeaturedGuide.tsx`**

```tsx
import { IconEye, IconHeart, IconPR, IconArrowRight, IconBulb } from '@/icons';

export function FeaturedGuide() {
  return (
    <div className="ob-featured">
      <div className="ob-feat-side">
        <span className="eyebrow">guide · 7 min read</span>
        <h3>Trunk-based development, when you can't ship feature flags first.</h3>
        <p>
          What to do when your tests are slow, your team is junior, and trunk-based feels like
          reckless advice. A field-tested middle path.
        </p>
        <div className="meta">
          <div className="author-stack">
            <span className="a">AK</span>
            <span className="a">JM</span>
            <span className="a">SP</span>
          </div>
          <span>Anya Kim &amp; 2 maintainers</span>
        </div>
        <div className="meta">
          <span><IconEye /> 18.2k reads</span>
          <span><IconHeart /> 940</span>
          <span><IconPR /> 12 revisions</span>
        </div>
        <div className="cta">
          <a href="#" className="ob-btn ob-btn-primary ob-btn-arrow">
            Read the guide
            <IconArrowRight className="arr" />
          </a>
        </div>
      </div>

      <article className="ob-feat-preview" aria-label="Guide preview">
        <h4><span className="anchor">#</span>The premise</h4>
        <p>
          Most trunk-based guides assume two things: <span className="ic">feature flags</span> are cheap
          to add, and your CI runs in under five minutes. If neither is true for you, the standard advice
          will quietly make things worse.
        </p>
        <p>Here&apos;s the version that works <em>before</em> you have either.</p>
        <div className="ob-callout">
          <IconBulb />
          <div>
            <div className="t">Rule of thumb</div>
            <div className="b">
              A branch older than 24 hours is a long-lived branch — even if you didn&apos;t mean it to be.
            </div>
          </div>
        </div>
        <h4><span className="anchor">#</span>The minimum viable setup</h4>
        <pre>
          <span className="pmt">$</span>{' '}git checkout -b feat/open-graph{'\n'}
          <span className="cm"># branch from trunk · &lt;24h lifespan target</span>{'\n'}
          <span className="pmt">$</span>{' '}openbranch lint --branch{'\n'}
          <span className="cm"># enforces naming, size, age limits before push</span>
        </pre>
      </article>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FeaturedGuide.tsx
git commit -m "feat: add FeaturedGuide component"
```

---

## Task 8: ValueProp component

**Files:**
- Create: `components/ValueProp.tsx`

- [ ] **Step 1: Create `components/ValueProp.tsx`**

```tsx
import { IconFork, IconGlobe, IconLock } from '@/icons';

export function ValueProp() {
  return (
    <div className="ob-values">
      <div className="ob-value">
        <span className="badge"><IconFork />community-owned</span>
        <h4>Every guide is a PR.</h4>
        <p>No gatekeepers. The same workflow we document is the one we use to write the docs.</p>
      </div>
      <div className="ob-value">
        <span className="badge"><IconGlobe />stack-agnostic</span>
        <h4>No framework agenda.</h4>
        <p>If a pattern only works in one stack, we say so. Most patterns here are older than your build tool.</p>
      </div>
      <div className="ob-value">
        <span className="badge"><IconLock />versioned</span>
        <h4>Advice with an expiry.</h4>
        <p>Every guide is dated, versioned, and revisited. We retire patterns that haven&apos;t aged well, on purpose.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ValueProp.tsx
git commit -m "feat: add ValueProp component"
```

---

## Task 9: CommunityCTA component

**Files:**
- Create: `components/CommunityCTA.tsx`

- [ ] **Step 1: Create `components/CommunityCTA.tsx`**

```tsx
import { IconPR, IconGithub, IconArrowRight } from '@/icons';

export function CommunityCTA() {
  return (
    <section className="ob-community">
      <div className="ob-community-card">
        <span className="eyebrow">made by the community</span>
        <h3>The handbook gets better every time you open a PR.</h3>
        <p>
          Found a pattern that worked? Disagree with an existing guide? Open a pull request, write up your
          story, or just add a sentence — the way we work is the way the docs grow.
        </p>
        <div className="cta-row">
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className="ob-btn ob-btn-primary ob-btn-lg ob-btn-arrow">
            <IconPR />
            Open your first PR
            <IconArrowRight className="arr" />
          </a>
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer"
             className="ob-btn ob-btn-secondary ob-btn-lg">
            <IconGithub />
            Browse the repo
          </a>
        </div>

        <div className="ob-contributor-row">
          <span className="lbl">2,400+ contributors · last 30 days</span>
          <div className="ob-avatars">
            {['AK','JM','SP','RN','TY','DL','MV','CH'].map((initials) => (
              <span key={initials} className="a">{initials}</span>
            ))}
            <span className="a more">+2.4k</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CommunityCTA.tsx
git commit -m "feat: add CommunityCTA component"
```

---

## Task 10: Footer component

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Create `components/Footer.tsx`**

```tsx
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';

export function Footer() {
  return (
    <footer className="ob-footer">
      <div className="ob-footer-grid">
        <div className="col ob-footer-brand">
          <Link href="/" className="ob-brand">
            <LogoMark size={22} />
            <span className="ob-brand-wm">
              <span className="o">open</span><span className="b">branch</span>
            </span>
          </Link>
          <p className="blurb">
            A community-built handbook for how teams ship software. Free, open source, always evolving.
          </p>
        </div>
        <div className="col">
          <h5>Docs</h5>
          <Link href="/docs/git">Branching</Link>
          <Link href="/docs/testing">Testing</Link>
          <Link href="/docs/contributing">Reviews</Link>
          <Link href="/docs/best-practices">Releases</Link>
        </div>
        <div className="col">
          <h5>Community</h5>
          <a href="https://github.com/Dayron-Glez/openbranch/graphs/contributors" target="_blank" rel="noopener noreferrer">Contributors</a>
          <a href="https://github.com/Dayron-Glez/openbranch/discussions" target="_blank" rel="noopener noreferrer">Discussions</a>
          <a href="#">RFC process</a>
          <a href="#">Code of conduct</a>
        </div>
        <div className="col">
          <h5>Resources</h5>
          <a href="#">Changelog</a>
          <a href="#">Style guide</a>
          <a href="#">Translations</a>
          <a href="#">Brand assets</a>
        </div>
        <div className="col">
          <h5>About</h5>
          <a href="#">Maintainers</a>
          <Link href="#">License · MIT</Link>
          <a href="#">Sponsors</a>
          <a href="#">Press kit</a>
        </div>
      </div>
      <div className="ob-footer-bottom">
        <span>openbranch · v1.4 · built by 2,400+ contributors</span>
        <div className="right">
          <a href="https://github.com/Dayron-Glez/openbranch" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#">RSS</a>
          <a href="#">Status</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

## Task 11: Hero component

**Files:**
- Create: `components/Hero.tsx`

The Hero owns the animated LogoMark, announcement pill, h1, tagline, CTAs, meta row, and terminal.

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
import Link from 'next/link';
import { LogoMark } from '@/components/LogoMark';
import {
  Terminal, TerminalLine, Prompt, Ok, Highlight, Dim, BranchBlock, Cursor,
} from '@/components/Terminal';
import { IconArrowRight, IconGithub, IconFork, IconGlobe } from '@/icons';

export function Hero() {
  return (
    <section className="ob-hero">
      <a href="#" className="ob-hero-pill">
        <span className="tag">new</span>
        <span>v1.4 · Branching strategies are live</span>
        <span className="arrow">↗</span>
      </a>

      <div className="ob-hero-logo">
        <LogoMark size={64} animate />
      </div>

      <h1>
        The open guide to <span className="hl">shipping software,</span>{' '}
        <span className="quiet">written by the people who do.</span>
      </h1>
      <p className="tagline">
        A living, community-built handbook on how teams actually merge, test, and grow real codebases
        — stack-agnostic, no fluff, always evolving.
      </p>

      <div className="ob-hero-cta">
        <Link href="/docs" className="ob-btn ob-btn-primary ob-btn-lg ob-btn-arrow">
          Read the handbook
          <IconArrowRight className="arr" />
        </Link>
        <a
          href="https://github.com/Dayron-Glez/openbranch"
          target="_blank"
          rel="noopener noreferrer"
          className="ob-btn ob-btn-secondary ob-btn-lg"
        >
          <IconGithub />
          Star on GitHub
          <span style={{ color: 'var(--fg-muted)', fontSize: '11.5px', marginLeft: '4px', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            12.4k
          </span>
        </a>
      </div>

      <div className="ob-hero-meta">
        <span className="item"><span className="dot" /> open source · MIT</span>
        <span className="item"><IconFork /> contributed by 200+ teams</span>
        <span className="item"><IconGlobe /> stack-agnostic</span>
      </div>

      <div className="ob-hero-preview">
        <Terminal>
          <TerminalLine><Prompt /><span><Highlight>openbranch</Highlight> recipe <Dim>&quot;trunk-based&quot;</Dim></span></TerminalLine>
          <TerminalLine><Dim>→ fetching guide · 2.1 KB · cached</Dim></TerminalLine>
          <BranchBlock>
            <TerminalLine><span className="node">●</span><span>a4f1e2c</span><Dim>Pull from main, branch with intent (&lt;24h)</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>9b2d8a1</span><Dim>Wrap unfinished work in a feature flag</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>7c0e44d</span><Dim>Open PR · &lt; 400 lines diff target</Dim></TerminalLine>
            <TerminalLine><span>○</span><span>3f12a89</span><Dim>Squash · merge · delete branch</Dim></TerminalLine>
          </BranchBlock>
          <TerminalLine><Prompt /><span><Highlight>openbranch</Highlight> apply <Dim>--to atlas/</Dim></span></TerminalLine>
          <TerminalLine><Ok /><span>Generated <Highlight>CONTRIBUTING.md</Highlight> · <Highlight>.github/PULL_REQUEST_TEMPLATE.md</Highlight></span></TerminalLine>
          <TerminalLine><Ok /><span>Wired branch protections · enforced PR size limit · 2-reviewer rule</span></TerminalLine>
          <TerminalLine><Prompt /><Cursor /></TerminalLine>
        </Terminal>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: add Hero section component"
```

---

## Task 12: Page composition

**Files:**
- Rewrite: `app/(home)/page.tsx`

- [ ] **Step 1: Rewrite `app/(home)/page.tsx`**

```tsx
import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { TopicCard } from '@/components/TopicCard';
import { FeaturedGuide } from '@/components/FeaturedGuide';
import { ValueProp } from '@/components/ValueProp';
import { CommunityCTA } from '@/components/CommunityCTA';
import { Footer } from '@/components/Footer';
import {
  IconBranch, IconPR, IconFlask, IconTag, IconFork, IconBulb,
} from '@/icons';

export default function HomePage() {
  return (
    <>
      <div className="ob-ambient" aria-hidden />
      <Nav />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />

        {/* Stats strip */}
        <div className="ob-stats">
          {[
            { n: '128', unit: '+', label: 'Guides & recipes' },
            { n: '2,400', unit: '', label: 'Contributors' },
            { n: '12.4', unit: 'k', label: 'GitHub stars' },
            { n: '47', unit: '', label: 'Languages translated' },
          ].map(({ n, unit, label }) => (
            <div key={label} className="ob-stat">
              <div className="n">{n}{unit && <span className="unit">{unit}</span>}</div>
              <div className="l">{label}</div>
            </div>
          ))}
        </div>

        {/* Topics */}
        <section className="ob-block" id="topics">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />What you&apos;ll find</span>
            <h2>Practical answers, <span className="quiet">not opinions disguised as best practices.</span></h2>
            <p>Every guide is rooted in a real codebase, signed off by the maintainers who shipped it, and revisited when reality disagrees. Browse by topic.</p>
          </div>
          <div className="ob-topics">
            <TopicCard featured href="#" icon={<IconBranch />} title="Branching strategies"
              description="Trunk-based, release branches, GitFlow — when each one earns its keep, and the warning signs you've outgrown it."
              count="24 guides" updated="updated 2d ago" />
            <TopicCard href="#" icon={<IconPR />} title="Pull requests & review"
              description="Templates that get reviewed, size limits that stick, and how to leave a comment that doesn't make someone defensive."
              count="18 guides" updated="updated 5d ago" />
            <TopicCard href="#" icon={<IconFlask />} title="Testing patterns"
              description="Contract tests, snapshot hygiene, killing flaky CI — patterns that hold up at 50 engineers and 50,000."
              count="31 guides" updated="updated 1w ago" />
            <TopicCard href="#" icon={<IconTag />} title="Releases & versioning"
              description="Semver in practice, changelogs your users actually read, and rollback drills that don't require a hero."
              count="14 guides" updated="updated 1w ago" />
            <TopicCard href="#" icon={<IconFork />} title="Contribution flows"
              description="Onboarding new contributors, RFCs that ship, governance that scales without smothering momentum."
              count="22 guides" updated="updated 3d ago" />
            <TopicCard href="#" icon={<IconBulb />} title="Lessons from real teams"
              description='Post-mortems, redesigns, and the "we should have done this 6 months earlier" stories worth reading.'
              count="19 stories" updated="updated yesterday" />
          </div>
        </section>

        {/* Featured guide */}
        <section className="ob-block">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />This week&apos;s pick</span>
            <h2>Real guides, <span className="quiet">read like you&apos;re pairing with someone senior.</span></h2>
          </div>
          <FeaturedGuide />
        </section>

        {/* Values */}
        <section className="ob-block">
          <div className="ob-block-head">
            <span className="ob-eyebrow"><span className="led" />Why openbranch</span>
            <h2>Built like the codebases <span className="quiet">it documents.</span></h2>
          </div>
          <ValueProp />
        </section>

        <CommunityCTA />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Start dev server and verify**

```powershell
cd "D:\Dayron\Proyectos\Contribuciones Open Source\openbranch"
bun dev
```

Open `http://localhost:3000` and check:
- Dark background (`#0B0C0E`)
- Animated logo in hero (draws trunk → branch → nodes → green pulse)
- Green "Read the handbook" CTA button
- Terminal block with green `$` prompts and cursor blink
- Stats strip (4 columns)
- Topics grid (3×2)
- Featured guide (2 cols)
- Values (3 cols)
- Community CTA with radial glow
- Footer (5 cols)
- Nav sticks and gains bottom border on scroll

Also navigate to `http://localhost:3000/docs` and verify the docs layout still works (Fumadocs sidebar, breadcrumbs, dark theme).

- [ ] **Step 3: Commit**

```bash
git add "app/(home)/page.tsx"
git commit -m "feat: implement full landing page with all sections"
```
