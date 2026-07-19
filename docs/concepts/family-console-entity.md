Console entity family map
Updated: 2026-07-19
Ref: 565ebd668
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
- Target collections expose and propagate an explicit
  `idle|pending|error|empty|ready` outcome.
- A target read failure is not an empty authority list and cannot invalidate
  the persisted selection.
- May have an access/team surface when the entity has a current collaboration
  lifecycle.
- Should keep index/overview/identity/operations separated; add team only when
  that lifecycle is real.
- Root-plus-app console entities can share level-one buckets:
  `app_scope`, `visibility`, `identity`, then domain-owned operation config.
- Core owns shared bucket model names in `fireux-core`; domain packages own their operation namespaces and readers until reuse is proven.

Different:
- Blank is the minimal mirror and should stay thin.
- Kitchen has menu, dish, recipe, ingredient, mise, order, station, supplier operations.
- Supplier has item, catalogue, ingredient operations.
- Portfolio is public-light/private-heavy and relates to documents, tasks, compliance.
- Property currently has lower priority and may lag.
- Project is the root-only exception. It relates to root App and Ecosystem
  entities rather than owning an app-scoped Project record or kitchen-style
  inventory operations.
- Project is a read-only FireUX control-plane console today. Every retained
  route requires current FireUX App admin, and collection reads pass through
  `/api/internal/control/projects`; there is no `project_ids`, root operator
  list, Project team page, or client Project mutation scaffold.
- Apps and Ecosystems displayed under Project point inward with `project_id`;
  Project stores no singular inverse links.

Shared component naming:
- `ConsoleXIndex`
- `ConsoleXIndexSelected`
- `ConsoleXIndexTargets`
- `ConsoleXOverview`
- `ConsoleXTeam`, only for families with a real team lifecycle

Open questions:
- Exact operation child matrix still needs cleanup.
- Operator/claim panels need a tighter shared mental model.
- Older flat root fields still exist in stored data; readers may bridge them while families migrate.
