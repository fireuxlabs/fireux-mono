---
title: Platform Services
status: draft
created: 2025-10-15
---

# Platform Services

FireUX integrates Firebase, Google Places, and shared media services. This chapter records the canonical usage patterns so features remain consistent across packages.

## Firebase Client (VueFire)

- Client initialization is handled entirely by the VueFire module configured inside `createFireuxConfig`.
- `auth: { enabled: true, sessionCookie: false }` keeps the client slim and compatible with cross-app usage.
- Access Firebase services via VueFire composables:

```ts
import { useFirebaseApp, useFirestore, useCurrentUser } from 'vuefire'
```

- Components such as `<DevAuth />` are auto-registered by `fireux-core` and provide anonymous sign-in for development. Avoid custom Firebase plugins unless the module exposes a shared helper.

## Firebase Admin (Nitro)

- Use `firebase-admin` only in server routes, Nitro event handlers, or background scripts.
- Wrap initialization in a singleton to avoid duplicate app warnings.
- Credentials come from `FIREBASE_SERVICE_ACCOUNT` (JSON) or split env vars. `createFireuxConfig` passes the admin block to VueFire when the env set is complete.
- Scope Firestore writes to either `core` collections or `apps/<appId>` depending on the role determined by `useFireUXConfig`.

## Places & External Search

- Google Places requests use `GOOGLE_PLACES_API_KEY`. The key is exposed to both client and server via `runtimeConfig.public.googlePlacesApiKey`.
- Places domain logic lives in `fireux-places`. Route handlers reside under `packages/extensions/fireux-places/src/server/` and composables under `.../src/runtime/...`.
- Keep Firestore records aligned with Places data using scripts in `scripts/` (for example `2025-10-ensure-place-professional-links.ts`). Run once in dry-run mode (if supported) before applying changes.

## Media & Storage

- Avatar uploads and other media use the shared `useImageStorage` helper in `fireux-core`. It automatically scopes paths to `core` or `apps/<appId>` collections and returns the hosted URL.
- When adding new media types, reuse this helper or extend it in `packages/core/fireux-core/src/runtime/composables/firebase` so storage rules remain centralized.

## Observability & Diagnostics

- Logging: prefer Nitro `logger` for server-side messages and `consola` for client-side debug logs. Maintain consistent prefixes (`[fireux-core]`, `[fireux-places]`, etc.).
- Dev tools: `fireux-core` provides dev pages (e.g. `/dev/app` (alias `/dev/apps`), `/dev/users`) to inspect runtime state. When extending diagnostics, add new dev pages under the owning package and tag them with `layout: 'dev'` and appropriate `nav` metadata.
- Future appendices will collect alert destinations and monitoring dashboards once they are standardised.

Continue to [Development Workflow](./copilot-05-development-workflow.md) for day-to-day practices.
