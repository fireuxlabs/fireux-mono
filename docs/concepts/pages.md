Pages spine map
Updated: 2026-06-17
Ref: dece0dcde
Role: map, not canon

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

Common route families:
- Public index: `/xs`.
- Public detail: `/xs/[id-or-slug]`.
- Console index: `/console/x`.
- Console child operation: `/console/x/<operation>`.
- Dashboard/admin/dev surfaces where packages expose them.

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
