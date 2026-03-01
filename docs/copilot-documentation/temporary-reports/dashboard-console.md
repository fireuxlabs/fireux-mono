# Dashboard vs Console Route Audit + Migration Plan

Date: 2026-02-28
Author: Codex report (requested by Daniel)

## Summary

The repo-wide rename from `dashboard` to `console` was done in commit:

- `c5b6ee1bd6f45601ba3a492eb9dfd14693d6d8e0` (2026-02-27)

That commit moved all existing dashboard pages (core + profile/domain pages) under `/console/*`, and also introduced Granite runtime console routes.

Your target direction is sound:

- Keep `console` for runtime operations (`/console/kitchen/*`, `/console/portfolio/*`)
- Restore `dashboard` for account and control surfaces (`user/profile/settings/subscriptions/followers/admin/dev`)

## Evidence (what changed)

### Layout changes

From `c5b6ee1^` (before) to `HEAD` (after):

- `packages/core/fireux-core/src/runtime/layouts/dashboard.vue` -> `packages/core/fireux-core/src/runtime/layouts/console.vue`
- `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-dashboard.vue` -> `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-console.vue`
- Added `packages/ecosystem/fireux-granite/src/runtime/layouts/granite-console.vue`

### Route namespace changes

Before (`c5b6ee1^`):

- Dashboard pages existed
- Console pages did not exist under `packages/*/src/runtime/pages/console/*`

After (`HEAD`):

- Dashboard pages no longer exist
- Console pages now contain both account surfaces and runtime surfaces

## Route inventory: before vs after

### Before (snapshot at `c5b6ee1^`)

| Route path | File path |
|---|---|
| `/dashboard` | `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue` |
| `/dashboard/admin` | `packages/core/fireux-core/src/runtime/pages/dashboard/admin.vue` |
| `/dashboard/developer` | `packages/core/fireux-core/src/runtime/pages/dashboard/developer.vue` |
| `/dashboard/favorites` | `packages/core/fireux-core/src/runtime/pages/dashboard/favorites.vue` |
| `/dashboard/followers` | `packages/core/fireux-core/src/runtime/pages/dashboard/followers.vue` |
| `/dashboard/purchases` | `packages/core/fireux-core/src/runtime/pages/dashboard/purchases.vue` |
| `/dashboard/settings` | `packages/core/fireux-core/src/runtime/pages/dashboard/settings.vue` |
| `/dashboard/subscriptions` | `packages/core/fireux-core/src/runtime/pages/dashboard/subscriptions.vue` |
| `/dashboard/user-profile` | `packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue` |
| `/dashboard/agent` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue` |
| `/dashboard/agent/my-gigs` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/my-gigs.vue` |
| `/dashboard/agent/profile` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/profile.vue` |
| `/dashboard/professional` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue` |
| `/dashboard/professional/my-jobs` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/my-jobs.vue` |
| `/dashboard/professional/profile` | `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/profile.vue` |
| `/dashboard/supplier` | `packages/extensions/fireux-drop/src/runtime/pages/dashboard/supplier/index.vue` |
| `/dashboard/supplier/my-stock` | `packages/extensions/fireux-drop/src/runtime/pages/dashboard/supplier/my-stock.vue` |
| `/dashboard/supplier/profile` | `packages/extensions/fireux-drop/src/runtime/pages/dashboard/supplier/profile.vue` |
| `/dashboard/chef` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/index.vue` |
| `/dashboard/chef/my-recipes` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue` |
| `/dashboard/chef/profile` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/profile.vue` |
| `/dashboard/kitchen` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/index.vue` |
| `/dashboard/kitchen/dishes` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/dishes.vue` |
| `/dashboard/kitchen/haccp` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/haccp.vue` |
| `/dashboard/kitchen/ingredients` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/ingredients.vue` |
| `/dashboard/kitchen/menu` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/menu.vue` |
| `/dashboard/kitchen/mise` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/mise.vue` |
| `/dashboard/kitchen/orders` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/orders.vue` |
| `/dashboard/kitchen/purchase-orders` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/purchase-orders.vue` |
| `/dashboard/kitchen/recipes` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/recipes.vue` |
| `/dashboard/kitchen/stations` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/stations.vue` |
| `/dashboard/kitchen/suppliers` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/suppliers.vue` |
| `/dashboard/kitchen/team` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/team.vue` |
| `/dashboard/kitchen/training` | `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/training.vue` |

