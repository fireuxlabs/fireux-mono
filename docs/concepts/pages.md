Pages spine map
Updated: 2026-07-21
Ref: b020f805e
Role: map, not canon

<!-- Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: map the factual capability index route. -->
<!-- Concurrent edit — 2026-07-21 13:08 CEST — Operation detail surfaces: map catalogue-backed factual detail routes. -->
<!-- Concurrent edit — 2026-07-21 14:50 CEST — Dashboard Overview pass: map the shared three-layer dashboard route contract. -->
<!-- Concurrent edit — 2026-07-21 15:46 CEST — User Profile polish: map the root-identity-only dashboard editor contract. -->
<!-- Concurrent edit — 2026-07-21 16:03 CEST — User bio pass: map biography editing and rendering across shared User routes. -->
<!-- Concurrent edit — 2026-07-21 17:10 CEST — Dashboard Family pass: map capability-backed route and admin-surface discovery boundaries. -->

Purpose:
Map how route pages should be built and where consensus is still forming.

Vertical links:

- Parent: nuxt4.md
- Child: family-public-index.md
- Child: family-public-detail.md
- Child: family-console-entity.md
- Child: family-menu.md

Horizontal links:

- layouts.md
- components.md
- composables.md
- debug.md

Current convention:

- Page owns route shell, metadata, layout, and high-level composition.
- Layout owns shared chrome; see `layouts.md` before changing layout behavior.
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

Common route families:

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

Dashboard overview notes:

- Core owns the shared `/dashboard` route shell and the named Dashboard Overview
  component family. Projects compose that route rather than forking an app-local
  overview.
- The User layer is universal. The Ecosystem layer appears only for an explicit
  `ecosystemId` relationship, and the current App layer is universal.
- User, private-account, canonical-App, and App-membership outcomes stay
  independent so a scoped read failure cannot hide a valid public User.
- Start at `packages/core/fireux-core/src/runtime/components/Dashboard/Overview.vue`
  and `packages/core/fireux-core/src/runtime/pages/dashboard/index.vue`.

Dashboard profile notes:

- Core owns the shared `/dashboard/user-profile` route and its named `User/Edit`
  components. Projects consume that editor rather than forking it app by app.
- The route edits only canonical public User identity: photo, display name,
  handle, and the optional 280-character bio. Private account preferences remain in Settings; UserApp membership
  and entitlements are not presented as editable profile fields.
- Specialist profile entries are navigation to their owning domain editors.
  Their documents add domain details and never duplicate root User identity.

Dashboard family notes:

- Core exposes only dashboard routes backed by a real read or write authority.
  Data-less social, commerce, or messaging promises do not belong in the shared
  sidebar; add them when an owning package provides a bounded outcome contract.
- App and extension administration stays in named route pages and advertises
  itself through `adminSurface` route metadata. The shared Admin dashboard
  discovers those enabled tools; it does not hard-code optional domains.
- Start at `packages/core/fireux-core/src/runtime/components/Dashboard/Admin.vue`,
  `packages/core/fireux-core/src/runtime/composables/fireux/app/ui/nav/useDashboardNav.ts`,
  and the enabled package pages under `src/runtime/pages/dashboard`.

Index page notes:

- Public/root entity indexes should use `XCollectionManager`.
- `XCollectionManager` should fetch the root/public entity collection itself.
- Scoped child routes should use named scoped surfaces, not root collection managers with scoped override data.
- Console indexes render `ConsoleXIndex`.
- Dev/demo pages should live under `/dev`, not ad hoc `/demo`.

Detail page notes:

- Preferred emerging order: header, profile, main, operator/actions, dev debug.
- This is not fully settled across every entity yet.

Open questions:

- Exact public detail spine still needs alignment across all entities.
- Menu public routes are actively evolving and should be handled carefully.
