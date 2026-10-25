# Pages

Updated: 2026-10-25
Ref: ce2861c77
Role: map, not canon

## Purpose

Map how route pages should be built and where consensus is still forming.

## Vertical links

- Parent: nuxt4.md
- Child: family-entity-collection-page.md
- Child: family-entity-detail.md
- Child: family-workspace-entity.md
- Child: family-menu.md

## Horizontal links

- layouts.md
- components.md
- composables.md
- debug.md
- search-visibility.md

## Current convention

- A page owns route metadata, route outcome and high-level domain composition.
  Shared chrome belongs to a Nuxt layout or a named family composition; see
  [layouts](layouts.md) before changing route framing.
- Workspace route pages set `layout: false` and `workspacePage: true`.
  [AppShell](../../packages/core/fireux-core/src/runtime/app/components/Shell.vue)
  selects Core's Workspace composition, whose page frame owns the nested
  `<NuxtPage />` outlet. Workspace pages provide route content.
- Core supplies the app-wide Nuxt page transition and disables it for Workspace
  routes through
  [pages-config.ts](../../packages/core/fireux-core/src/config/module/pages-config.ts)
  so the shared frame remains mounted. Do not re-enable per-page transitions
  without a proved route contract.
- A rendered page must compile to one real root node when Nuxt page transitions
  are active.
  Keep authored comments outside `<template>` and wrap true sibling roots;
  redirect-only routes opt out because they have no visible page to animate.
- Page should delegate domain display to named components.
- Page should use composables for data and state.
- Page should not become a heavy script that calculates many tiny display props.
- Page-descendant components keep their own bounded data responsibility. In
  development, each responsible child may expose the objects it fetched or
  received and the values it derived; the page does not aggregate every
  child's internals into one debug payload. See `debug.md`.
- Use `useRouteParam('<key>')` for normalized route params instead of repeating
  `String(route.params.x || '').trim()`.
- Use `readRouteParam(route.params.<key>)` for a setup-time snapshot that does
  not need a reactive computed. Both seams select the first array value and
  normalize it to a trimmed string.
- Do not migrate deliberately untrimmed public identifiers or route-projection
  grammar as mechanical cleanup. Review their 404, canonical, redirect, and
  sitemap effects as an explicit route/SEO decision first.

## Common route families

- Entity Collection Page: `/xs`.
- Entity Detail: `/xs/[id-or-slug]`.
- Factual workspace-operation index: `/operations`; entries point to working
  `/workspace/*` operation routes and are distinct from authored `/solutions`.
  One app-wide index groups entries by Workspace and may expose stable anchors.
  Operations with app-wide unique public slugs open catalogue-backed
  `/operations/<slug>` detail surfaces whose CTA preserves the working Workspace
  route as evidence. Do not duplicate the index under domain routes such as
  `/kitchen/operations`.
- Workspace index: `/workspace/x`.
- Workspace child operation: `/workspace/x/<operation>`.
- Dashboard/admin/dev surfaces where packages expose them.

## Dashboard overview notes

- Core owns the shared `/dashboard` route shell and the named Dashboard Overview
  component family. Projects compose that route rather than forking an app-local
  overview.
- The User layer is universal. The Ecosystem layer appears only for an explicit
  `ecosystemId` relationship, and the current App layer is universal.
- User, private-account, canonical-App, and App-membership outcomes stay
  independent so a scoped read failure cannot hide a valid public User.
- Start at `packages/core/fireux-core/src/runtime/components/Dashboard/Overview.vue`
  and `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue`.

## Dashboard profile notes

- Core owns the shared `/dashboard/user-profile` route and its named `User/Edit`
  components. Projects consume that Profile hub rather than forking it app by
  app.
- Public User and owner-private account outcomes remain independent on the
  route. Only canonical public User identity is editable there: photo, display
  name, handle, and the optional 280-character bio. The private section is a
  read-only account summary; Settings owns session actions. AppUser membership
  and entitlements are not presented as editable profile fields.
- The signed-in Profile header may show the derived highest current-App access
  badge. It never stores or publishes that App-private authority on User.
- A signed-in user may also see that private derived badge on their own public
  User detail page. It is not part of the public User DTO and is not shown to
  other visitors.
- Specialist profile entries are navigation to their owning domain editors.
  Their documents add domain details and never duplicate root User identity.

## Dashboard family notes

- Core exposes only dashboard routes backed by a real read or write authority.
  Data-less social, commerce, or messaging promises do not belong in the shared
  sidebar; add them when an owning package provides a bounded outcome contract.
- App and extension administration stays in named route pages and advertises
  itself through `adminSurface` route metadata. The shared Admin dashboard
  discovers those enabled tools; it does not hard-code optional domains.
- Start at `packages/core/fireux-core/src/runtime/app/components/Dashboard/Admin.vue`,
  `packages/core/fireux-core/src/runtime/composables/navigation/useDashboardNav.ts`,
  and the enabled package pages under `src/runtime/pages/dashboard`.

## Index page notes

- Root Entity Collection Pages visibly compose native `UPage`, an introduction,
  and `UPageBody` with named State, Entity Collection, pagination and diagnostics.
- One owning reader or page composable acquires the collection; the Collection
  receives canonical records and owns presentation. Existing specialized
  Directory/manager surfaces retain their inspected lifecycle until migrated.
- Layouts own shared framing. Workspace uses Core's existing route outlet;
  do not introduce a custom universal page shell.
- Scoped child routes should use named scoped surfaces, not root collection managers with scoped override data.
- Workspace indexes render their domain `WorkspaceXIndex` as content inside the
  shared Core frame; group navigation uses `WorkspacePageLinks`.
- Internal dev previews and component labs live under `/dev`.
- `/demo` is reserved for a project's public Product Demo index and its guided
  child demonstrations. These pages are project-owned, remain thin, and use
  the named Product Demo adapter described in `demo-data.md`; they never read
  Workspace fixtures directly or present Demo World as live public truth.

## Detail page notes

- Preferred emerging order: header, profile, main, operator/actions, dev debug.
- This is not fully settled across every entity yet.

## Family delta rule

- Workspace route shells follow `workspace.md`; domain differences live below the
  route page.
- Entity Collection Page presentation and authority differences live in
  `family-entity-collection-page.md`.
- Entity Detail route identity and operator-panel differences live in
  `family-entity-detail.md`.
- Tenant route omission versus global explicit scope lives in
  `family-tenant-global.md`.
- Menu routes use the stronger guarded contract in `family-menu.md`.
- A page-level difference not explained by one of those maps is drift, not an
  automatic app-specific exception.

## Alignment roadmap

- Now: keep route pages thin and preserve truthful route/HTTP outcomes.
- Next: classify remaining Entity Collection Pages and settle detail route identity per
  entity.
- Later: guard page families only after their structural and product deltas are
  explicit.

The unresolved Entity Detail members and Menu migrations are registered in
their family maps. Do not maintain a second question list here.
