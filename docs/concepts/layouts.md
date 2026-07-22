# Layouts spine map

Updated: 2026-07-22
Ref: 796952bf0
Role: map, not canon

## Purpose

Map who renders route content and who owns shared chrome. FireUX currently has
two layout composition shapes; this map makes that delta visible rather than
declaring either one universal without render evidence.

## Links

- Parent: nuxt4.md
- Sibling: pages.md
- Sibling: components.md
- Sibling: app-config.md
- Related family: family-menu.md
- Related family: family-tenant-global.md

## Ownership spine

- `AppShell` owns the outer app composition and currently renders
  `<NuxtLayout><NuxtPage /></NuxtLayout>`.
- A layout owns recurring chrome: header, footer, navigation, shell background,
  sidebar, close control, or tenant frame.
- A page owns route metadata, route outcome, and high-level domain composition.
- A route-family layout may derive shared chrome from route scope, as Menu does
  for its exit control; it must not become the domain data-fetching owner.

## Current composition lanes

### Slot-rendering leaf layouts

These layouts consume the page content supplied by the outer Nuxt layout
composition:

- `packages/extensions/fireux-kitchens/src/runtime/layouts/menu.vue`
- `packages/extensions/fireux-kitchens/src/runtime/layouts/kitchen-menu.vue`
- `projects/fireux/buenohost/app/layouts/property-info.vue`

Their content boundary is `<slot />`. The Menu layout is the clearest package
example: it owns route-family close chrome while the page remains the content
owner.

### Route-rendering shell layouts

Core layouts and several tenant/app layouts currently render `<NuxtPage />`
directly:

- `packages/core/fireux-core/src/runtime/layouts/default.vue`
- `packages/core/fireux-core/src/runtime/layouts/console.vue`
- `packages/ecosystem/fireux-misebox/src/runtime/layouts/misebox-tenant.vue`
- `projects/misebox/la-tap-berne/app/layouts/latap-default.vue`

This is established source, but its relationship with the outer `AppShell`
composition has not been reduced to one documented render contract. Preserve
working routes; do not copy this lane into a new layout merely because Core
currently uses it.

## App-local layouts

- App-local layouts are allowed for real app chrome that is not package truth.
- Compare the nearest package or ecosystem layout first.
- Keep the delta small and name why the chrome cannot be shared.
- Promote it only after another app proves the same contract.

## Delta register

| Difference | State | Reason or alignment trigger |
| --- | --- | --- |
| Package Menu layouts render `<slot />` | `accepted` | The outer shell supplies page content; the package layout adds route-family chrome without rendering another route tree |
| Core and several tenant layouts render `<NuxtPage />` | `to-confirm` | It is current working source, but its relationship to `AppShell` must be verified with render-count and nested-route tests before becoming the universal rule |
| Menu layout derives close behavior from route scope | `accepted` | Exit chrome is shared by the entire Menu route family and remains separate from Menu data fetching |
| App-local branded layouts exist | `accepted` | Brand/navigation chrome can be app-owned; unexplained copies of package chrome remain drift |
| Mechanically replacing every `<slot />` or `<NuxtPage />` | `drift` | Renderer choice depends on which layer already owns page rendering |

## Change checklist

- Name the family: core, dashboard, console, tenant, microsite, Menu, or
  app-local.
- Inspect `AppShell`, the nearest layout sibling, and the route smoke behavior.
- Confirm that route content renders exactly once.
- Keep domain fetches and route-specific business decisions out of the layout.
- Keep shared route-family chrome out of individual pages.

## Alignment roadmap

### Now

- Preserve the proven renderer for a touched working layout.
- Require every new layout to name its composition owner and sibling.

### Next

- Add focused route smoke specimens for one slot-rendering package layout and
  one route-rendering Core layout.
- Verify nested routes, hydration, and single-render behavior under `AppShell`.

### Later

- Choose and guard one renderer per proven layout lane.
- Align existing layouts only after the render contract is demonstrated, not
  as a cosmetic syntax sweep.
