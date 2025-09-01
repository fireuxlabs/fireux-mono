---
title: Copilot Instructions: Core & Modules
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Copilot Instructions: Core & Modules

## Goal
Keep `fireux-core` the single source of truth for config helpers & runtime.

## Prompt — Add a new config helper
> Update `packages/core/fireux-core/src/config/...` to add `<helper>`.  
> Export it through `packages/core/fireux-core/package.json` "exports".  
> Add a minimal unit test if applicable.  
> Do not touch app tsconfigs.

## Prompt — Fix subpath resolution
> Ensure `fireux-core/package.json` exports `./config/app/*` pointing to `src/`.  
> Avoid generating `.d.ts` in `src/`. No `dist/` in VCS.

## Acceptance Checklist
- `pnpm -w typecheck:packages` exits 0
- `pnpm -w typecheck:apps` exits 0
- Apps can `import { createFireuxConfig } from 'fireux-core/config/app/fireux-config'`
- `git grep -n "initializeApp(\"` finds no client re-inits outside VueFire
- No new files added under any `dist/` folder

---

### Next
- Continue with [Apps & Projects](./copilot-instructions-projects.md)
