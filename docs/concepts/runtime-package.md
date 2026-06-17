Runtime package spine map
Updated: 2026-06-17
Ref: 37fb262f0
Role: map, not canon

Purpose:
Map how FireUX packages expose runtime surfaces to Nuxt apps.

Vertical links:
- Parent: fireux.md
- Child: components.md
- Child: composables.md
- Child: pages.md
- Child: server-api.md

Horizontal links:
- pnpm.md
- app-config.md
- spine.md

Common shape:
- `src/module.ts`
- `src/config/module/*`
- `src/runtime/components`
- `src/runtime/composables`
- `src/runtime/models`
- `src/runtime/pages`
- `src/runtime/server`
- `src/runtime/utils`

Module registration:
- Core helper: `fireux-core/config/module/module-wiring`.
- Common package hooks: `configureRuntime`, `configurePlugins`, `configureComposables`, `configureComponents`, `configureLayouts`, `configureModels`, `configurePages`, `configureServer`.
- Do not add a runtime surface without checking module registration.

Similarities:
- Core, ecosystem, and extension packages all register through Nuxt module entry points.
- Runtime surfaces should be importable or auto-registered according to package config.

Differences:
- Core packages are shared foundations and have the strictest L1 package shape.
- Ecosystem packages carry ecosystem config, Firebase binding, and public assets.
- Extension packages carry domain runtime surfaces.

Open questions:
- README placeholders are required by guard but should stay TODO-only until docs are intentionally rebuilt.
