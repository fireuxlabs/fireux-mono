---
title: Extensions (Nuxt Modules)
status: active
updated: 2026-02-05
---

# Extensions (Nuxt Modules)

Conventions for `packages/extensions/*` Nuxt modules so they stay predictable and easy to compose.

## Defaults

- **Nuxt kit imports:** use `@nuxt/kit` and `@nuxt/schema` (avoid `nuxt/kit` and `nuxt/schema`).
- **Config key (nuxt.config):** `fireux<PascalDomain>` (example: `fireuxProducts`, `fireuxPlaces`).
- **Runtime config namespace:** `runtimeConfig.public.fireux.<domain>` (example: `public.fireux.products`).
- **Runtime alias:** expose `#fireux-<domain>` → `src/runtime` (example: `#fireux-products`).

## Module Shape (Recommended)

- `package.json` + `registry.json`
- `src/module.ts` (exports the Nuxt module)
- `src/config/module/*-config.ts` (runtime, pages, models, server, etc.)
- `src/runtime/{components,composables,models,pages,server}`

## Canonical `module.ts` Flow

- `createResolver(import.meta.url)` once.
- Compute `runtimeDir` and call `exposeRuntimeAlias(...)`.
- Configure in this order:
  1) runtime defaults
  2) plugins
  3) composables
  4) components
  5) layouts
  6) models
  7) pages (ensures runtime layer)
  8) server (no-op is fine)
- Avoid `nuxt.hook('ready')` logs in modules.

## Runtime Layer + Pages

- Ensure the runtime layer **once** (via `ensureRuntimeLayer(resolver, nuxt)` or `ensureRuntimeLayerFromPath(nuxt, runtimeDir)`).
- Prefer **layer-discovered** pages/routes over `pages:extend` injection.
  - If you must inject/rename routes, update existing entries (don’t “skip if exists”) so the behavior is deterministic.

## Server Routes

- Prefer Nitro’s standard `src/runtime/server/api/**` file discovery (when the runtime layer is enabled).
- Avoid `addServerHandler(...)` for handlers that already live under `runtime/server/api` unless you have a specific reason (it can double-register the same route).

## Version/Compatibility Hygiene

- `meta.version` should match the package version (keep them in sync).
- `meta.compatibility.nuxt` should match the `nuxt` peer dependency range.

## Peer Dependencies

- Keep peer deps minimal and accurate:
  - baseline: `nuxt`, `@nuxt/kit`, `@nuxt/schema`, `vue`, `vue-router`
  - add only what the extension actually uses at runtime (examples: `firebase`, `vuefire`, `stripe`, `h3`, `@vueuse/core`)

## Tooling

- Add every extension to `packages/extensions/tsconfig.json` project references.
