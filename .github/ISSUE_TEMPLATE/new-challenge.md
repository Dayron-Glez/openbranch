---
name: "🎯 New Challenge"
about: Propose a new playground challenge (a hands-on coding exercise)
title: "[challenge] "
labels: content
---

## 🎯 Scenario

What realistic situation does the reader face? The "ticket" — what was reported and where the code lives.

## 🏷️ Category & difficulty

- **Category:** bug-fix | code-review | testing | git | documentation
- **Difficulty:** beginner | moderate | demanding
- **Estimated time:** ~N minutes

## 🐛 The task & the "aha"

What does the reader fix or build, and what is the one clear lesson they walk away with?

## 🧪 Workspace & grading

The `category` above decides which engine runs this challenge, and each engine has its own template contract — see [Adding a playground challenge](../../CONTRIBUTING.md#adding-a-playground-challenge).

- **Files the reader sees:** which are editable, which are read-only context
- **How it is graded:** the tests, the merge result, or the criteria that decide it is solved
- **Does it fit an existing engine?** If not, say so — a scenario that needs a sixth engine is a much larger piece of work and worth discussing before anyone writes code

## 🧠 Skills

The concrete, searchable skills it exercises:

-
-

## 🌐 Languages

- [ ] 🇪🇸 Spanish (default)
- [ ] 🇬🇧 English variant (`*.en.mdx`)
- [ ] Both

## ✅ Acceptance criteria

- [ ] Challenge brief exists in both languages (if applicable), following the situation → what you'll do → done-when structure
- [ ] Engine template added under `features/playground/challenges/<category>/`, matching that engine's contract
- [ ] Registered in that engine's registry — without this, the workspace 404s
- [ ] Hints provided in both languages (`hints` + `hintsByLang.es`; `code-review` has none)
- [ ] Grades objectively (tests pass = solved)
- [ ] `bun run build` passes with no errors
- [ ] Maintainer: `bun run db:sync-challenges` + `bunx supabase db push` so it scores its declared difficulty
