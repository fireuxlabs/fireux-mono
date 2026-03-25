# Layouts Directory

Authority: Operational  
Updated: 2026-03-25  
Scope: `packages/*/fireux-*/src/runtime/layouts` and actual runtime layout usage across `packages/` and `projects/`.

This directory documents the real runtime layout system, not an abstract ideal.

## Current Repo Truth

Most runtime layouts are owned by `fireux-core`.

Current layout files found:

- `packages/core/fireux-core/src/runtime/layouts/auth.vue`
- `packages/core/fireux-core/src/runtime/layouts/changelog.vue`
- `packages/core/fireux-core/src/runtime/layouts/chat.vue`
- `packages/core/fireux-core/src/runtime/layouts/console.vue`
- `packages/core/fireux-core/src/runtime/layouts/dashboard.vue`
- `packages/core/fireux-core/src/runtime/layouts/default.vue`
- `packages/core/fireux-core/src/runtime/layouts/design.vue`
- `packages/core/fireux-core/src/runtime/layouts/dev.vue`
- `packages/core/fireux-core/src/runtime/layouts/docs.vue`
- `packages/core/fireux-core/src/runtime/layouts/landing.vue`
- `packages/core/fireux-core/src/runtime/layouts/portfolio.vue`
- `packages/core/fireux-core/src/runtime/layouts/starter.vue`
- `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-menu.vue`

Repo truth today:

- `fireux-core` owns the shared layout system.
- `fireux-kitchens` owns one specialized public menu layout.
- no other package currently ships its own runtime layout file.
- older notes that imply `fireux-granite` has its own `runtime/layouts/` are no longer accurate.

## Active Layouts

### Core Shared Layouts

#### `default`

File:
- `packages/core/fireux-core/src/runtime/layouts/default.vue`

Status:
- active
- the main neutral public shell

Current role:
- header
- centered `UContainer`
- page content
- footer

Used by:
- public entity pages
- create pages
- learn-more pages
- many FireUX app public operational pages

#### `landing`

File:
- `packages/core/fireux-core/src/runtime/layouts/landing.vue`

Status:
- active

Current role:
- landing/home/pricing/get-started shell

Important note:
- after the default-layout rollback on 2026-03-25, `landing` and `default` are currently functionally identical
- they differ by route intent, not by implementation

Used by:
- ecosystem landing pages
- tenant home pages
- pricing/about/get-started families

#### `dashboard`

File:
- `packages/core/fireux-core/src/runtime/layouts/dashboard.vue`

Status:
- active

Current role:
- authenticated workspace shell
- profile-aware left nav
- shared footer actions
- notifications slideover

Used by:
- core dashboard pages
- chef dashboard
- agent dashboard
- professional dashboard
- supplier dashboard

#### `console`

File:
- `packages/core/fireux-core/src/runtime/layouts/console.vue`

Status:
- active

Current role:
- console shell for kitchen, portfolio, supplier, project, product, and admin console surfaces
- entry-mode support via `route.meta.consoleEntry`
- scoped console nav
- shared footer actions and notifications

Used by:
- kitchen console
- supplier console
- portfolio console
- project console
- product/blog admin console routes

#### `dev`

File:
- `packages/core/fireux-core/src/runtime/layouts/dev.vue`

Status:
- active

Current role:
- developer runtime shell
- left dev nav
- isolated dev route surface

Used by:
- core dev pages
- extension dev pages
- ecosystem dev pages

#### `auth`

File:
- `packages/core/fireux-core/src/runtime/layouts/auth.vue`

Status:
- active

Current role:
- minimal auth-only shell
- client-only page render

Used by:
- `packages/core/fireux-core/src/runtime/pages/auth.vue`

#### `docs`

File:
- `packages/core/fireux-core/src/runtime/layouts/docs.vue`

Status:
- active

Current role:
- documentation content shell
- left navigation from `queryCollectionNavigation('fireuxDocs')`
- docs-specific hero/header band

Used by:
- `packages/ecosystem/fireux-fireux/src/runtime/pages/docs/index.vue`
- `packages/ecosystem/fireux-fireux/src/runtime/pages/docs/[...slug].vue`

#### `design`

File:
- `packages/core/fireux-core/src/runtime/layouts/design.vue`

Status:
- active by reference, but suspicious in implementation

