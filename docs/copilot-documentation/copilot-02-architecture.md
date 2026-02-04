---
title: Architecture Snapshot
status: draft
created: 2025-10-15
---

# Architecture Snapshot

This chapter summarizes the runtime layers, data flow, and ownership boundaries that define the FireUX platform. Understanding these relationships is essential before modifying modules, ecosystems, or Nuxt apps.

## Layered Structure

- **Core (`packages/core/fireux-core`)** provides shared UX primitives, runtime composables, configuration helpers, and auto-registered components.
- **Extensions (`packages/extensions/*`)** add domain-specific capability (Jobs, Places, etc.). Each extension depends on `fireux-core`, exports its own Nuxt module, and owns the routes, stores, and assets for that feature slice.
- **Ecosystems (`packages/ecosystem/*`)** compose extensions for a domain network (for example hospitality or cleaning). They configure routing, theming, capability flags, and cross-app rules while delegating shared logic to core/extensions.
- **Apps (`projects/<ecosystem>/<app>`)** are branded Nuxt shells that call `createFireuxConfig` to install ecosystem modules, provide app-specific branding, and host deployment-specific configuration.

## Data & Auth Flow

- Client Firebase is initialised once via the VueFire module bundled inside `createFireuxConfig`. No package should call `initializeApp` directly.
- Server-side Firebase Admin usage is restricted to Nitro handlers and utilities; credentials come from `FIREBASE_SERVICE_ACCOUNT` (JSON) or split env vars.
- Collections follow the `core` vs `apps/<appId>` pattern. Core modules read/write to global collections; apps default to app-scoped collections unless a scope override is supplied.
- Composables expose scoped helpers (e.g. `useUser`, `useFireUXConfig`) that pick the right collection automatically based on the app role.
- In ecosystems that enable labor sharing, professionals and jobs can be discovered/fulfilled across multiple branded apps under controlled rules (visibility, permissions, and assignment constraints).

## Module Install Graph

1. Nuxt apps call `createFireuxConfig({ modules: [...] })`.
2. The helper installs `fireux-core` and shared Nuxt modules (Nuxt UI, VueFire, PWA) and deduplicates additional modules.
3. Ecosystems register their own module plus extensions they own; they never install `fireux-core` directly.
4. Extensions install `fireux-core` and register their own runtime assets to guarantee availability regardless of which ecosystem/app consumes them.

Keep module lists single-sourced: if an ecosystem installs an extension, the app should not list it again.

## Routing Ownership

- Extensions expose their pages through `src/config/pages-config.ts` (see `fireux-places` and `fireux-jobs`).
- Ecosystems aggregate routes from installed extensions and add ecosystem-only screens.
- Apps own shell-level routes (marketing, auth, app-specific onboarding). Avoid re-declaring routes that belong to an extension or ecosystem.
- Navigation metadata (`definePageMeta({ nav: ... })`) drives the dev layout and should live with the page that exports the route.

## Documentation Boundaries

- Platform-wide behaviour (like the rules above) stays in this handbook.
- Deep dives or inventories specific to a package belong under `packages/**/docs/` and are indexed from [package-docs-index.md](./package-docs-index.md).
- Historical deep dives were removed after the 2025-10-15 migration; use repository history if you need to recover prior context.

Continue to [Configuration & Tooling](./copilot-03-configuration.md) to see how Nuxt, TypeScript, and environment settings are composed.
