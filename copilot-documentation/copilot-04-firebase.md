---
title: Firebase (VueFire + Admin)
status: draft
updated: 2025-09-01
---

[← Back to ToC](./copilot-00-toc.md)

# Firebase (VueFire + Admin)

## Client
- Single init path: via `nuxt-vuefire` module in `createFireuxConfig`.
- `auth: { enabled: true, ssr: true }`
- Do not call `initializeApp()` or `getAuth()` in custom plugins.
- Access with VueFire composables:

```ts
import { useFirebaseApp, useFirebaseAuth, useCurrentUser } from 'vuefire'
```

### Typical anonymous auth flow
- Use the shared `<DevAuth />` component from `fireux-core` (auto-registered). Drop it on a test page and click to sign in anonymously.

## Admin (server)
- Use firebase-admin in Nitro routes only.
- Initialize once, reuse global admin app (guard with a singleton).

## Common error fixes
- auth/already-initialized: remove custom firebase client plugin; keep vuefire.
- app/no-options: missing env vars in app .env; restart dev server.

### Centralization rules
- Only one `.env.example` at repo root. Apps symlink `.env` to the root `.env`.
- No per-app `types/vuefire.d.ts` files; rely on nuxt-vuefire types.
- No per-app `DevAuth.vue`; shared component lives in `fireux-core` and is auto-registered.

---

### Next
- Continue to [Dev Workflow](./copilot-05-dev-workflow.md)
