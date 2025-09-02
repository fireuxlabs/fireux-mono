# FireUX Runtime Wiring

This document explains how runtime config is created and exposed to apps, and where to look when debugging values.

## Overview
- The core module ensures a stable namespace at `runtimeConfig.public.fireux.core`.
- The app factory maps environment variables into `runtimeConfig` (public and private).
- The app reads values via `useRuntimeConfig()` on both server and client.

## Files involved

Core package (module + helper)
- packages/core/fireux-core/src/module.ts
  - Calls `configureRuntime(nuxt, 'core')` during module setup.
- packages/core/fireux-core/src/config/runtime-config.ts
  - Helper that merges into `nuxt.options.runtimeConfig.public.fireux[key]`.

Factory (app config generator)
- packages/core/fireux-core/src/runtime/utils/fireux-config.ts
  - `createFireuxConfig(opts)` maps env → `runtimeConfig` and sets `public.firebaseConfig`, branding fields, etc.

App (consumer)
- projects/fireux/fireux-app/app/app.vue
  - Uses `useRuntimeConfig()` and logs `runtime.public` (server/client) for validation.

## Data flow
1) App’s `nuxt.config` is created via `createFireuxConfig(...)` and includes:
   - `runtimeConfig.public` (client-readable values like `firebaseConfig`)
   - `runtimeConfig.firebaseServiceAccount` (server-only secret)
2) During module setup, `configureRuntime(nuxt, 'core')` ensures `public.fireux.core` exists and merges defaults (e.g., `{ enabled: true }`).
3) At runtime, the app accesses values using:
   - `const runtime = useRuntimeConfig()`
   - `runtime.public.fireux.core`
   - `runtime.public.firebaseConfig`

## Contract summary
- Inputs: Environment variables in process.env (used by factory); module `key` (usually `core`).
- Outputs: `runtimeConfig.public.fireux[key]` merged; no side effects beyond this namespace.
- Error modes: None; the helper initializes missing objects and merges shallowly.

## Verify
- Boot the app and check server/client console for `runtime.public` output.
- Expect `runtime.public.fireux.core` to be present and merged.
- Expect `runtime.public.firebaseConfig` to reflect env mapping from the factory.

## Notes
- Keep cleanup/transform logic in the factory, not in the runtime helper.
- Mutate `nuxt.options.runtimeConfig` in modules so values are baked into the build.
