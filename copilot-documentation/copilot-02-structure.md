---
title: Monorepo Structure
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Monorepo Structure

/packages
/core/fireux-core
/extensions/fireux-*
/tenants/fireux-*
/projects
//
/copilot-documentation

**Ownership**
- Code lives under `packages/**` (modules) and `projects/**` (apps).
- Each package/project keeps its own docs in `docs/` (copilot-prefixed).

**Paths**
- TS paths declared at root:  
  - `fireux-core/*` → `packages/core/fireux-core/src/*`
  - `fireux-<pkg>/*` → `packages/**/src/*`
- App tsconfigs extend `.nuxt/tsconfig.json` and only include their own files.

**Modules vs Apps**
- _Module_ provides config helpers & runtime code.
- _App_ composes modules via `createFireuxConfig(...)`.

---

### Next
- Configure the stack in [Config (Nuxt / TS / Env)](./copilot-03-config.md)
