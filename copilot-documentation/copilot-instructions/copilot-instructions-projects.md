---
title: Copilot — Apps & Projects
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Copilot — Apps & Projects

## Prompt — Create a new app
> Scaffold `projects/<ecosystem>/<app>/` with Nuxt 4.  
> Use `createFireuxConfig` in `nuxt.config.ts`.  
> Add local `.env.example` with Firebase keys.  
> Minimal `tsconfig.json` extending `.nuxt/tsconfig.json`.

## Prompt — Add module to app
> In `nuxt.config.ts`, add `'fireux-<module>'` to `modules: []`.  
> Do not modify TS paths unless needed.

## Acceptance Checklist
- `pnpm dev:<app>` runs without errors
- `.env` exists with Firebase keys and app boots in browser
- `git grep -n "initializeApp(\"` shows only VueFire internals
- New app tsconfig extends `./.nuxt/tsconfig.json`
- No changes to global TS path mappings were required

---

### Next
- See [Firebase](./copilot-instructions-firebase.md)
