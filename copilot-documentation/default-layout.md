# Default layout map

This document lists every file responsible for the default layout in apps and packages, and how they connect.

## Core (shared)
- packages/core/fireux-core/src/runtime/layouts/default.vue — CoreDefault component used by tenant defaults; not registered as a Nuxt layout key to avoid collisions. Consumes routes from props and merges with core routes via `useCoreRoutes()`.
- packages/core/fireux-core/src/config/layouts-config.ts — Registers Core layouts as components and keys (dashboard/dev/design/docs), but intentionally does NOT register a `default` layout key.

## Tenants (packages)
- packages/tenants/fireux-cleanbox/src/runtime/layouts/CleanboxDefault.vue — Renders `<CoreDefault :routes="cleanboxRoutes" />`. Awaits `useAppUser()` and maps `getCleanboxRoutes(hasProfile)`.
- packages/tenants/fireux-cleanbox/src/config/layouts-config.ts — Registers layout components and keys: CleanboxDefault, CleanboxDashboard, CleanboxDev.

- packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDefault.vue — Renders `<CoreDefault :routes="miseboxRoutes" />`. Awaits `useAppUser()` and maps `getMiseboxRoutes(hasProfile)`.
- packages/tenants/fireux-misebox/src/config/layouts-config.ts — Registers layout components and keys: MiseboxDefault, MiseboxDashboard, MiseboxDev.

- packages/tenants/fireux-fireux/src/config/layouts-config.ts — Registers FireuxDefault/FireuxDashboard/FireuxDev keys if present (tenant may not ship its own default.vue).

## Apps (projects)
- projects/cleanbox/cleanbox-app/app/layouts/default.vue — Proxies to `<CleanboxDefault />`.
- projects/cleanbox/richies-reinigung/app/layouts/default.vue — Proxies to `<CleanboxDefault />`.
- projects/misebox/misebox-app/app/layouts/default.vue — Proxies to `<MiseboxDefault />`.
- projects/misebox/niederhorn/app/layouts/default.vue — Proxies to `<MiseboxDefault />`.
- projects/fireux/fireux-app — No app-level default.vue found; relies on tenant/core provided layouts.

## Data/composables involved
- packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts — Builds base menu/mobile links and awaits `useAppUser()` internally.
- Tenant route mappers:
  - packages/tenants/fireux-cleanbox/src/runtime/composables/app/routes/useCleanboxRoutes.ts
  - packages/tenants/fireux-misebox/src/runtime/composables/app/routes/useMiseboxRoutes.ts

## Notes
- Tenant defaults await `useAppUser()` in `<script setup>`, so they run on SSR. If you see VueFire auth-init warnings during SSR, consider moving user-dependent route mapping to client or guarding with `import.meta.client`.
- CoreDefault merges app-provided routes with core routes; apps can override by providing their own app/layouts/default.vue that renders tenant-specific Default components.