### After (current `HEAD`)

| Route path | File path |
|---|---|
| `/console` | `packages/core/fireux-core/src/runtime/pages/console/index.vue` |
| `/console/admin` | `packages/core/fireux-core/src/runtime/pages/console/admin.vue` |
| `/console/developer` | `packages/core/fireux-core/src/runtime/pages/console/developer.vue` |
| `/console/favorites` | `packages/core/fireux-core/src/runtime/pages/console/favorites.vue` |
| `/console/followers` | `packages/core/fireux-core/src/runtime/pages/console/followers.vue` |
| `/console/purchases` | `packages/core/fireux-core/src/runtime/pages/console/purchases.vue` |
| `/console/settings` | `packages/core/fireux-core/src/runtime/pages/console/settings.vue` |
| `/console/subscriptions` | `packages/core/fireux-core/src/runtime/pages/console/subscriptions.vue` |
| `/console/user-profile` | `packages/core/fireux-core/src/runtime/pages/console/user-profile.vue` |
| `/console/agent` | `packages/extensions/fireux-jobs/src/runtime/pages/console/agent/index.vue` |
| `/console/agent/my-gigs` | `packages/extensions/fireux-jobs/src/runtime/pages/console/agent/my-gigs.vue` |
| `/console/agent/profile` | `packages/extensions/fireux-jobs/src/runtime/pages/console/agent/profile.vue` |
| `/console/professional` | `packages/extensions/fireux-jobs/src/runtime/pages/console/professional/index.vue` |
| `/console/professional/my-jobs` | `packages/extensions/fireux-jobs/src/runtime/pages/console/professional/my-jobs.vue` |
| `/console/professional/profile` | `packages/extensions/fireux-jobs/src/runtime/pages/console/professional/profile.vue` |
| `/console/supplier` | `packages/extensions/fireux-drop/src/runtime/pages/console/supplier/index.vue` |
| `/console/supplier/my-stock` | `packages/extensions/fireux-drop/src/runtime/pages/console/supplier/my-stock.vue` |
| `/console/supplier/profile` | `packages/extensions/fireux-drop/src/runtime/pages/console/supplier/profile.vue` |
| `/console/chef` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/index.vue` |
| `/console/chef/my-recipes` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/my-recipes.vue` |
| `/console/chef/profile` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/chef/profile.vue` |
| `/console/kitchen` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue` |
| `/console/kitchen/dishes` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/dishes.vue` |
| `/console/kitchen/haccp` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/haccp.vue` |
| `/console/kitchen/ingredients` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/ingredients.vue` |
| `/console/kitchen/menu` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/menu.vue` |
| `/console/kitchen/mise` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/mise.vue` |
| `/console/kitchen/orders` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/orders.vue` |
| `/console/kitchen/purchase-orders` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/purchase-orders.vue` |
| `/console/kitchen/recipes` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue` |
| `/console/kitchen/stations` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/stations.vue` |
| `/console/kitchen/suppliers` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/suppliers.vue` |
| `/console/kitchen/team` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/team.vue` |
| `/console/kitchen/training` | `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/training.vue` |
| `/console/portfolio` | `packages/ecosystem/fireux-granite/src/runtime/pages/console/portfolio/index.vue` |
| `/console/portfolio/properties` | `packages/extensions/fireux-properties/src/runtime/pages/console/portfolio/properties.vue` |
| `/console/portfolio/compliance` | `packages/extensions/fireux-compliance/src/runtime/pages/console/portfolio/compliance.vue` |
| `/console/portfolio/documents` | `packages/extensions/fireux-documents/src/runtime/pages/console/portfolio/documents.vue` |
| `/console/portfolio/tasks` | `packages/extensions/fireux-tasks/src/runtime/pages/console/portfolio/tasks.vue` |

## Proposed target split (recommended)

### Keep on `/console/*` (runtime operations)

- `/console/kitchen/*`
- `/console/portfolio/*`

### Move to `/dashboard/*` (account/control surfaces)

- Core account/control:
  - `/console` -> `/dashboard`
  - `/console/user-profile` -> `/dashboard/user-profile`
  - `/console/settings` -> `/dashboard/settings`
  - `/console/subscriptions` -> `/dashboard/subscriptions`
  - `/console/followers` -> `/dashboard/followers`
  - `/console/favorites` -> `/dashboard/favorites`
  - `/console/purchases` -> `/dashboard/purchases`
  - `/console/admin` -> `/dashboard/admin`
  - `/console/developer` -> `/dashboard/developer`
- Profile-workspace pages (non-runtime shell):
  - `/console/agent*` -> `/dashboard/agent*`
  - `/console/professional*` -> `/dashboard/professional*`
  - `/console/supplier*` -> `/dashboard/supplier*`
  - `/console/chef*` -> `/dashboard/chef*`

## Migration plan (phased)

### Phase 1: Reintroduce dashboard shell safely

1. Re-add `packages/core/fireux-core/src/runtime/layouts/dashboard.vue` as a thin wrapper around the current console shell components (no UX divergence yet).
2. Re-add `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-dashboard.vue` only if chef pages remain kitchen-owned and move under dashboard.
3. Keep `console` layouts untouched during this phase.

### Phase 2: Route restoration by copy+redirect (not destructive rename first)

1. Create new `/dashboard/*` page files for all target dashboard routes.
2. For each new dashboard page, reuse existing page component logic initially (copy/import), then gradually specialize.
3. Add temporary redirects:
   - `/console/(core+profile)` -> `/dashboard/...`
   - Keep `/console/kitchen/*` and `/console/portfolio/*` unchanged.

### Phase 3: Navigation split

1. Introduce explicit nav presets:
   - `useDashboardNav()` for dashboard pages.
   - `useConsoleNav()` for runtime consoles.
2. Ensure dashboard menu excludes runtime-scoped operations.
3. Ensure console menu excludes account/admin/dev pages.

### Phase 4: Compatibility redirects (both directions where needed)

1. Legacy pre-rename compatibility:
   - `/dashboard/kitchen/*` -> `/console/kitchen/*`
2. Post-rename compatibility:
   - `/console/user-profile` etc. -> `/dashboard/...`
3. Keep redirects for at least one release cycle.

### Phase 5: Cleanup

1. Remove duplicate page implementations once traffic confirms redirects are stable.
2. Update docs and internal links:
   - auth redirect targets
   - header quick links
   - onboarding deep links
   - SEO noindex/disallow policies for both namespaces
3. Add regression tests for route guards and nav visibility.

## Risks and controls

- Risk: Broken deep links from bookmarks.
  - Control: bidirectional redirect table + release-note callout.
- Risk: Mixed nav state (dashboard items visible in console and vice versa).
  - Control: split nav presets and enforce by layout key.
- Risk: Auth/role drift on moved routes.
  - Control: preserve `requiresAuth`, role checks, and route meta during copy phase.

## Suggested execution order (low risk)

1. Core dashboard restoration first (`/dashboard` + user/settings/subscriptions/admin/dev/followers/favorites/purchases).
2. Profile routes next (`agent/professional/supplier/chef`).
3. Keep runtime operations under `/console/kitchen/*` and `/console/portfolio/*` throughout.
4. Remove old `/console` account/profile routes only after redirects are live and verified.

## Appendix: key rename set in `c5b6ee1`

Examples (all in same commit):

- `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue` -> `packages/core/fireux-core/src/runtime/pages/console/index.vue`
- `packages/core/fireux-core/src/runtime/layouts/dashboard.vue` -> `packages/core/fireux-core/src/runtime/layouts/console.vue`
- `packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/kitchen/index.vue` -> `packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/index.vue`
- `packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue` -> `packages/extensions/fireux-jobs/src/runtime/pages/console/agent/index.vue`
- `packages/extensions/fireux-drop/src/runtime/pages/dashboard/supplier/index.vue` -> `packages/extensions/fireux-drop/src/runtime/pages/console/supplier/index.vue`

