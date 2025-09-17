# Dev Pages Guide

This short guide summarizes our local dev routes, how they’re structured, and how to extend them for new tenants or extensions.

## Servers and URLs

- Misebox dev: http://localhost:3001/dev/fireux-misebox
- Jobs dev: http://localhost:3001/dev/fireux-jobs

Use the workspace tasks to start servers:

- dev:misebox (3001) – tenant app
- dev:fireux (3000), dev:cleanbox (3002), dev:niederhorn (3003), dev:richies (3004)
- dev:all-extended boots all (3000–3004)

## Layout and Navigation

- Core layout: `fireux-core/src/runtime/layouts/dev.vue`
  - Renders a Dev menu via `DevNav` using a `DevRoutes` object.
- Tenant layout example: `packages/tenants/fireux-misebox/src/runtime/layouts/MiseboxDev.vue`
  - Computes links with `getMiseboxDevRoutes()`.

## Pages Locations

- Misebox dev page:
  - `packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue`
  - Lists global Chefs and Suppliers and shows the current global profile for each.
- Jobs dev page:
  - `packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue`
  - Lists global Employers and Professionals and shows the current global profile for each.

Both pages use the unified profiles API: `useProfile(ProfileConfig)`.

## Profiles API (recap)

- Import config per profile, e.g., `chefConfig`, `supplierConfig`, `employerConfig`, `professionalConfig`.
- `useProfile(config)` returns:
  - `current.global`, `current.appMirror` (if tenant)
  - `collection.local` (tenant), `collection.global` (global or after `fetchGlobal()`), `collection.fetchGlobal()`
- Call `profile.collection.fetchGlobal()` onMounted to ensure the global list is loaded regardless of tenancy.

## Extending with a New Dev Page

1. Add a page under the appropriate package:

- Tenant: `packages/tenants/<tenant>/src/runtime/pages/dev/<slug>.vue`
- Extension: `packages/extensions/<ext>/src/runtime/pages/dev/<slug>.vue`

2. Use the dev layout and unified profiles composable:

- `definePageMeta({ layout: 'dev' })`
- Import profile configs and `useProfile`, then fetch global collections with `onMounted(() => profile.collection?.fetchGlobal?.())`.

3. Update routes (if using a tenant-specific Dev layout):

- For Misebox, see `useMiseboxDevRoutes.ts` to add links.

## Notes

- We keep models canonical (id, name, avatar, optional title/bios/specialties). UI cards read these directly.
- The dev pages are read-only views to inspect global data and the current user’s global profile.
- If TypeScript warnings appear in module packages for auto-imports, ensure the package tsconfig includes `.vue` files, or add minimal ambient shims in `src/runtime/env.d.ts`.

---

If you want this guide mirrored into project docs or extended with screenshots, ping Copilot.
