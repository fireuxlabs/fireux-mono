---
title: Error Handbook
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Error Handbook

## Firebase
- **auth/already-initialized**  
  Cause: multiple client inits.  
  Fix: remove custom plugin auth init; rely on VueFire.

- **app/no-options**  
  Cause: missing env vars.  
  Fix: ensure `.env` exists for the app; restart dev.

## TypeScript
- **Cannot find module 'fireux-core/config/...':**  
  Ensure `fireux-core/package.json` exports subpaths to `src/`.  
  (App `tsconfig.json` can include a fallback path.)

## Vite 403 (__nuxt_vite_node__)  
- Ensure Vite FS allow covers monorepo root (rare now). Prefer default settings first.

---

### Next
- Go to [Troubleshooting](./copilot-troubleshooting.md)
