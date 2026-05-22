## 📋 Description

Briefly describe what this PR does and why it is needed.

---

## 🔗 Related issue

Closes #

---

## 📍 Area affected

- [ ] 🏠 Landing page
- [ ] 📚 Docs — content (MDX)
- [ ] 🎨 Docs — UI / layout
- [ ] 🌐 i18n / locale routing
- [ ] 🔍 Search
- [ ] ⚙️ Config / infrastructure (CI, dependencies, build)

---

## 🏷 Type of change

- [ ] 🚀 New feature
- [ ] 🐛 Bug fix
- [ ] 🎨 Style / UI (visual changes)
- [ ] ♻️ Refactor (code improvement without changing behaviour)
- [ ] 📚 Content (guides, recipes, translation)
- [ ] 🔧 Chore (config, dependencies, CI/CD)

---

## ✅ Checklist

### General

- [ ] Builds without errors (`npm run build` passes)
- [ ] No TypeScript errors (`npm run types:check` passes)
- [ ] Manually tested in `npm run dev`
- [ ] Does not break existing functionality

### 🎨 If it touches UI / animations

- [ ] Components render correctly
- [ ] Responsive across breakpoints (mobile, tablet, desktop)
- [ ] `prefers-reduced-motion` respected if animations are involved
- [ ] No visual regressions on `/` and `/en`

### 📚 If it touches content (MDX)

- [ ] Content is accurate and actionable
- [ ] Follows the project writing style (concise, no fluff)
- [ ] Both language variants updated if applicable (`*.mdx` + `*.en.mdx`)
- [ ] Added your name to `authors:` in frontmatter if you wrote or substantially edited the guide
- [ ] Registered in `meta.json` / `meta.en.json` if a new guide was added
- [ ] MDX renders without errors (`npm run build` passes)

### ⚙️ If it touches config / infrastructure

- [ ] No new SonarCloud warnings introduced
- [ ] i18n routes still work (`/` and `/en`)
- [ ] `GET /llms.txt`, `/og/*`, `/api/search` still respond correctly

---

## 📸 Screenshots / evidence

Screenshots, GIFs, or manual validation steps if applicable.

---

## 📝 Additional notes

Any extra context for the reviewer.
