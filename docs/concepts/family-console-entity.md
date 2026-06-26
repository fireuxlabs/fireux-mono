Console entity family map
Updated: 2026-06-26
Ref: 1fa0ab5dc
Role: map, not canon

Purpose:
Map similarities and differences across console-capable entities.

Vertical links:
- Parent: console.md
- Child: family-tenant-global.md

Horizontal links:
- pages.md
- components.md
- composables.md
- firestore-entity.md

Current family members:
- Blank
- Kitchen
- Supplier
- Portfolio
- Property
- Project

Similar:
- Has or can have console index.
- Has selected target concept.
- Uses shared console primitives where possible.
- Should have access/team surface.
- Should keep index/overview/identity/team/operations separated.
- Root-plus-app console entities can share level-one buckets:
  `app_scope`, `visibility`, `identity`, then domain-owned operation config.
- Core owns shared bucket model names in `fireux-core`; domain packages own their operation namespaces and readers until reuse is proven.

Different:
- Blank is the minimal mirror and should stay thin.
- Kitchen has menu, dish, recipe, ingredient, mise, order, station, supplier operations.
- Supplier has item, catalogue, ingredient operations.
- Portfolio is public-light/private-heavy and relates to documents, tasks, compliance.
- Property currently has lower priority and may lag.
- Project relates to App and Ecosystem rather than kitchen-style inventory operations.

Shared component naming:
- `ConsoleXIndex`
- `ConsoleXIndexSelected`
- `ConsoleXIndexTargets`
- `ConsoleXOverview`
- `ConsoleXTeam`

Open questions:
- Exact operation child matrix still needs cleanup.
- Operator/claim panels need a tighter shared mental model.
- Older flat root fields still exist in stored data; readers may bridge them while families migrate.
