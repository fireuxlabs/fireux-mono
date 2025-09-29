# FireUX App – Dashboard Inspection Plan

Purpose: Identify and list the files we must inspect to stand up a minimal, user-only dashboard for the FireUX app (projects/fireux/fireux-app) using Nuxt UI 4 and the shared CoreDashboard shell.

Effective: 2025-09-23

## Target app scope

- Root: `projects/fireux/fireux-app`
- Goal: A simple dashboard that focuses on the signed-in user (overview + profile/account basics), deferring tenant- or jobs-specific items.

## Files to inspect (and why)

1. App layout and wiring

- `projects/fireux/fireux-app/app/app.vue` — root app wrapper; verify global providers/components.
- `projects/fireux/fireux-app/nuxt.config.ts` — modules and runtime config; ensure fireux-core module is enabled and components from packages are auto-registered; confirm Nuxt UI setup.
- `packages/core/fireux-core/src/runtime/layouts/dashboard.vue` — CoreDashboard shell the app can reuse.

2. Navigation providers (core): dashboard-only set

- `packages/core/fireux-core/src/runtime/composables/app/routes/useAppUserRoutes.ts` — user dashboard links (Overview, Profile, Account, Orders, Subscriptions, Favorites).
- `packages/core/fireux-core/src/runtime/composables/app/routes/useAdminRoutes.ts` — conditional admin group.
- `packages/core/fireux-core/src/runtime/composables/app/routes/useCoreRoutes.ts` — how system/app/admin are composed; we’ll likely split to dashboard-only vs public for sidebar.

3. Public/global navigation (to exclude from dashboard sidebar)

- `packages/core/fireux-core/src/runtime/composables/app/routes/useSystemRoutes.ts` — Home, Products, Blog, Users; keep for header, not dashboard sidebar.

4. Pages to be included in the minimal dashboard

- `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue` — dashboard overview; can be used as-is or adapted.
- `packages/core/fireux-core/src/runtime/pages/dashboard/profile.vue` — profile page.
- `packages/core/fireux-core/src/runtime/pages/dashboard/account.vue` — account settings page.
- `packages/core/fireux-core/src/runtime/pages/dashboard/orders.vue` — orders list placeholder.
- `packages/core/fireux-core/src/runtime/pages/dashboard/subscriptions.vue` — subscriptions placeholder.
- `packages/core/fireux-core/src/runtime/pages/dashboard/favorites.vue` — favorites placeholder.

5. Header and auth integration

- `packages/core/fireux-core/src/runtime/components/layouts/Header.vue` — sign-in/out UX, mobile slide-over, and top navigation; used across apps.
- `packages/core/fireux-core/src/runtime/composables/firebase/useAuth.ts` — sign-in/out hooks (confirm presence and usage); fallback to `/auth`.
- `packages/core/fireux-core/src/runtime/pages/auth.vue` — authentication page (used for fallback/alternate providers).

6. FireUX app pages and design system overlays (optional)

- `projects/fireux/fireux-app/app/pages/**` — app-specific pages; verify no conflicting dashboard layout.
- `projects/fireux/fireux-app/pages/**` — legacy or marketing pages; ensure they do not override dashboard.
- `projects/fireux/fireux-app/app/components/**` — any app-specific layout or nav component hooks.

## Acceptance for "simple user-only dashboard"

- Pages above load under the CoreDashboard layout when visiting `/dashboard` and its children.
- Sidebar shows only the dashboard user links (no public discovery routes).
- Header retains global links + mobile slide-over with a reasonable mix of account + key public routes.
- Sign-in/out flow functional (Google -> home, fallback to `/auth`).

## Next steps

- Implement a dashboard-only route provider in core and wire CoreDashboard sidebar to it.
- Add `app/layouts/dashboard.vue` in the FireUX app as a thin wrapper `<CoreDashboard />` (like Misebox), or rely on core layout key if already registered.
- Validate the `/dashboard` route renders with the simplified nav and user pages.