Current role:
- used by FireUX design atom pages

Important note:
- this layout currently renders `<CoreDefault />`
- no `CoreDefault` component or file is found elsewhere in the repo
- so `design` should be treated as a verification target, not clean canon

Used by:
- `projects/fireux/fireux-app/app/pages/design/atoms/colors.vue`
- `projects/fireux/fireux-app/app/pages/design/atoms/img.vue`
- `projects/fireux/fireux-app/app/pages/design/atoms/tokens.vue`
- `projects/fireux/fireux-app/app/pages/design/atoms/typography.vue`

### Extension-Owned Specialized Layout

#### `kitchen-menu`

File:
- `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-menu.vue`

Status:
- active

Current role:
- public kitchen menu delivery shell
- narrow content width
- minimal footer

Used by:
- `packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[id]/menu/[[menuId]].vue`

## Unused Layouts

These layout files exist, but no page currently references them.

### `changelog`

File:
- `packages/core/fireux-core/src/runtime/layouts/changelog.vue`

Status:
- unused

Shape:
- content/docs-style layout with injected navigation

Assessment:
- likely stale
- overlaps with the active `docs` family

### `chat`

File:
- `packages/core/fireux-core/src/runtime/layouts/chat.vue`

Status:
- unused

Shape:
- client-only shell with default header/footer and free page center

Assessment:
- likely stale
- no current route family proves its need

### `portfolio`

File:
- `packages/core/fireux-core/src/runtime/layouts/portfolio.vue`

Status:
- unused

Shape:
- older wrapper with explicit `menuBarLinks` and `mobileLinks` props passed into header

Assessment:
- legacy
- predates the cleaner shared shell direction

### `starter`

File:
- `packages/core/fireux-core/src/runtime/layouts/starter.vue`

Status:
- unused

Shape:
- another old wrapper with explicit nav prop wiring

Assessment:
- legacy
- no live route family depends on it

## Similarity Groups

### Neutral Public Shells

- `default`
- `landing`
- `design` (intended)

Shared idea:
- public-facing wrapper around `NuxtPage`
- header + body + footer

Important difference:
- `default` and `landing` are currently identical in implementation
- `design` is meant to sit in this family, but its implementation looks stale

### Operational Shells

- `dashboard`
- `console`
- `dev`

Shared idea:
- full-height application shell
- sidebar-driven navigation
- operational rather than public browsing

Important differences:
- `dashboard` is user/profile workspace
- `console` is scoped operational runtime for console entities
- `dev` is developer tooling/navigation

### Content / Specialty Shells

- `auth`
- `docs`
- `kitchen-menu`
- `changelog` (unused)

Shared idea:
- narrow-purpose layout with a very specific delivery job

## Important Diffs

### `default` vs `landing`

Current repo truth:
- no meaningful implementation difference today

Interpretation:
- they are separate mostly for semantic route intent
- if a future styling split is needed, `landing` is the safe place to do it
- until then, they should stay visually simple

### `dashboard` vs `console`

Shared mechanics:
- `UDashboardGroup`
- sidebar nav
- footer actions
- notifications slideover

Key difference:
- `dashboard` is profile/workspace oriented
- `console` is scoped entity-operation oriented

### `docs` vs `changelog`

Shared mechanics:
- content navigation
- content-first delivery

Key difference:
- `docs` is active and wired
- `changelog` is currently unreferenced and should not be treated as active canon

### Core-owned vs package-owned

Current repo truth:
- almost all layout names are implemented centrally in `fireux-core`
- feature packages mainly reference those layout names from pages
- `kitchen-menu` is the only current example of a package genuinely owning a specialized runtime layout

## Guidance

1. Keep the shared layout system centered in `fireux-core`.
2. Add a package-owned layout only when the package truly owns a unique delivery shell.
3. Do not keep unused layout files around as silent canon.
4. Treat `design.vue` as a cleanup target because its implementation does not match current repo reality.
5. Treat `default` and `landing` as intentionally simple until a real visual split is needed.

## Short Version

The real layout system is:

- shared core shells: `default`, `landing`, `dashboard`, `console`, `dev`, `auth`, `docs`
- one active package-owned specialized shell: `kitchen-menu`
- four currently unused legacy files: `changelog`, `chat`, `portfolio`, `starter`
- one suspicious active alias: `design`
