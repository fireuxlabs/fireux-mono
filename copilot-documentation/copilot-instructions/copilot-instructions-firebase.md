---
title: Copilot — Firebase
status: draft
updated: 2025-09-01
---

[← Back to ToC](../copilot-00-toc.md)

# Copilot — Firebase

## Prompt — Resolve auth/already-initialized
> Remove any custom firebase client plugin that calls `initializeApp` or `getAuth`.  
> Keep VueFire module with `auth.enabled = true`.  
> Use `useFirebaseAuth()` where needed.

## Prompt — Admin init
> In server routes, initialize `firebase-admin` once with service account.  
> Guard against re-init in dev.

## Acceptance Checklist
- Refresh app: console shows no auth double-init
- SSR `useCurrentUser()` returns a value server-side when signed in
- `git grep -n "initializeApp(\"` finds no custom client init
- Admin endpoints work locally with service account configured

---

### Next
- Continue with [Maintenance](./copilot-instructions-maintenance.md)
