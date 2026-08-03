# Pages

Updated: 2026-08-03
Ref: 8287d99bb
Role: map, not canon

## Purpose

Map how route pages should be built and where consensus is still forming.

## Vertical links

- Parent: nuxt4.md
- Child: family-public-index.md
- Child: family-public-detail.md
- Child: family-console-entity.md
- Child: family-menu.md

## Horizontal links

- layouts.md
- components.md
- composables.md
- debug.md
- search-visibility.md

## Current convention

- Page owns route shell, metadata, layout, and high-level composition.
- Layout owns shared chrome; see `layouts.md` before changing layout behavior.
- Core supplies the app-wide Nuxt page transition without changing route
  ownership or URLs. Use `definePageMeta({ pageTransition: false })` only for a
  genuine route-level exception; do not rebuild the shared transition in a
  page.
- A rendered page must compile to one real root node for Nuxt transitions.
  Keep authored comments outside `<template>` and wrap true sibling roots;
  redirect-only routes opt out because they have no visible page to animate.
- Page should delegate domain display to named components.
- Page should use composables for data and state.
- Page should not become a heavy script that calculates many tiny display props.
- Use `useRouteParam('<key>')` for normalized route params instead of repeating
  `String(route.params.x || '').trim()`.
- Use `readRouteParam(route.params.<key>)` for a setup-time snapshot that does
  not need a reactive computed. Both seams select the first array value and
  normalize it to a trimmed string.
- Do not migrate deliberately untrimmed public identifiers or route-projection
  grammar as mechanical cleanup. Review their 404, canonical, redirect, and
  sitemap effects as an explicit route/SEO decision first.

## Common route families

- Public index: `/xs`.
- Public detail: `/xs/[id-or-slug]`.
- Factual console-operation index: `/operations`; entries point to working
  `/console/*` operation routes and are distinct from authored `/solutions`.
  One app-wide index groups entries by Console and may expose stable anchors.
  Operations with app-wide unique public slugs open catalogue-backed
  `/operations/<slug>` detail surfaces whose CTA preserves the working Console
  route as evidence. Do not duplicate the index under domain routes such as
  `/kitchen/operations`.
- Console index: `/console/x`.
- Console child operation: `/console/x/<operation>`.
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
  read-only account summary; Settings owns session actions. UserApp membership
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
- Start at `packages/core/fireux-core/src/runtime/components/Dashboard/Admin.vue`,
  `packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/useDashboardNav.ts`,
  and the enabled package pages under `src/runtime/pages/dashboard`.

## Index page notes

- Public/root entity indexes should use `XCollectionManager`.
- `XCollectionManager` should fetch the root/public entity collection itself.
- Scoped child routes should use named scoped surfaces, not root collection managers with scoped override data.
- Console indexes render `ConsoleXIndex`.
- Internal dev previews and component labs live under `/dev`.
- `/demo` is reserved for a project's public Product Demo index and its guided
  child demonstrations. These pages are project-owned, remain thin, and use
  the named Product Demo adapter described in `demo-data.md`; they never read
  Console fixtures directly or present Demo World as live public truth.

## Detail page notes

- Preferred emerging order: header, profile, main, operator/actions, dev debug.
- This is not fully settled across every entity yet.

## Family delta rule

- Console route shells follow `console.md`; domain differences live below the
  route page.
- Public index presentation and authority differences live in
  `family-public-index.md`.
- Public detail route identity and operator-panel differences live in
  `family-public-detail.md`.
- Tenant route omission versus global explicit scope lives in
  `family-tenant-global.md`.
- Menu routes use the stronger guarded contract in `family-menu.md`.
- A page-level difference not explained by one of those maps is drift, not an
  automatic app-specific exception.

## Alignment roadmap

- Now: keep route pages thin and preserve truthful route/HTTP outcomes.
- Next: classify remaining public indexes and settle detail route identity per
  entity.
- Later: guard page families only after their structural and product deltas are
  explicit.

The unresolved public-detail members and Menu migrations are registered in
their family maps. Do not maintain a second question list here.
