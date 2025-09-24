# Navigation Map (Layout‑Owned Filtering)

Purpose: Document how navigation (header + mobile + dashboard) is now derived after simplifying to a single flattened core route list and letting each layout declare what it wants to surface.

Effective: 2025-09-24

## Source of Truth (Post-Simplification)

Core produces one flat, already-conditional array:

- `useCoreRoutes()` → returns `{ links: RouteLink[] }`
  - Internally merges:
    - `useSystemRoutes()` (public base: home/products/blog/users)
    - `useAppUserRoutes()` (dashboard user groups) – only if user has an app profile
    - `useAdminRoutes()` (admin group) – only if user is admin

Layouts then perform view-specific filtering instead of providers merging arrays:

- `core/runtime/layouts/default.vue` (aka `CoreDefault` usage sites)
  - Menu bar: strictly the four public system links (fixed id allow‑list)
  - Mobile menu: system links + high-level group nodes (`user`, `admin`) so nested children appear (profile/account/admin pages)
- `core/runtime/layouts/dashboard.vue`
  - (Can choose to include dashboard/account/profile/admin subset; may later drop pure public links entirely)
- Tenant / extension layouts (e.g. Misebox, FireUX) now pass no extra menu unless they intentionally want to extend; duplicates naturally avoided because layout filters by id.

## Rationale for Change

Old model: individual composables returned separate `menuBarLinks` + `mobileLinks` which layouts concatenated and then we had to de‑duplicate (e.g. double Blog). This was error‑prone and created implicit merging rules.

New model: single canonical ordered list + explicit filtering inside each layout. Benefits:

1. Zero duplication logic (filter is deterministic)
2. Easier mental model – see the layout to understand what shows
3. Extensibility – a tenant can append links earlier by wrapping `useCoreRoutes()` result then re-filter
4. Testing simplicity – can snapshot the flat list, then assert layout filters

## Current Canonical IDs

Public base: `home`, `products`, `blog`, `users`
User group root: `user` (children: dashboard, profile, account, orders, subscriptions, favorites, etc.)
Admin group root: `admin` (children: users, products, blog, settings, etc.)

Profile-specific dashboard shortcuts (if implemented) remain children inside the `user` group tree (e.g., `chef-profile`, `supplier-profile`, etc.) rather than top-level menu items.

## Layout Filtering Patterns

Example (current core `default.vue`):

```ts
const menuBarLinks = coreRoutes.links.filter((r) =>
  ['home', 'products', 'blog', 'users'].includes(r.id)
)
const mobileLinks = coreRoutes.links.filter((r) =>
  ['home', 'products', 'blog', 'users', 'user', 'admin'].includes(r.id)
)
```

Guideline: keep the header menu bar minimal (public discovery) and let the mobile sheet expose account/admin groups for quick access when on small screens.

## Dashboard Sidebar Direction

Next refinement (optional): convert `dashboard.vue` to filter out public links entirely, showing only the `user` and (if applicable) `admin` trees – improving focus.

## Adding New Navigation Entries

1. Add route link (with stable `id`) in the relevant composable (`system`, `app user`, or `admin`).
2. Ensure its parent group (if nested) is included in the layout filter allow‑list (e.g., keep `user` if child belongs there).
3. No need to touch de‑duplication – there isn’t any now.

## Removing / Hiding Links Temporarily

Remove from the layout filter (fast) OR remove from the source composable (permanent). Prefer layout filter if feature flagging.

## Potential Future Enhancements

- Introduce a small helper like `createLayoutFilter(ids: string[])` to standardize filtering logic across layouts.
- Add type for route groups vs leaves to allow auto-expansion or grouping decisions in UI components.
- Telemetry hook to record which filtered items get clicks to prune low-value public links.

## Summary

Navigation composition is now an explicit, layout-owned concern. All logic flows from one flat route array; filters decide presentation. This eliminates hidden merges and duplicate artifacts (e.g., duplicated Blog link) and clarifies responsibilities.

## What currently feeds the dashboard

- Desktop sidebar (CoreDashboard):
  - Uses `menuBarLinks` from `useCoreRoutes()` merged with tenant-provided routes via `MiseboxDashboard`.
- Mobile menu (Header):
  - Uses `mobileLinks` from `useCoreRoutes()` merged with tenant/extension profile routes from `useMiseboxRoutes()` + `useJobRoutes()` (conditional on user profiles).

## Current route groups and examples

- Core system (always available; generally NOT dashboard-only):
  - `/`, `/products`, `/blog`, `/users`
- Core user (dashboard area):
  - `/dashboard` (Overview)
  - `/dashboard/profile`
  - `/dashboard/account`
  - `/dashboard/orders`
  - `/dashboard/subscriptions`
  - `/dashboard/favorites`
- Tenant: Misebox public
  - `/chefs`, `/suppliers`, `/kitchens`, `/recipes`
- Tenant: Misebox dashboard-profile shortcuts (only if user has profile)
  - `/dashboard/chef-profile`
  - `/dashboard/supplier-profile`
- Extension: Jobs public
  - `/jobs`, `/employers`, `/professionals`
- Extension: Jobs dashboard-profile shortcuts (only if user has profile)
  - `/dashboard/employer-profile`
  - `/dashboard/professional-profile`
- Admin (if `user.app.role === 'admin'`):
  - `/admin`, `/admin/users`, `/admin/products`, `/admin/blog`, `/admin/settings`

## Gaps identified

- Sidebar currently uses core top-level + tenant additions; however, it includes public routes (e.g., `/chefs`, `/jobs`) which may not be suitable for a dashboard-focused sidebar.
- We likely want a dashboard-only map that excludes public landing routes and instead focuses on:
  - Overview, account, orders, subscriptions, favorites
  - Profile editors for roles the user holds (chef/supplier/employer/professional)
  - Tenant/extension dashboard-specific pages (if any), not public catalogs

## Proposed dashboard-only navigation (to implement)

- User
  - Overview → `/dashboard`
  - Profile → `/dashboard/profile`
  - Account → `/dashboard/account`
  - Orders → `/dashboard/orders`
  - Subscriptions → `/dashboard/subscriptions`
  - Favorites → `/dashboard/favorites`
- Profiles (conditional)
  - Chef Profile → `/dashboard/chef-profile`
  - Supplier Profile → `/dashboard/supplier-profile`
  - Employer Profile → `/dashboard/employer-profile`
  - Professional Profile → `/dashboard/professional-profile`
- Admin (conditional)
  - Admin Overview → `/admin`
  - Users → `/admin/users`
  - Products → `/admin/products`
  - Blog → `/admin/blog`
  - Settings → `/admin/settings`

Public discovery routes (e.g., `/chefs`, `/jobs`, `/suppliers`, `/professionals`, `/kitchens`, `/recipes`) should remain in the global header or a separate section, not the dashboard sidebar.

## Next steps

- Split route providers into "public" vs "dashboard" facets:
  - Core: keep `useSystemRoutes()` public; create `useDashboardRoutes()` combining `useAppUserRoutes()` (+ admin when applicable).
  - Tenant/Extensions: provide `getMiseboxDashboardRoutes()` and `getJobDashboardRoutes()` for profile editors and any tenant/extension dashboard pages.
- Update `CoreDashboard` to use the dashboard-only sets for sidebar.
- Keep Header’s mobile slide-over as a mixture: primary account shortcuts + key public discovery links.
