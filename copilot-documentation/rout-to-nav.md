# Route-to-Nav Migration Guide

Purpose: Document the shift from hard-coded route helpers to meta-driven navigation, list the files changed/removed, and outline simplifications and next steps.

Effective: 2025-09-30

Repo: fireux-mono

---

## Goals

- Replace ad-hoc tenant/extension “routes” helpers with a centralized, meta-driven navigation system.
- Keep core open and extensible: tenants can introduce custom groups, areas, and roles without changing core.
- Centralize gating in one place (useNavIndex) and keep selectors dumb (default header vs dashboard sidebar).

## New navigation model

- Page meta carries nav information using `defineNav` (preferred) or `definePageMeta`:
  - key: string (unique)
  - label?: string
  - icon?: string
  - group?: string (open-ended)
  - order?: number
  - area?: string ("default" | "dashboard" | custom)
  - desktop?: boolean
  - mobile?: boolean
- Central index: `packages/core/fireux-core/src/runtime/composables/app/nav/useNavIndex.ts`
  - Normalizes router records → `NormalizedNavItem[]`
  - Gates by tenant, requiresAuth, and arbitrary roles with admin fallback
- Selectors:
  - `useNavDefault()` → header desktop/mobile links
  - `useDashboardNav()` → dashboard sidebar links (area: 'dashboard' or path prefix '/dashboard')

## Type changes (open-ended)

File: `packages/core/fireux-core/src/runtime/types/nav.ts`

- NavArea, NavGroup, NavRole simplified to string-based usage
- Interfaces:
  - `NavMeta`, `NormalizedNavItem` accept `group: string`, `area: string`, `roles: string[]`
- Optional convenience constants:
  - `export const NAV_GROUP = { Core: 'Core', User: 'User', Admin: 'Admin' } as const`

## Role gating

File: `packages/core/fireux-core/src/runtime/composables/app/nav/useNavIndex.ts`

- Pull `roles` from `useUser()` when available
- If a route specifies roles, allow access if user has ANY of them or is admin
- Still respects `tenant` and `requiresAuth`

## Files changed

Core:

- Edited: `runtime/types/nav.ts` (open-ended types)
- Edited: `runtime/composables/app/nav/useNavIndex.ts` (generic role gating)
- Verified: `runtime/composables/app/nav/useDashboardNav.ts` (area aware)
- No changes needed: `runtime/composables/app/nav/defineNav.ts`, `useNavDefault.ts`

Tenants/Extensions: switched layouts to core nav, removed route helpers

- Misebox layouts:
  - `MiseboxDefault.vue` → now `<CoreDefault />`
  - `MiseboxDashboard.vue` → now `<CoreDashboard />`
  - `MiseboxDev.vue` → now `<CoreDefault />`
- Cleanbox layouts:
  - `CleanboxDefault.vue` → now `<CoreDefault />`
  - `CleanboxDev.vue` → now `<CoreDefault />`
  - `CleanboxDashboard.vue` unchanged (already uses CoreDashboard)
- Fireux layouts:
  - `FireuxDefault.vue` → now `<CoreDefault />`
  - `FireuxDashboard.vue` unchanged

## Files removed (source)

- Tenants
  - Misebox: `useMiseboxRoutes.ts`, `useMiseboxDefaultRoutes.ts`, `useMiseboxDashboardRoutes.ts`, `useMiseboxDevRoutes.ts`
  - Cleanbox: `useCleanboxRoutes.ts`, `useCleanboxDevRoutes.ts`
  - Fireux: `useFireuxRoutes.ts`, `useFireuxDefaultRoutes.ts`, `useFireuxDashboardRoutes.ts`
- Extensions
  - Jobs: `useJobRoutes.ts`, `useJobDashboardRoutes.ts`
- Core
  - Legacy `composables/app/routes/` folder (previous session)
  - `runtime/types/routeLink.ts` (replaced with local interfaces where needed, now fully removed)

Note: Legacy dist artifacts may still list deleted files until packages are republished; source has been removed.

## What’s up for deletion in docs

- `copilot-documentation/routes.md` historical content references the old routes helpers
- `copilot-documentation/navigation-map.md` sections referencing tenant route merging
- `docs/layouts-and-routes.md` code samples importing tenant route helpers

Action: Update to reflect meta-driven nav with `defineNav`, `useNavIndex`, `useNavDefault`, `useDashboardNav`.

## Concept merges and simplifications

- Merge “routes helpers” into page meta + selectors. No more tenant/extension route composables needed.
- Single source of truth for nav items is the route meta.
- Gating lives only in `useNavIndex`.
- Tenants and extensions only supply page meta and optional custom groups/areas/roles via strings.

## How to add a new nav item

- In a page component:
  ```ts
  defineNav({
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-chef-hat',
    group: 'Misebox',
    order: 10,
    area: 'default',
    desktop: true,
    mobile: true,
  })
  ```
- For dashboard:
  ```ts
  defineNav({
    key: 'chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    group: 'Profiles',
    order: 20,
    area: 'dashboard',
    desktop: false,
    mobile: true,
  })
  // and ensure the page uses layout: 'dashboard'
  ```

## Next steps

- Sweep docs and replace any route helper mentions with nav meta approach.
- Ensure tenant pages that should appear in header or dashboard have proper `defineNav` meta.
- Optionally add tenant-specific groups to NAV_GROUP constants for convenience (types remain open).
- Consider simple tests for `useNavIndex` gating given mocked `useUser().roles`.
