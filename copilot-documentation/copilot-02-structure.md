---
title: Monorepo Structure
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Monorepo Structure

/packages
/core/fireux-core
/extensions/fireux-_
/tenants/fireux-_
/projects
//
/copilot-documentation

**Ownership**

- Code lives under `packages/**` (modules) and `projects/**` (apps).
- Each package/project keeps its own docs in `docs/` (copilot-prefixed).

**Paths**

- TS paths declared at root (`tsconfig.json`):
  - `fireux-core` → `packages/core/fireux-core/src/module.ts`
  - `fireux-core/*` → `packages/core/fireux-core/src/*`
  - `#fireux-core-runtime/*` → `packages/core/fireux-core/src/runtime/*`
  - `fireux-places/*`, `fireux-jobs/*`, `fireux-misebox/*` → respective `packages/**/src/*`
- Apps extend a shared base and include Nuxt types; don’t override Nuxt aliases:
  - App `tsconfig.json` extends `../tsconfig.app.base.json` and includes `.nuxt` types
  - Preserve Nuxt virtuals (`~`, `@`, `~~`) and map `#imports`/`#build` (and optional `#pwa` types)

**Modules vs Apps**

- _Module_ provides config helpers & runtime code.
- _App_ composes modules via `createFireuxConfig(...)`.

---

### Next

- Configure the stack in [Config (Nuxt / TS / Env)](./copilot-03-config.md)
