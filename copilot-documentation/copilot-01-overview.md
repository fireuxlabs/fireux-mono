---
title: FireUX — Overview
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# FireUX — Overview

FireUX is a Nuxt 4 + Vue 3 monorepo with:
- **Core**: shared UX, modules, config helpers, runtime plugins.
- **Extensions**: optional domain modules (e.g. Jobs, Places).
- **Tenants**: productized bundles (e.g. Misebox, Cleanbox).
- **Apps/Projects**: deployable Nuxt apps composed from the above.

## Guiding Principles
1. **Source-first**: packages export `src/` (no `dist/` checked in).
2. **Single way to do things**: one Nuxt config composer, one Firebase entrypoint.
3. **DX over complexity**: minimal tsconfigs per app; strict but predictable.
4. **Copilot-friendly**: documents and prompts live with the code.

## What “good” looks like
- Apps import: `import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'`
- One Firebase client init path (via vuefire module), zero double-inits.
- Monorepo typechecking passes from the root.

---

### Next
- Explore the [Monorepo Structure](./copilot-02-structure.md)
