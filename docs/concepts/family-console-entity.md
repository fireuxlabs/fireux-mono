Console entity family map
Updated: 2026-07-20
Ref: a4d382c1d
Role: map, not canon
<!-- Concurrent edit — 2026-07-19 16:55 CEST — Repo Efficiency Pass 5 of 6: console target family seam. -->
<!-- Concurrent edit — 2026-07-20 16:34 CEST — Console Spine pass: align family selection, targeted reads, permissions, and real lifecycle surfaces. -->
<!-- Concurrent edit — 2026-07-20 22:58 CEST — Both-Entity Authority: fail closed on incomplete or wrong-App targets, withhold unsafe lifecycle mutations, and mark Kitchen migration input. -->
<!-- Concurrent edit — 2026-07-20 23:33 CEST — Entity Vocabulary + Matrix Pass: describe root identity and App support as separate axes. -->

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
- Named target wrappers share `ConsoleTargetCollection` presentation while
  retaining domain card mapping, selection validation, copy, and actions.
- A target read failure is not an empty authority list and cannot invalidate
  the persisted selection.
- Global App membership pending/error is part of that target outcome; access
  failure cannot collapse into an empty family collection.
- ID-scoped Supplier, Portfolio, and Property targets load exact root records
  and same-id App access records. Only complete pairs whose root names the
  current App can enter selection; pair or scope drift produces an error and no
  selectable row. Property manual secrets are a separate private detail read
  and never participate in target collection loading.
  Public browse remains a separate projection/Rules decision; a raw root
  collection read does not become authorized merely because a root exists.
- May have an access/team surface when the entity has a current collaboration
  lifecycle.
- Should keep index/overview/identity/operations separated; add team only when
  that lifecycle is real.
- Root entities with App support records can share level-one buckets:
  `app_scope`, `visibility`, `identity`, then domain-owned operation config.
- Core owns shared bucket model names in `fireux-core`; domain packages own their operation namespaces and readers until reuse is proven.
- Console runtime derives `canWrite` from source/read-only state and current
  operator authority. Visible controls reflect it, and every console mutation
  must enforce it. Supplier, Portfolio, and Property identity helpers use fixed
  paths; generic access mutations and independent lifecycle deletes are not
  exported. Client write authorization is still incomplete until the owner
  database has reviewed Rules or a trusted server mutation boundary.

Different:
- Blank is the minimal mirror and stays thin: index, overview, and creation,
  with no invented Identity or Team lifecycle.
- Kitchen has menu, dish, recipe, ingredient, mise, order, station, supplier operations.
- Kitchen's target App model is access-only, but its legacy stored duplicate
  identity and compatibility composer remain migration input; Supplier,
  Portfolio, and Property are the current strict root + App-support read references.
- Kitchen keeps live and demo target outcomes separate and composes one shared
  target presenter per source.
- Supplier has item, catalogue, ingredient operations.
- Portfolio is public-light/private-heavy and relates to documents, tasks, compliance.
- Property retains its confirmed console entity sheets; prototype guest-guide
  and fake Saved/QR routes are not part of the family contract.
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
- Older duplicated root/App fields still exist in stored data. Reconcile them
  with a reviewed migration; do not restore compatibility merging in readers.
